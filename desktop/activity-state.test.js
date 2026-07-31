import assert from "node:assert/strict";
import test from "node:test";

import { ActivityState } from "./activity-state.js";

function harness() {
  const emitted = [];
  const timers = [];
  const state = new ActivityState({
    emit: (value) => emitted.push(value),
    now: () => 1000,
    setTimer: (callback) => {
      timers.push(callback);
      return callback;
    },
    clearTimer: () => {}
  });
  return { emitted, state, timers };
}

test("keyboard activity shows typing then returns to idle", () => {
  const { emitted, state, timers } = harness();
  state.noteKeyboard();
  assert.deepEqual(emitted, ["typing"]);
  timers.at(-1)();
  assert.deepEqual(emitted, ["typing", "idle"]);
});

test("mouse click records activity without stealing the current state", () => {
  const { emitted, state } = harness();
  state.notePointerAction();
  assert.deepEqual(emitted, []);
});

test("long inactivity stays idle instead of pretending AI needs input", () => {
  const { emitted, state } = harness();
  state.noteIdleSeconds(45);
  state.notePointerMove();
  assert.deepEqual(emitted, []);
});

test("hover takes priority over input states", () => {
  const { emitted, state } = harness();
  state.setHovering(true);
  state.notePointerAction();
  assert.deepEqual(emitted, ["hover"]);
});

test("an explicit AI event immediately replaces temporary typing", () => {
  const { emitted, state, timers } = harness();
  state.setAiThinking("codex:one", true);
  state.noteKeyboard();
  assert.deepEqual(emitted, ["thinking", "typing"]);
  state.setAiThinking("codex:one", true);
  assert.deepEqual(emitted, ["thinking", "typing", "thinking"]);
  timers.at(-1)();
  assert.deepEqual(emitted, ["thinking", "typing", "thinking"]);
});

test("clearing AI state on a foreground switch does not show a result", () => {
  const { emitted, state } = harness();
  state.setAiThinking("codex:one", true);
  state.clearAiState();
  assert.deepEqual(emitted, ["thinking", "idle"]);
});

test("a background source ending after a foreground switch is ignored", () => {
  const { emitted, state } = harness();
  state.setAiThinking("web:tab", true);
  state.clearAiState();
  state.setAiMode("web:tab", false, { showResult: false });
  assert.deepEqual(emitted, ["thinking", "idle"]);
});

test("AI result appears only after every active AI finishes", () => {
  const { emitted, state } = harness();
  state.setAiThinking("codex:one", true);
  state.setAiThinking("claude:two", true);
  state.setAiThinking("codex:one", false);
  assert.deepEqual(emitted, ["thinking"]);
  state.setAiThinking("claude:two", false);
  assert.deepEqual(emitted, ["thinking", "result"]);
});

test("AI writing has its own state and falls back to thinking", () => {
  const { emitted, state } = harness();
  state.setAiMode("codex:one", "thinking");
  state.setAiMode("codex:one", "writing");
  state.setAiMode("claude:two", "thinking");
  assert.deepEqual(emitted, ["thinking", "aiWriting"]);
  state.setAiMode("codex:one", false);
  assert.deepEqual(emitted, ["thinking", "aiWriting", "thinking"]);
});

test("AI can explicitly wait for the user", () => {
  const { emitted, state } = harness();
  state.setAiMode("codex:one", "thinking");
  state.setAiMode("codex:one", "waiting");
  assert.deepEqual(emitted, ["thinking", "waiting"]);
});
