export class WindowDragController {
  constructor({
    getWindow,
    getCursor,
    setIntervalFn = setInterval,
    clearIntervalFn = clearInterval,
    intervalMs = 16
  }) {
    this.getWindow = getWindow;
    this.getCursor = getCursor;
    this.setIntervalFn = setIntervalFn;
    this.clearIntervalFn = clearIntervalFn;
    this.intervalMs = intervalMs;
    this.timer = null;
    this.origin = null;
    this.lastPosition = null;
  }

  start(startCursor = null) {
    const window = this.getWindow();
    if (!window || window.isDestroyed()) return;

    this.stop();
    const cursor = startCursor ?? this.getCursor();
    const [x, y] = window.getPosition();
    this.origin = { cursor, window: { x, y } };
    this.lastPosition = { x, y };
    this.timer = this.setIntervalFn(() => this.update(), this.intervalMs);
  }

  update() {
    if (!this.origin) return;
    const window = this.getWindow();
    if (!window || window.isDestroyed()) {
      this.stop();
      return;
    }

    const cursor = this.getCursor();
    const x = Math.round(this.origin.window.x + cursor.x - this.origin.cursor.x);
    const y = Math.round(this.origin.window.y + cursor.y - this.origin.cursor.y);
    if (this.lastPosition?.x === x && this.lastPosition?.y === y) return;

    this.lastPosition = { x, y };
    window.setPosition(x, y, false);
  }

  stop() {
    if (this.timer !== null) {
      this.clearIntervalFn(this.timer);
    }
    this.timer = null;
    this.origin = null;
    this.lastPosition = null;
  }
}
