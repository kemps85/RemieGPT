# RemieGPT

[Hướng dẫn tiếng Việt](README.vi.md)

RemieGPT is a Windows desktop companion built from the original Remi GIFs in
this repository. It floats above normal and maximized apps, reacts to keyboard
and mouse activity across Windows, and can show when supported AI tools are
thinking, writing, waiting for input, or finished.

![Remi writing](assets/source/writing.gif)

This is a standalone Windows app. It is not a Codex Pet and does not use a
reduced-frame spritesheet; each animation plays directly from the complete
source GIF.

## Download and run

Download one of these files from the repository's **Releases** page:

- `RemieGPT-Setup-*-x64.exe`: installs RemieGPT and creates Desktop/Start Menu
  shortcuts.
- `RemieGPT-Portable-*-x64.exe`: runs directly without installation.

Windows may show a SmartScreen warning because community builds are not
code-signed. Only download releases from this repository.

To open RemieGPT later:

- use the **RemieGPT** Desktop or Start Menu shortcut after installation;
- or reopen the portable EXE;
- or enable **Start with Windows** from the Remi tray icon.

## Controls

- Hold the left mouse button on Remi and drag to move her.
- Right-click the Remi tray icon near the clock to change size, return Remi to
  the bottom-right corner, hide her, or quit.
- Enable **Click through Remi** when you want mouse clicks to reach the app
  underneath. Disable it again from the tray icon before dragging Remi. This
  mode resets when RemieGPT restarts, so Remi can never stay stuck permanently.

## Animation rules

| Situation | Source animation |
| --- | --- |
| No activity | `idle.gif` |
| You type in any Windows app | `writing.gif` |
| Supported AI is thinking | `thinking.gif` |
| Supported AI is displaying an answer | `writing.gif` |
| AI needs an answer or approval | `waiting-input.gif` |
| AI finished | `result.gif` |

Keyboard monitoring only receives the fact that a key was pressed. RemieGPT
does not store key codes, typed text, passwords, clipboard data, screenshots,
or mouse coordinates.

## AI support

Codex and Claude Code work without browser setup by watching their local task
event files:

- Codex desktop and Codex CLI
- Claude Code

For AI websites, install the included Chromium extension:

1. Right-click the Remi tray icon and choose **Open web AI helper**.
2. Open `chrome://extensions` or `edge://extensions`.
3. Turn on **Developer mode**.
4. Choose **Load unpacked** and select that opened folder.

The helper currently recognizes ChatGPT, Claude, Gemini, Microsoft Copilot,
Perplexity, DeepSeek, and Grok. It only checks whether the page shows a
thinking/streaming control and sends that yes/no state to RemieGPT on the same
computer. It does not send prompts or answers.

There is no universal “AI is thinking” signal shared by every program.
Unsupported AI apps need a small adapter before RemieGPT can distinguish their
thinking and writing states.

## Build the Windows EXE

Requirements:

- Windows 10 or Windows 11, x64
- Node.js 22.12 or newer
- Git

Clone the repository, then double-click:

```text
build-windows.cmd
```

Or run it from Command Prompt:

```bat
git clone https://github.com/kemps85/RemieGPT.git
cd RemieGPT
build-windows.cmd
```

After tests pass, both EXE files are written to `dist`:

```text
dist\RemieGPT-Setup-<version>-x64.exe
dist\RemieGPT-Portable-<version>-x64.exe
```

Equivalent manual commands:

```bat
npm ci
npm test
npm run build:win
```

## Windows limitations

- Remi stays above ordinary and maximized windows.
- Windows lock/UAC secure screens and some exclusive full-screen games can
  cover desktop overlays.
- This release targets Windows x64 only because that is the tested platform.

## Source art and licenses

The app uses only the Remi GIF artwork stored under `assets/source`. The app
icon is an extracted frame from `idle.gif`; no AI-generated artwork is used.

Application code is covered by [LICENSE-CODE](LICENSE-CODE). Character artwork
and derived release assets are not granted under that code license unless
their rights holder provides separate permission.
