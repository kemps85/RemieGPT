import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import chokidar from "chokidar";

const MAX_STARTUP_BYTES = 256 * 1024;
const STALE_TASK_MS = 30 * 60 * 1000;
const MIN_WRITING_VISIBLE_MS = 220;

function contentTypes(record) {
  const content = record?.message?.content;
  if (!Array.isArray(content)) return [];
  return content.map((item) => item?.type).filter(Boolean);
}

export function classifyCodexRecord(record) {
  const outer = record?.type ?? "";
  const payload = record?.payload ?? {};
  const type = payload.type ?? "";

  if (/error|fail|abort|cancel|denied|blocked/i.test(`${outer} ${type}`)) {
    return "stop";
  }
  if (
    outer === "response_item" &&
    type === "function_call" &&
    /request_user_input|ask_user|approval/i.test(payload.name ?? "")
  ) {
    return "waiting";
  }
  // Codex writes the text that actually appears in the conversation as a
  // response item. This is the moment Remi should start the writing animation.
  if (
    outer === "response_item" &&
    type === "message" &&
    (payload.role === "assistant" || payload.role === undefined)
  ) {
    return "writing";
  }
  if (outer !== "event_msg") return null;
  if (/request_user_input|needs_user_input|approval_request/i.test(type)) {
    return "waiting";
  }
  if (
    type === "task_started" ||
    type === "user_message" ||
    type === "agent_reasoning"
  ) {
    return "thinking";
  }
  // Any assistant text that Codex adds to the visible conversation — interim
  // commentary or the final answer — is writing. A following reasoning event
  // immediately moves Remi back to thinking.
  if (type === "agent_message") return "writing";
  if (type === "task_complete") return "stop";
  return null;
}

export function classifyClaudeRecord(record) {
  const type = record?.type ?? "";
  const subtype = record?.subtype ?? "";
  const parts = contentTypes(record);

  if (/error|fail|abort|cancel|denied|blocked/i.test(`${type} ${subtype}`)) {
    return "stop";
  }

  if (
    type === "user" &&
    record?.message?.role === "user" &&
    !parts.includes("tool_result")
  ) {
    return "thinking";
  }

  if (
    type === "assistant" &&
    Array.isArray(record?.message?.content) &&
    record.message.content.some(
      (item) =>
        item?.type === "tool_use" &&
        /askuserquestion|request_user_input|approval/i.test(item?.name ?? "")
    )
  ) {
    return "waiting";
  }

  if (
    type === "assistant" &&
    record?.message?.role === "assistant" &&
    parts.includes("text")
  ) {
    return "writing";
  }

  if (
    type === "assistant" &&
    record?.message?.role === "assistant" &&
    parts.includes("thinking")
  ) {
    return "thinking";
  }

  if (type === "system" && subtype === "stop_hook_summary") {
    return "stop";
  }

  return null;
}

function readChunk(filePath, start) {
  const stat = fs.statSync(filePath);
  if (stat.size <= start) return { text: "", size: stat.size };

  const length = stat.size - start;
  const buffer = Buffer.alloc(length);
  const handle = fs.openSync(filePath, "r");
  try {
    fs.readSync(handle, buffer, 0, length, start);
  } finally {
    fs.closeSync(handle);
  }
  return { text: buffer.toString("utf8"), size: stat.size };
}

function parseCompleteLines(text) {
  const lastNewline = text.lastIndexOf("\n");
  if (lastNewline < 0) return { records: [], rest: text };

  const complete = text.slice(0, lastNewline);
  const rest = text.slice(lastNewline + 1);
  const records = [];

  for (const line of complete.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      records.push(JSON.parse(line));
    } catch {
      // Ignore corrupt historical lines without reading their contents.
    }
  }
  return { records, rest };
}

class JsonlSource {
  constructor({ name, root, classify, onChange }) {
    this.name = name;
    this.root = root;
    this.classify = classify;
    this.onChange = onChange;
    this.files = new Map();
    this.watcher = null;
  }

  start() {
    this.watcher = chokidar.watch(this.root, {
      ignoreInitial: false,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 25
      }
    });
    this.watcher.on("add", (filePath) => {
      if (path.extname(filePath).toLowerCase() === ".jsonl") {
        this.attach(filePath);
      }
    });
    this.watcher.on("change", (filePath) => {
      if (path.extname(filePath).toLowerCase() === ".jsonl") {
        this.read(filePath);
      }
    });
    this.watcher.on("unlink", (filePath) => {
      if (path.extname(filePath).toLowerCase() === ".jsonl") {
        this.remove(filePath);
      }
    });
    // A protected or temporarily unavailable history folder must only disable
    // this source, never take down the floating companion itself.
    this.watcher.on("error", () => {});
  }

  clearDeferredTransition(state) {
    clearTimeout(state.transitionTimer);
    state.transitionTimer = null;
    state.pendingMode = null;
  }

  emitMode(filePath, state, mode) {
    this.clearDeferredTransition(state);
    if (state.active === mode) return;
    state.active = mode;
    if (mode === "writing") state.writingSince = Date.now();
    this.onChange(`${this.name}:${filePath}`, mode);
  }

  emitAfterWriting(filePath, state, mode) {
    const elapsed = Date.now() - state.writingSince;
    const delay = Math.max(0, MIN_WRITING_VISIBLE_MS - elapsed);
    if (!delay) {
      this.emitMode(filePath, state, mode);
      return;
    }
    state.pendingMode = mode;
    clearTimeout(state.transitionTimer);
    state.transitionTimer = setTimeout(() => {
      state.transitionTimer = null;
      const pendingMode = state.pendingMode;
      state.pendingMode = null;
      if (pendingMode !== null) this.emitMode(filePath, state, pendingMode);
    }, delay);
  }

  attach(filePath) {
    try {
      const stat = fs.statSync(filePath);
      if (Date.now() - stat.mtimeMs >= STALE_TASK_MS) {
        this.files.set(filePath, {
          offset: stat.size,
          rest: "",
          active: false,
          touchedAt: stat.mtimeMs,
          stopTimer: null,
          transitionTimer: null,
          pendingMode: null,
          writingSince: 0
        });
        return;
      }
      const start = Math.max(0, stat.size - MAX_STARTUP_BYTES);
      const { text, size } = readChunk(filePath, start);
      let startupText = text;
      if (start > 0) {
        const firstNewline = startupText.indexOf("\n");
        startupText =
          firstNewline >= 0 ? startupText.slice(firstNewline + 1) : "";
      }

      const parsed = parseCompleteLines(`${startupText}\n`);
      let lastSignal = null;
      for (const record of parsed.records) {
        const signal = this.classify(record);
        if (signal) lastSignal = signal;
      }

      this.files.set(filePath, {
        offset: size,
        rest: "",
        active: false,
        touchedAt: stat.mtimeMs,
        stopTimer: null,
        transitionTimer: null,
        pendingMode: null,
        writingSince: 0
      });

      if (
        lastSignal === "thinking" ||
        lastSignal === "writing" ||
        lastSignal === "waiting"
      ) {
        this.emitMode(filePath, this.files.get(filePath), lastSignal);
      }
    } catch {
      // File can disappear while the watcher is attaching.
    }
  }

  read(filePath) {
    const state = this.files.get(filePath);
    if (!state) {
      this.attach(filePath);
      return;
    }

    try {
      const stat = fs.statSync(filePath);
      if (stat.size < state.offset) {
        state.offset = 0;
        state.rest = "";
      }

      const { text, size } = readChunk(filePath, state.offset);
      state.offset = size;
      state.touchedAt = stat.mtimeMs;
      const parsed = parseCompleteLines(state.rest + text);
      state.rest = parsed.rest;

      for (const record of parsed.records) {
        const signal = this.classify(record);
        if (
          signal === "thinking" ||
          signal === "writing" ||
          signal === "waiting"
        ) {
          clearTimeout(state.stopTimer);
          state.stopTimer = null;
          if (signal === "writing") {
            this.emitMode(filePath, state, signal);
          } else if (state.active === "writing") {
            this.emitAfterWriting(filePath, state, signal);
          } else {
            this.emitMode(filePath, state, signal);
          }
        } else if (signal === "stop" && state.active) {
          clearTimeout(state.stopTimer);
          const finish = () => {
            state.stopTimer = null;
            if (!state.active) return;
            if (state.active === "writing") {
              this.emitAfterWriting(filePath, state, false);
            } else {
              this.emitMode(filePath, state, false);
            }
          };
          // State changes must interrupt the current animation immediately.
          // Waiting for a writing GIF tail made Remi appear one session behind.
          finish();
        }
      }
    } catch {
      this.remove(filePath);
    }
  }

  expireStale(now) {
    for (const [filePath, state] of this.files) {
      if (state.active && now - state.touchedAt >= STALE_TASK_MS) {
        clearTimeout(state.stopTimer);
        this.clearDeferredTransition(state);
        state.stopTimer = null;
        state.active = false;
        this.onChange(`${this.name}:${filePath}`, false);
      }
    }
  }

  remove(filePath) {
    const state = this.files.get(filePath);
    clearTimeout(state?.stopTimer);
    this.clearDeferredTransition(state ?? {});
    if (state?.active) {
      this.onChange(`${this.name}:${filePath}`, false);
    }
    this.files.delete(filePath);
  }

  async stop() {
    for (const state of this.files.values()) {
      clearTimeout(state.stopTimer);
      this.clearDeferredTransition(state);
    }
    await this.watcher?.close();
  }
}

export class AiMonitor {
  constructor(onChange) {
    const home = os.homedir();
    this.sources = [
      new JsonlSource({
        name: "codex",
        root: path.join(home, ".codex", "sessions"),
        classify: classifyCodexRecord,
        onChange
      }),
      new JsonlSource({
        name: "claude",
        root: path.join(home, ".claude", "projects"),
        classify: classifyClaudeRecord,
        onChange
      })
    ];
    this.expiryTimer = null;
  }

  start() {
    for (const source of this.sources) source.start();
    this.expiryTimer = setInterval(() => {
      const now = Date.now();
      for (const source of this.sources) source.expireStale(now);
    }, 60_000);
  }

  async stop() {
    clearInterval(this.expiryTimer);
    await Promise.all(this.sources.map((source) => source.stop()));
  }
}
