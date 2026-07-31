import { spawn } from "node:child_process";
import readline from "node:readline";

function providerFor(windowInfo) {
  const owner = [windowInfo?.ownerName, windowInfo?.ownerPath]
    .filter(Boolean)
    .join(" ");
  const title = windowInfo?.title ?? "";

  if (/\bcodex\b|openai\.codex/i.test(owner)) return "codex";
  if (/\bclaude\b/i.test(owner)) return "claude";

  if (/windowsterminal|powershell|\bcmd\b|conhost/i.test(owner)) {
    return "terminal";
  }

  // CLI and browser windows often belong to Terminal or Chrome, so their
  // title is the only provider hint available on Windows.
  if (/\bcodex\b/i.test(title)) return "codex";
  if (/\bclaude\b/i.test(title)) return "claude";
  return null;
}

export class ForegroundMonitor {
  constructor({ helperPath, onChange }) {
    this.helperPath = helperPath;
    this.onChange = onChange;
    this.process = null;
    this.lines = null;
    this.lastId = null;
    this.restartTimer = null;
    this.stopping = false;
  }

  start() {
    this.stopping = false;
    if (this.process) return;
    try {
      this.process = spawn(
        "powershell.exe",
        [
          "-NoLogo",
          "-NoProfile",
          "-NonInteractive",
          "-ExecutionPolicy",
          "Bypass",
          "-File",
          this.helperPath
        ],
        {
          windowsHide: true,
          stdio: ["ignore", "pipe", "ignore"]
        }
      );
    } catch {
      this.scheduleRestart();
      return;
    }

    this.lines = readline.createInterface({ input: this.process.stdout });
    this.lines.on("line", (line) => {
      try {
        const info = JSON.parse(line);
        const identity = [info.ownerName, info.ownerPath, info.title]
          .filter(Boolean)
          .join(" ");
        if (/RemieGPT/i.test(identity) || info.id === this.lastId) return;
        this.lastId = info.id;
        this.onChange({
          ...info,
          provider: providerFor(info)
        });
      } catch {
        // Ignore a partial line if PowerShell is stopped mid-write.
      }
    });
    this.process.on("error", () => this.handleExit());
    this.process.on("exit", () => this.handleExit());
  }

  handleExit() {
    this.lines?.close();
    this.lines = null;
    this.process = null;
    this.scheduleRestart();
  }

  scheduleRestart() {
    if (this.stopping || this.restartTimer) return;
    this.restartTimer = setTimeout(() => {
      this.restartTimer = null;
      this.start();
    }, 5000);
  }

  stop() {
    this.stopping = true;
    clearTimeout(this.restartTimer);
    this.restartTimer = null;
    this.lines?.close();
    this.lines = null;
    this.process?.kill();
    this.process = null;
  }
}

export { providerFor };
