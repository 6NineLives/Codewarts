/** Portrait frame aspect (9:16) used when the API omits frameAspect. */
export const PORTRAIT_FRAME_ASPECT = 9 / 16;

/**
 * Map normalized landmark coords (0–1 in the processed frame) onto a viewport
 * that displays the camera feed with resizeMode="cover".
 */
export function mapNormalizedPointCover(
  x: number,
  y: number,
  sourceAspect: number,
  viewportW: number,
  viewportH: number,
  mirrorX: boolean,
): { x: number; y: number } {
  const viewportAspect = viewportW / viewportH;
  let nx = x;
  let ny = y;

  if (sourceAspect > viewportAspect) {
    const visibleFraction = viewportAspect / sourceAspect;
    const offset = (1 - visibleFraction) / 2;
    nx = (x - offset) / visibleFraction;
  } else if (sourceAspect < viewportAspect) {
    const visibleFraction = sourceAspect / viewportAspect;
    const offset = (1 - visibleFraction) / 2;
    ny = (y - offset) / visibleFraction;
  }

  if (mirrorX) {
    nx = 1 - nx;
  }

  return { x: nx * viewportW, y: ny * viewportH };
}
