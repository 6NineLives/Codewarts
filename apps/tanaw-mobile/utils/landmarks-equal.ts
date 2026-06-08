import type { BonesLandmarks } from '@/types/bones-landmarks';

const EPS = 0.008;

function pointsEqual(
  a: BonesLandmarks['pose'],
  b: BonesLandmarks['pose'],
): boolean {
  if (!a?.length && !b?.length) return true;
  if (!a?.length || !b?.length || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 4) {
    const p = a[i]!;
    const q = b[i]!;
    if (Math.abs(p.x - q.x) > EPS || Math.abs(p.y - q.y) > EPS) return false;
  }
  return true;
}

/** Skip redundant SVG redraws when pose hasn't moved meaningfully. */
export function landmarksEqual(a: BonesLandmarks | null, b: BonesLandmarks | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    pointsEqual(a.pose, b.pose) &&
    pointsEqual(a.leftHand, b.leftHand) &&
    pointsEqual(a.rightHand, b.rightHand)
  );
}
