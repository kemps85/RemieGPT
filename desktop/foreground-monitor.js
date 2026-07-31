import { spawn } from "node:child_process";
import readline from "node:readline";

function providerFor(windowInfo) {
  const owner = [windowInfo?.ownerName, windowInfo?.ownerPath]
    .filter(Boolean)
    .join(" ");
  const title = windowInfo?.title ?? "";

  if (/\bcodex\b|openai\.codex/i.test(owner)) return "codex";
  if (/\bclaude\b/i.test(owner)) return "claude";

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
  }

  start() {
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
  }

  stop() {
    this.lines?.close();
    this.lines = null;
    this.process?.kill();
    this.process = null;
  }
}

export { providerFor };
