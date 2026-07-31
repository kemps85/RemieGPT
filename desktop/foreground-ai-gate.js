function providerForSource(source) {
  const separator = String(source).indexOf(":");
  return separator < 0 ? "" : String(source).slice(0, separator);
}

export const ACTIVE_TERMINAL_WINDOW_MS = 5000;
export const SESSION_SELECTION_WINDOW_MS = 4000;

function contextKey(context) {
  return context ? `${context.provider}:${context.id}` : null;
}

export class ForegroundAiGate {
  constructor(activity, { now = () => Date.now() } = {}) {
    this.activity = activity;
    this.now = now;
    this.foreground = null;
    this.sources = new Map();
    this.visibleSources = new Set();
    this.lastUserInputAt = 0;
    this.selectedSourceByContext = new Map();
  }

  noteUserInput() {
    this.lastUserInputAt = this.now();
    this.clearSelectedSourceForForeground();
  }

  notePointerAction() {
    // A click in the Codex/Claude sidebar can switch the visible session even
    // though the native window itself does not change. Go idle until the next
    // session emits its own task signal rather than borrowing a background one.
    this.clearSelectedSourceForForeground();
  }

  clearSelectedSourceForForeground() {
    const key = contextKey(this.foreground);
    if (!key || !this.selectedSourceByContext.delete(key)) return;
    this.sync({ suppressResult: true });
  }

  setForeground(windowInfo) {
    const next = windowInfo?.provider
      ? { id: String(windowInfo.id), provider: windowInfo.provider }
      : null;
    const changed =
      next?.id !== this.foreground?.id ||
      next?.provider !== this.foreground?.provider;
    this.foreground = next;
    if (changed) this.sync({ suppressResult: true });
  }

  setAiMode(source, mode) {
    const previous = this.sources.get(source);
    if (mode === "thinking" || mode === "writing" || mode === "waiting") {
      const provider = providerForSource(source);
      // Bind a task once, at the moment it begins in the active AI window.
      // A task that starts in the background stays silent instead of borrowing
      // the animation of whichever terminal happens to be active later.
      const terminalWasJustUsed =
        this.foreground?.provider === "terminal" &&
        this.now() - this.lastUserInputAt <= ACTIVE_TERMINAL_WINDOW_MS;
      const context =
        previous?.context ??
        (this.foreground?.provider === provider || terminalWasJustUsed
          ? { ...this.foreground }
          : null);
      this.sources.set(source, { mode, provider, context });
      const key = contextKey(context);
      const canSelectNewSession =
        mode === "thinking" &&
        key &&
        this.now() - this.lastUserInputAt <= SESSION_SELECTION_WINDOW_MS;
      if (canSelectNewSession && !this.selectedSourceByContext.has(key)) {
        this.selectedSourceByContext.set(key, source);
      }
    } else {
      this.sources.delete(source);
    }
    this.sync();
  }

  isVisible(source, entry) {
    const key = contextKey(entry?.context);
    return Boolean(
      key &&
        this.foreground &&
        entry.context.id === this.foreground.id &&
        entry.context.provider === this.foreground.provider &&
        this.selectedSourceByContext.get(key) === source
    );
  }

  sync({ suppressResult = false } = {}) {
    const nextVisible = new Map();
    for (const [source, entry] of this.sources) {
      if (this.isVisible(source, entry)) nextVisible.set(source, entry.mode);
    }

    if (suppressResult) {
      this.activity.clearAiSources(this.visibleSources);
      this.visibleSources.clear();
      for (const [source, mode] of nextVisible) {
        this.activity.setAiMode(source, mode);
        this.visibleSources.add(source);
      }
      return;
    }

    for (const source of this.visibleSources) {
      if (!nextVisible.has(source)) this.activity.setAiMode(source, false);
    }
    for (const [source, mode] of nextVisible) {
      this.activity.setAiMode(source, mode);
    }
    this.visibleSources = new Set(nextVisible.keys());
  }

  clear() {
    this.sources.clear();
    this.selectedSourceByContext.clear();
    this.activity.clearAiSources(this.visibleSources);
    this.visibleSources.clear();
  }
}
