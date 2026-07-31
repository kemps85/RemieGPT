import assert from "node:assert/strict";
import test from "node:test";

import { providerFor } from "./foreground-monitor.js";

test("foreground Codex and Claude windows are recognized", () => {
  assert.equal(
    providerFor({
      ownerName: "OpenAI Codex",
      title: "RemieGPT task"
    }),
    "codex"
  );
  assert.equal(
    providerFor({
      ownerName: "claude.exe",
      title: "Claude"
    }),
    "claude"
  );
});

test("ordinary apps are not treated as AI windows", () => {
  assert.equal(
    providerFor({
      ownerName: "WINWORD.EXE",
      title: "Document - Word"
    }),
    null
  );
});

test("terminal hosts are recognized for a recently started CLI task", () => {
  assert.equal(
    providerFor({ ownerName: "WindowsTerminal", title: "PowerShell" }),
    "terminal"
  );
});
