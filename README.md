# RemieGPT

[Hướng dẫn tiếng Việt, viết cho người mới](README.vi.md)

RemieGPT is a standalone Windows desktop companion built from the original Remi
GIFs stored in this repository. It stays visible while you move between Chrome,
Word, Codex, and other applications, and reacts to typing plus supported AI
thinking, writing, waiting, and completion states.

![Remi writing](assets/source/writing.gif)

No character image is generated, redrawn, or downloaded at runtime. RemieGPT
plays the complete repository GIFs directly and does not depend on Codex Pet.

## Easiest installation

1. Open the [latest GitHub Release](https://github.com/kemps85/RemieGPT/releases/latest).
2. Download `RemieGPT-Setup-...-x64.exe`.
3. Double-click it and choose **Next → Install → Finish**.
4. Open RemieGPT later from its Desktop or Start Menu shortcut.

Use `RemieGPT-Portable-...-x64.exe` if you only want to try it without installing.
If the Releases page has no EXE yet, no public build has been published; build
from source using the beginner instructions below.

Windows may show a SmartScreen warning because community builds are not code
signed. Do not bypass the warning blindly. Download only from this repository,
scan the file, compare its SHA256 checksum, or inspect and build the source
yourself.

## Controls

- Hold the left mouse button on Remi and drag her anywhere, including another
  monitor.
- Right-click the Remi tray icon near the clock to resize, reset her position,
  hide, or quit.
- **Click through Remi** lets clicks reach the app underneath. Choose **Allow
  dragging Remi** to move her again. Click-through resets on restart so Remi
  cannot remain permanently unreachable.
- Enable **Start with Windows** from the tray menu if wanted.

## AI setup

Codex desktop, Codex CLI, and Claude Code work without a browser extension.

For ChatGPT, Claude, Gemini, Copilot, Perplexity, DeepSeek, and Grok websites:

1. Right-click the Remi tray icon and choose **Open web AI helper**.
2. Open `chrome://extensions` or `edge://extensions`.
3. Enable **Developer mode**.
4. Choose **Load unpacked** and select the folder RemieGPT opened.
5. Refresh any AI tabs that were already open.

ChatGPT, Claude, and Gemini have additional site-specific thinking signals.
Other supported sites use a conservative shared streaming detector.

## Animation meanings

| Situation | GIF |
| --- | --- |
| Nothing is happening | `idle.gif` |
| You type in any Windows app | `writing.gif` |
| Supported AI is thinking | `thinking.gif` |
| AI is displaying an answer | `writing.gif` |
| AI explicitly needs an answer or approval | `waiting-input.gif` |
| AI has just finished | `result.gif` |

`waiting-input.gif` is not the default idle animation. It is reserved for an
actual question or approval request from the AI.

## Privacy and security model

- Global input monitoring receives only the fact that input happened. It does
  not store key codes, typed text, passwords, clipboard data, or mouse positions.
- Local Codex and Claude event files are inspected for event types needed to
  choose an animation. Conversations are not uploaded.
- A small active-window thumbnail may be compared in memory while a local AI
  task is active. The thumbnail is discarded and never saved.
- The browser helper reports only `thinking`, `writing`, or `finished` to
  `127.0.0.1` on the same computer. Prompts and answers are not sent.
- RemieGPT has no advertising, telemetry, or separate account system.

## Inspect the source and build your own EXE

This path is intended for people who do not want to trust a prebuilt binary.
Git is not required.

1. Install [Node.js](https://nodejs.org/) 22.12 or newer for Windows x64.
2. Download **Source code (zip)** from the same GitHub Release.
3. Extract it somewhere ordinary, such as `Documents\RemieGPT`.
4. Double-click `build-windows.cmd`.
5. The script installs the exact locked dependencies, runs tests, audits runtime
   packages, builds both EXEs, packages the browser helper, and writes SHA256
   checksums.
6. When it finishes, use a file from the opened `dist` folder:

```text
dist\RemieGPT-Setup-<version>-x64.exe
dist\RemieGPT-Portable-<version>-x64.exe
```

The first build requires Internet access so npm can download Electron and the
packages listed in `package-lock.json`.

### Source-review map

| Path | What it does |
| --- | --- |
| `package.json` | Dependencies and packaging commands |
| `package-lock.json` | Exact dependency versions and integrity hashes |
| `desktop/main.js` | Window, tray menu, and detector startup |
| `desktop/global-input.js` | Input-activity events without key content |
| `desktop/ai-monitor.js` | Local Codex and Claude event classification |
| `desktop/visual-writing-monitor.js` | In-memory active-window change comparison |
| `desktop/web-ai-server.js` | Localhost-only browser-helper receiver |
| `browser-extension/` | Complete browser helper source |
| `.github/workflows/` | CI build and release commands |

There is no hidden executable inside the source tree. The runtime code is
readable JavaScript and PowerShell.

### Manual build commands

```bat
npm ci
npm test
npm audit --omit=dev
npm run build:win
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\package-release.ps1
```

### Verify a downloaded release

Download `SHA256SUMS.txt` beside the EXE, then run in PowerShell:

```powershell
Get-FileHash .\RemieGPT-Setup-0.2.0-x64.exe -Algorithm SHA256
```

The displayed hash must match the corresponding line in `SHA256SUMS.txt`.
A matching checksum proves that the download matches the repository release;
it does not by itself prove that any program is harmless. A locally built EXE
may have a different hash because package timestamps and metadata can differ.

## Clone and build with Git

```bat
git clone https://github.com/kemps85/RemieGPT.git
cd RemieGPT
build-windows.cmd
```

## Windows limitations

- Remi stays above ordinary and maximized windows.
- Windows lock/UAC secure screens and some exclusive full-screen games can
  cover desktop overlays.
- Typing works across applications, but AI thinking/writing detection is exact
  only for supported providers.
- Releases target Windows x64 because that is the platform tested in practice.

## Artwork, references, and licenses

RemieGPT uses only GIFs under `assets/source`. The app icon is a frame extracted
from `idle.gif`; no AI-generated artwork is used.

Website signal ideas were informed by
[Gemielle](https://github.com/Rainan1010/Gemielle) and
[Remielle-Widget](https://github.com/qantrung-art/Remielle-Widget). See
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). No artwork was copied from
those repositories.

Code and documentation follow [LICENSE-CODE](LICENSE-CODE). Character artwork
is not automatically granted under the code license unless its rights holder
provides separate permission.
