import test from "node:test";
import assert from "node:assert/strict";

import {
  defaultPosition,
  isPositionUsable,
  normalizePetSize,
  safeWindowPosition
} from "./window-bounds.js";

const primary = { x: 0, y: 0, width: 1920, height: 1040 };
const secondary = { x: 1920, y: 0, width: 1920, height: 1040 };

test("normalizes corrupted or out-of-range saved sizes", () => {
  assert.equal(normalizePetSize("220", 220), 220);
  assert.equal(normalizePetSize(20, 220), 150);
  assert.equal(normalizePetSize(900, 220), 360);
  assert.equal(normalizePetSize("not-a-number", 220), 220);
});

test("keeps a position that remains usable on any connected display", () => {
  const position = { x: 2050, y: 740 };
  assert.equal(isPositionUsable(position, 220, [primary, secondary]), true);
  assert.deepEqual(
    safeWindowPosition({
      position,
      size: 220,
      workAreas: [primary, secondary],
      primaryWorkArea: primary
    }),
    position
  );
});

test("returns Remi to the primary display after a monitor disappears", () => {
  const position = { x: 2050, y: 740 };
  assert.equal(isPositionUsable(position, 220, [primary]), false);
  assert.deepEqual(
    safeWindowPosition({
      position,
      size: 220,
      workAreas: [primary],
      primaryWorkArea: primary
    }),
    defaultPosition(220, primary)
  );
});
