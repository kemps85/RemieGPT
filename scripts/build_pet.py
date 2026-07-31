from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "assets" / "source"
PACKAGE_DIR = ROOT / "pet" / "remi"
QA_DIR = ROOT / "qa"
PREVIEW_DIR = QA_DIR / "previews"

CELL_WIDTH = 192
CELL_HEIGHT = 208
ATLAS_COLUMNS = 8
ATLAS_ROWS = 9
ATLAS_SIZE = (CELL_WIDTH * ATLAS_COLUMNS, CELL_HEIGHT * ATLAS_ROWS)


@dataclass(frozen=True)
class RowSpec:
    state: str
    source: str
    frames: int


ROWS = (
    RowSpec("idle", "calm.gif", 6),
    RowSpec("running-right", "busy-spiral-a.gif", 8),
    RowSpec("running-left", "busy-spiral-b.gif", 8),
    RowSpec("waving", "happy-review.gif", 4),
    RowSpec("jumping", "happy-review.gif", 5),
    RowSpec("failed", "tired.gif", 8),
    RowSpec("waiting", "waiting.gif", 6),
    RowSpec("running", "busy-spiral-b.gif", 6),
    RowSpec("review", "happy-review.gif", 6),
)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def sample_indices(total_frames: int, count: int) -> list[int]:
    return [min(total_frames - 1, (index * total_frames) // count) for index in range(count)]


def union_box(frames: list[Image.Image]) -> tuple[int, int, int, int]:
    boxes = [frame.getbbox() for frame in frames]
    boxes = [box for box in boxes if box is not None]
    if not boxes:
        raise ValueError("source animation has no visible pixels")
    return (
        min(box[0] for box in boxes),
        min(box[1] for box in boxes),
        max(box[2] for box in boxes),
        max(box[3] for box in boxes),
    )


def fit_stable_frames(frames: list[Image.Image]) -> list[Image.Image]:
    box = union_box(frames)
    width = box[2] - box[0]
    height = box[3] - box[1]
    scale = min((CELL_WIDTH - 10) / width, (CELL_HEIGHT - 10) / height)
    target_size = (max(1, round(width * scale)), max(1, round(height * scale)))
    output: list[Image.Image] = []

    for frame in frames:
        crop = frame.crop(box).resize(target_size, Image.Resampling.LANCZOS)
        cell = Image.new("RGBA", (CELL_WIDTH, CELL_HEIGHT), (0, 0, 0, 0))
        x = (CELL_WIDTH - crop.width) // 2
        y = CELL_HEIGHT - crop.height - 5
        cell.alpha_composite(crop, (x, y))
        output.append(cell)

    return output


def read_row(spec: RowSpec) -> tuple[list[Image.Image], dict[str, object]]:
    path = SOURCE_DIR / spec.source
    if not path.is_file():
        raise FileNotFoundError(f"missing source GIF: {path}")

    with Image.open(path) as animation:
        indices = sample_indices(animation.n_frames, spec.frames)
        raw_frames = []
        durations = []
        for index in indices:
            animation.seek(index)
            raw_frames.append(animation.convert("RGBA"))
            durations.append(int(animation.info.get("duration", 100)))

        metadata = {
            "state": spec.state,
            "source": str(path.relative_to(ROOT)).replace("\\", "/"),
            "source_sha256": sha256(path),
            "source_total_frames": animation.n_frames,
            "selected_indices": indices,
            "selected_durations_ms": durations,
        }

    return fit_stable_frames(raw_frames), metadata


def save_preview(state: str, frames: list[Image.Image]) -> None:
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
    frames[0].save(
        PREVIEW_DIR / f"{state}.gif",
        save_all=True,
        append_images=frames[1:],
        duration=100,
        loop=0,
        disposal=2,
        optimize=False,
    )


def main() -> None:
    PACKAGE_DIR.mkdir(parents=True, exist_ok=True)
    QA_DIR.mkdir(parents=True, exist_ok=True)
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)

    atlas = Image.new("RGBA", ATLAS_SIZE, (0, 0, 0, 0))
    report_rows = []

    for row_index, spec in enumerate(ROWS):
        frames, metadata = read_row(spec)
        for column, frame in enumerate(frames):
            atlas.alpha_composite(frame, (column * CELL_WIDTH, row_index * CELL_HEIGHT))
        save_preview(spec.state, frames)
        metadata["atlas_row"] = row_index
        metadata["output_frames"] = len(frames)
        report_rows.append(metadata)

    spritesheet = PACKAGE_DIR / "spritesheet.webp"
    atlas.save(spritesheet, "WEBP", lossless=True, method=6, exact=True)

    report = {
        "ok": True,
        "policy": "source-only",
        "image_generation_used": False,
        "transformations": ["frame selection", "stable crop", "uniform resize", "atlas composition"],
        "cell_size": [CELL_WIDTH, CELL_HEIGHT],
        "atlas_size": list(ATLAS_SIZE),
        "rows": report_rows,
        "spritesheet": str(spritesheet.relative_to(ROOT)).replace("\\", "/"),
        "spritesheet_sha256": sha256(spritesheet),
    }
    (QA_DIR / "build-report.json").write_text(
        json.dumps(report, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"Wrote {spritesheet}")
    print(f"Wrote {QA_DIR / 'build-report.json'}")


if __name__ == "__main__":
    main()
