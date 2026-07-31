import { activeWindow } from "active-win";

function providerFor(windowInfo) {
  const value = [
    windowInfo?.owner?.name,
    windowInfo?.owner?.path,
    windowInfo?.title
  ]
    .filter(Boolean)
    .join(" ");

  if (/\bcodex\b|openai\.codex/i.test(value)) return "codex";
  if (/\bclaude\b/i.test(value)) return "claude";
  return null;
}

export class ForegroundMonitor {
  constructor(onChange) {
    this.onChange = onChange;
    this.timer = null;
    this.running = false;
    this.lastId = null;
  }

  start() {
    this.timer = setInterval(() => this.tick(), 350);
    this.tick();
  }

  async tick() {
    if (this.running) return;
    this.running = true;
    try {
      const info = await activeWindow();
      const id = info?.id ?? null;
      if (id !== this.lastId) {
        this.lastId = id;
        this.onChange(
          info
            ? {
                id,
                title: info.title ?? "",
                ownerName: info.owner?.name ?? "",
                ownerPath: info.owner?.path ?? "",
                bounds: info.bounds,
                provider: providerFor(info)
              }
            : null
        );
      }
    } catch {
      // Windows can briefly return no foreground window during app switches.
    } finally {
      this.running = false;
    }
  }

  stop() {
    clearInterval(this.timer);
    this.timer = null;
  }
}

export { providerFor };
