export const MIN_PET_SIZE = 150;
export const MAX_PET_SIZE = 360;
export const MIN_VISIBLE_EDGE = 56;

export function normalizePetSize(value, fallback) {
  const size = Number(value);
  if (!Number.isFinite(size)) return fallback;
  return Math.max(MIN_PET_SIZE, Math.min(MAX_PET_SIZE, Math.round(size)));
}

function usableOverlap(position, size, area) {
  const left = Math.max(position.x, area.x);
  const top = Math.max(position.y, area.y);
  const right = Math.min(position.x + size, area.x + area.width);
  const bottom = Math.min(position.y + size, area.y + area.height);
  return right - left >= MIN_VISIBLE_EDGE && bottom - top >= MIN_VISIBLE_EDGE;
}

export function isPositionUsable(position, size, workAreas) {
  if (!Number.isInteger(position?.x) || !Number.isInteger(position?.y)) {
    return false;
  }
  return workAreas.some((area) => usableOverlap(position, size, area));
}

export function defaultPosition(size, workArea) {
  return {
    x: workArea.x + workArea.width - size - 18,
    y: workArea.y + workArea.height - size - 18
  };
}

export function safeWindowPosition({ position, size, workAreas, primaryWorkArea }) {
  if (isPositionUsable(position, size, workAreas)) return position;
  return defaultPosition(size, primaryWorkArea);
}
