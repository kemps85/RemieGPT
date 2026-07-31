import assert from "node:assert/strict";
import test from "node:test";

import { WindowDragController } from "./window-drag-controller.js";

test("moves the window by the cursor delta and stops cleanly", () => {
  let cursor = { x: 120, y: 80 };
  let tick;
  let cleared = false;
  const positions = [];
  const window = {
    isDestroyed: () => false,
    getPosition: () => [300, 400],
    setPosition: (x, y) => positions.push([x, y])
  };
  const drag = new WindowDragController({
    getWindow: () => window,
    getCursor: () => cursor,
    setIntervalFn: (callback) => {
      tick = callback;
      return 7;
    },
    clearIntervalFn: (timer) => {
      assert.equal(timer, 7);
      cleared = true;
    }
  });

  drag.start({ x: 120, y: 80 });
  cursor = { x: 165, y: 35 };
  tick();
  assert.deepEqual(positions, [[345, 355]]);

  drag.stop();
  assert.equal(cleared, true);
  tick();
  assert.deepEqual(positions, [[345, 355]]);
});

test("uses the pointer-down position even when IPC arrives after the cursor moved", () => {
  const positions = [];
  const window = {
    isDestroyed: () => false,
    getPosition: () => [500, 300],
    setPosition: (x, y) => positions.push([x, y])
  };
  const drag = new WindowDragController({
    getWindow: () => window,
    getCursor: () => ({ x: 260, y: 190 }),
    setIntervalFn: () => 1,
    clearIntervalFn: () => {}
  });

  drag.start({ x: 200, y: 150 });
  drag.update();
  assert.deepEqual(positions, [[560, 340]]);
});

test("ignores drag starts when the window is unavailable", () => {
  let timerStarted = false;
  const drag = new WindowDragController({
    getWindow: () => null,
    getCursor: () => ({ x: 0, y: 0 }),
    setIntervalFn: () => {
      timerStarted = true;
    }
  });

  drag.start();
  assert.equal(timerStarted, false);
});
