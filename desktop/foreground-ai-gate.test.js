import test from "node:test";
import assert from "node:assert/strict";

import { ForegroundAiGate } from "./foreground-ai-gate.js";

function makeActivity() {
  return {
    calls: [],
    clearAiSources(sources) {
      this.calls.push(["clear", [...sources]]);
    },
    setAiMode(source, mode) {
      this.calls.push([source, mode]);
    }
  };
}

test("only a task started in the active Codex window controls Remi", () => {
  const activity = makeActivity();
  const gate = new ForegroundAiGate(activity);
  gate.setForeground({ id: 10, provider: "codex" });
  gate.noteUserInput();
  gate.setAiMode("codex:terminal-a", "thinking");
  assert.deepEqual(activity.calls, [
    ["clear", []],
    ["codex:terminal-a", "thinking"]
  ]);

  gate.setForeground({ id: 20, provider: "codex" });
  assert.deepEqual(activity.calls.at(-1), ["clear", ["codex:terminal-a"]]);

  gate.setAiMode("codex:terminal-a", "thinking");
  assert.deepEqual(activity.calls.at(-1), ["clear", ["codex:terminal-a"]]);
});

test("a background task never borrows the active terminal animation", () => {
  const activity = makeActivity();
  const gate = new ForegroundAiGate(activity);
  gate.setForeground({ id: 10, provider: "codex" });
  gate.setForeground({ id: 30, provider: "claude" });
  gate.setAiMode("codex:background", "thinking");
  assert.deepEqual(activity.calls, [["clear", []], ["clear", []]]);
});

test("switching to an ordinary app clears AI state without showing a result", () => {
  const activity = makeActivity();
  const gate = new ForegroundAiGate(activity);
  gate.setForeground({ id: 10, provider: "codex" });
  gate.noteUserInput();
  gate.setAiMode("codex:terminal-a", "thinking");
  gate.setForeground({ id: 99, provider: null });
  assert.deepEqual(activity.calls.at(-1), ["clear", ["codex:terminal-a"]]);
});

test("a Codex task can bind to the terminal that was just used", () => {
  const activity = makeActivity();
  const gate = new ForegroundAiGate(activity, { now: () => 1000 });
  gate.setForeground({ id: 77, provider: "terminal" });
  gate.noteUserInput();
  gate.setAiMode("codex:terminal-a", "thinking");
  assert.deepEqual(activity.calls.at(-1), ["codex:terminal-a", "thinking"]);
});

test("an unrelated background Codex task does not bind to an idle terminal", () => {
  const activity = makeActivity();
  const gate = new ForegroundAiGate(activity, { now: () => 10000 });
  gate.setForeground({ id: 77, provider: "terminal" });
  gate.setAiMode("codex:background", "thinking");
  assert.deepEqual(activity.calls, [["clear", []]]);
});

test("only the Codex session selected by the latest input controls Remi", () => {
  const activity = makeActivity();
  const gate = new ForegroundAiGate(activity, { now: () => 1000 });
  gate.setForeground({ id: 10, provider: "codex" });
  gate.noteUserInput();
  gate.setAiMode("codex:session-one", "thinking");
  gate.setAiMode("codex:session-two", "writing");
  assert.deepEqual(activity.calls.at(-1), ["codex:session-one", "thinking"]);

  gate.notePointerAction();
  assert.deepEqual(activity.calls.at(-1), ["clear", ["codex:session-one"]]);

  gate.noteUserInput();
  gate.setAiMode("codex:session-two", "thinking");
  assert.deepEqual(activity.calls.at(-1), ["codex:session-two", "thinking"]);
});
