import { uIOhook } from "uiohook-napi";

export class GlobalInput {
  constructor(activity, { onMouseUp = () => {} } = {}) {
    this.activity = activity;
    this.onMouseUp = onMouseUp;
    this.lastMoveAt = 0;
    this.handlers = {
      keydown: () => this.activity.noteKeyboard(),
      mousedown: () => this.activity.notePointerAction(),
      mouseup: () => this.onMouseUp(),
      wheel: () => this.activity.notePointerAction(),
      mousemove: () => {
        const now = Date.now();
        if (now - this.lastMoveAt < 120) return;
        this.lastMoveAt = now;
        this.activity.notePointerMove();
      }
    };
  }

  start() {
    // Event details are intentionally ignored. RemieGPT only needs to know
    // that an input happened; it never stores keys, text, or coordinates.
    for (const [event, handler] of Object.entries(this.handlers)) {
      uIOhook.on(event, handler);
    }
    uIOhook.start();
  }

  stop() {
    for (const [event, handler] of Object.entries(this.handlers)) {
      uIOhook.off(event, handler);
    }
    uIOhook.stop();
  }
}
