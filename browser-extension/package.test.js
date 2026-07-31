import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(
  fs.readFileSync(path.join(here, "manifest.json"), "utf8")
);
const content = fs.readFileSync(path.join(here, "content.js"), "utf8");
const worker = fs.readFileSync(path.join(here, "service-worker.js"), "utf8");

test("browser helper is limited to the documented AI sites", () => {
  assert.equal(manifest.manifest_version, 3);
  assert.ok(!manifest.host_permissions.includes("<all_urls>"));
  for (const host of ["chatgpt.com", "claude.ai", "gemini.google.com"]) {
    assert.ok(manifest.host_permissions.some((entry) => entry.includes(host)));
  }
});

test("site-specific thinking signals are additive to the stable detector", () => {
  for (const signal of [
    "reasoning-block",
    "thinking-block",
    "gdm-thought-viewer",
    "data-is-thinking"
  ]) {
    assert.ok(content.includes(signal));
  }
});

test("browser helper only connects to RemieGPT on localhost", () => {
  assert.ok(worker.includes("ws://127.0.0.1:47582"));
  assert.ok(!/wss?:\/\/(?!127\.0\.0\.1)/.test(worker));
});

test("browser helper only forwards the focused window's active tab", () => {
  assert.match(worker, /chrome\.tabs\.onActivated/);
  assert.match(worker, /chrome\.windows\.onFocusChanged/);
  assert.match(worker, /focusedWindowId/);
  assert.match(worker, /selectedSource/);
});
