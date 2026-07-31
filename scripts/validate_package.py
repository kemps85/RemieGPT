from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PACKAGE_DIR = ROOT / "pet" / "remi"
MANIFEST_PATH = PACKAGE_DIR / "pet.json"
EXPECTED_SIZE = (1536, 1872)
MAX_BYTES = 20 * 1024 * 1024


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def main() -> None:
    if not MANIFEST_PATH.is_file():
        fail(f"missing manifest: {MANIFEST_PATH}")

    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    required = {
        "id": "remi",
        "displayName": "Remi",
        "spritesheetPath": "spritesheet.webp",
    }

    for key, expected in required.items():
        actual = manifest.get(key)
        if actual != expected:
            fail(f"pet.json field {key!r} is {actual!r}; expected {expected!r}")

    spritesheet_path = PACKAGE_DIR / manifest["spritesheetPath"]
    if not spritesheet_path.is_file():
        fail(f"missing spritesheet: {spritesheet_path}")

    size_bytes = spritesheet_path.stat().st_size
    if size_bytes > MAX_BYTES:
        fail(f"spritesheet is {size_bytes} bytes; maximum is {MAX_BYTES}")

    with Image.open(spritesheet_path) as image:
        if image.format != "WEBP":
            fail(f"spritesheet format is {image.format!r}; expected 'WEBP'")
        if image.size != EXPECTED_SIZE:
            fail(f"spritesheet size is {image.size}; expected {EXPECTED_SIZE}")
        if "A" not in image.getbands():
            fail(f"spritesheet bands are {image.getbands()}; alpha is required")
        alpha = image.getchannel("A")
        alpha_min, alpha_max = alpha.getextrema()
        if alpha_min != 0:
            fail("spritesheet has no fully transparent pixels")
        if alpha_max != 255:
            fail("spritesheet has no fully opaque pixels")

    print("RemieGPT package validation passed.")
    print(f"  manifest: {MANIFEST_PATH}")
    print(f"  spritesheet: {spritesheet_path}")
    print(f"  dimensions: {EXPECTED_SIZE[0]} x {EXPECTED_SIZE[1]}")
    print(f"  size: {size_bytes} bytes")


if __name__ == "__main__":
    main()
