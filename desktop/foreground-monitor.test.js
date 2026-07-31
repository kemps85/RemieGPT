import assert from "node:assert/strict";
import test from "node:test";

import { providerFor } from "./foreground-monitor.js";

test("foreground Codex and Claude windows are recognized", () => {
  assert.equal(
    providerFor({
      owner: { name: "OpenAI Codex" },
      title: "RemieGPT task"
    }),
    "codex"
  );
  assert.equal(
    providerFor({
      owner: { name: "claude.exe" },
      title: "Claude"
    }),
    "claude"
  );
});

test("ordinary apps are not treated as AI windows", () => {
  assert.equal(
    providerFor({
      owner: { name: "WINWORD.EXE" },
      title: "Document - Word"
    }),
    null
  );
});
