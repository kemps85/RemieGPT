# RemieGPT

Remi is a custom Codex Pet based on Remielle. She reacts when Codex is working,
waiting for input, ready for review, or blocked by an error.

[Đọc hướng dẫn tiếng Việt](README.vi.md)

The published spritesheet is built only from the six source GIFs in this
repository. No generated or redrawn character frames are used.

![Remi working in Codex](qa/previews/running.gif)

## Requirements

- ChatGPT desktop app with **Pets** available, or a compatible Codex CLI
- Windows, macOS, or Linux
- No API key and no build tools are required

## Install on Windows

Clone or download this repository, open PowerShell in the repository folder,
then run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1
```

The script copies Remi to:

```text
%USERPROFILE%\.codex\pets\remi
```

If `CODEX_HOME` is set, the script uses that folder instead.

## Install on macOS or Linux

Clone or download this repository, open a terminal in the repository folder,
then run:

```bash
sh ./scripts/install.sh
```

The script copies Remi to:

```text
~/.codex/pets/remi
```

If `CODEX_HOME` is set, the script uses that folder instead.

## Install manually

Copy the complete [`pet/remi`](pet/remi) folder to:

```text
<CODEX_HOME>/pets/remi
```

When `CODEX_HOME` is not set, use:

- Windows: `%USERPROFILE%\.codex\pets\remi`
- macOS/Linux: `~/.codex/pets/remi`

The installed folder must contain both files:

```text
remi/
├── pet.json
└── spritesheet.webp
```

## Use Remi

1. Open the Codex desktop app.
2. Go to **Settings > Pets**.
3. Select **Refresh**.
4. Choose **Remi**.
5. Enter `/pet`, or open the command menu and select **Wake Pet**.

Enter `/pet` again to tuck Remi away.

In an interactive Codex CLI session, enter `/pets` or `/pet` to open the pet
picker. Terminal pets require a terminal with supported graphics.

## Animation states

| Codex state | Remi animation |
| --- | --- |
| Idle | Calm breathing and blinking |
| Running | Actively works on the tablet |
| Needs input | Waits for approval or an answer |
| Ready | Reviews the finished result |
| Blocked | Reacts to an error |
| Drag left/right | Moves with the floating pet |

The supplied GIF set does not contain dedicated drag-facing, wave, jump, or
pointer-look artwork. Those rows reuse the closest original loops instead of
inventing new frames.

## Package format

- Codex Pet sprite contract: 9-row custom pet
- Cell size: `192 x 208`
- Atlas grid: `8 x 9`
- Final spritesheet: `1536 x 1872`
- Image format: transparent WebP

## Troubleshooting

### Remi does not appear in the pet picker

- Confirm both package files are in the same `remi` folder.
- In **Settings > Pets**, select **Refresh**.
- Restart the Codex desktop app if the picker was already open during install.
- Confirm you installed to the active `CODEX_HOME`.

### The pet is visible but does not animate

Pets respect the operating system's reduced-motion setting. With reduced
motion enabled, Codex uses a still frame.

### The Codex IDE extension does not show Remi

The IDE extension does not provide the floating pet overlay. Use the ChatGPT
desktop app or a compatible Codex CLI terminal.

## Development and QA

The release atlas is assembled and checked against the 9-row custom-pet
contract. QA artifacts are published under [`qa`](qa) so contributors can
inspect the source mapping and animation rows without rebuilding the pet.

To rebuild the pet only from the source GIFs:

```bash
python scripts/build_pet.py
```

To run the repository-level package check:

```bash
python -m pip install -r requirements-dev.txt
python scripts/validate_package.py
```

GitHub Actions runs the same check on every push and pull request.

## License

Installer scripts and documentation are available under
[`LICENSE-CODE`](LICENSE-CODE). Character artwork and the compiled spritesheet
are excluded from that license unless their rights holder grants separate
permission.
