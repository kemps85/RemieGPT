import assert from "node:assert/strict";
import test from "node:test";

import {
  classifyClaudeRecord,
  classifyCodexRecord
} from "./ai-monitor.js";

test("Codex task lifecycle is detected", () => {
  assert.equal(
    classifyCodexRecord({
      type: "event_msg",
      payload: { type: "task_started" }
    }),
    "thinking"
  );
  assert.equal(
    classifyCodexRecord({
      type: "event_msg",
      payload: { type: "task_complete" }
    }),
    "stop"
  );
});

test("Claude user prompt starts and final text ends thinking", () => {
  assert.equal(
    classifyClaudeRecord({
      type: "user",
      message: { role: "user", content: "hello" }
    }),
    "thinking"
  );
  assert.equal(
    classifyClaudeRecord({
      type: "assistant",
      message: {
        role: "assistant",
        stop_reason: "end_turn",
        content: [{ type: "text", text: "done" }]
      }
    }),
    "writing"
  );
});

test("Codex switches between reasoning and every visible text update", () => {
  assert.equal(
    classifyCodexRecord({
      type: "event_msg",
      payload: { type: "agent_reasoning" }
    }),
    "thinking"
  );
  assert.equal(
    classifyCodexRecord({
      type: "event_msg",
      payload: { type: "agent_message", phase: "commentary" }
    }),
    "writing"
  );
  assert.equal(
    classifyCodexRecord({
      type: "response_item",
      payload: { type: "message", role: "assistant" }
    }),
    "writing"
  );
});

test("Codex request_user_input switches to waiting", () => {
  assert.equal(
    classifyCodexRecord({
      type: "response_item",
      payload: {
        type: "function_call",
        name: "functions.request_user_input"
      }
    }),
    "waiting"
  );
});

test("Claude tool results do not start a new task", () => {
  assert.equal(
    classifyClaudeRecord({
      type: "user",
      message: {
        role: "user",
        content: [{ type: "tool_result", content: "ok" }]
      }
    }),
    null
  );
});
