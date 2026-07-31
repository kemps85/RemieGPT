#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPO_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
PACKAGE_DIR="$REPO_ROOT/pet/remi"
CODEX_ROOT="${CODEX_HOME:-$HOME/.codex}"
DESTINATION="$CODEX_ROOT/pets/remi"

if [ ! -f "$PACKAGE_DIR/pet.json" ]; then
  echo "Missing package file: $PACKAGE_DIR/pet.json" >&2
  exit 1
fi

if [ ! -f "$PACKAGE_DIR/spritesheet.webp" ]; then
  echo "Missing package file: $PACKAGE_DIR/spritesheet.webp" >&2
  exit 1
fi

mkdir -p "$DESTINATION"
cp "$PACKAGE_DIR/pet.json" "$DESTINATION/pet.json"
cp "$PACKAGE_DIR/spritesheet.webp" "$DESTINATION/spritesheet.webp"

printf "\nRemi installed to:\n  %s\n\n" "$DESTINATION"
printf "Open Codex, go to Settings > Pets, select Refresh, then choose Remi.\n"
printf "Use /pet to wake or tuck away the pet.\n"
