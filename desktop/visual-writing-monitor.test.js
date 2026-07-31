import assert from "node:assert/strict";
import test from "node:test";

import { frameDifference } from "./visual-writing-monitor.js";

test("identical frames are stable", () => {
  const frame = Buffer.alloc(180 * 110 * 4, 20);
  assert.equal(frameDifference(frame, Buffer.from(frame)), 0);
});

test("large content changes are detected", () => {
  const before = Buffer.alloc(180 * 110 * 4, 0);
  const after = Buffer.alloc(180 * 110 * 4, 255);
  assert.ok(frameDifference(before, after) > 100);
});
