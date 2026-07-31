import assert from "node:assert/strict";
import test from "node:test";

import { parseWebAiMessage } from "./web-ai-server.js";

test("browser AI state messages are accepted without page content", () => {
  assert.deepEqual(
    parseWebAiMessage(
      JSON.stringify({
        type: "ai-state",
        source: "chatgpt.com:12",
        active: true
      })
    ),
    {
      source: "chatgpt.com:12",
      active: true,
      mode: "writing",
      showResult: true
    }
  );
});

test("unexpected browser messages are ignored", () => {
  assert.equal(parseWebAiMessage('{"type":"page-text","value":"secret"}'), null);
  assert.equal(parseWebAiMessage("not-json"), null);
});

test("background browser transitions do not request a result animation", () => {
  assert.deepEqual(
    parseWebAiMessage(
      JSON.stringify({
        type: "ai-state",
        source: "tab",
        active: false,
        reason: "background"
      })
    ),
    {
      source: "tab",
      active: false,
      mode: "writing",
      showResult: false
    }
  );
});
