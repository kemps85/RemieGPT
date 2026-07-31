import { uIOhook } from "uiohook-napi";

export class GlobalInput {
  constructor(activity, { onKeyboard = () => {}, onPointer = () => {} } = {}) {
    this.activity = activity;
    this.onKeyboard = onKeyboard;
    this.onPointer = onPointer;
    this.lastMoveAt = 0;
    this.running = false;
    this.handlers = {
      keydown: () => {
        this.onKeyboard();
        this.activity.noteKeyboard();
      },
      mousedown: () => {
        this.onPointer();
        this.activity.notePointerAction();
      },
      mouseup: () => {},
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
    if (this.running) return true;
    try {
      for (const [event, handler] of Object.entries(this.handlers)) {
        uIOhook.on(event, handler);
      }
      uIOhook.start();
      this.running = true;
      return true;
    } catch (error) {
      for (const [event, handler] of Object.entries(this.handlers)) {
        uIOhook.off(event, handler);
      }
      console.warn("global-input", error?.message ?? "could not start");
      return false;
    }
  }

  stop() {
    if (!this.running) return;
    for (const [event, handler] of Object.entries(this.handlers)) {
      uIOhook.off(event, handler);
    }
    uIOhook.stop();
    this.running = false;
  }
}
