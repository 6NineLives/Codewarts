import { memo, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import {
  HAND_CONNECTIONS,
  POSE_CONNECTIONS,
  type BonePoint,
  type BonesLandmarks,
} from '@/types/bones-landmarks';
import { mapNormalizedPointCover, PORTRAIT_FRAME_ASPECT } from '@/utils/cover-landmarks';

const BONE_GREEN = '#00C83C';
const JOINT_GREEN = '#50FF64';
const MIN_VISIBILITY = 0.5;

type BonesSvgOverlayProps = {
  landmarks: BonesLandmarks | null;
  width: number;
  height: number;
  mirrorX?: boolean;
  /** Width / height of the frame the API processed (portrait 9:16). */
  sourceAspect?: number;
};

function mapPoint(
  point: BonePoint,
  width: number,
  height: number,
  mirrorX: boolean,
  sourceAspect: number,
) {
  if (sourceAspect > 0 && width > 0 && height > 0) {
    return mapNormalizedPointCover(point.x, point.y, sourceAspect, width, height, mirrorX);
  }
  const x = mirrorX ? (1 - point.x) * width : point.x * width;
  return { x, y: point.y * height };
}

function isVisible(point: BonePoint | undefined, requireVisibility: boolean) {
  if (!point) return false;
  return requireVisibility ? point.v >= MIN_VISIBILITY : true;
}

function renderConnections(
  points: BonePoint[] | null,
  connections: ReadonlyArray<readonly [number, number]>,
  width: number,
  height: number,
  mirrorX: boolean,
  sourceAspect: number,
  requireVisibility: boolean,
  keyPrefix: string,
) {
  if (!points?.length) return null;

  const lines = connections.map(([from, to]) => {
    const a = points[from];
    const b = points[to];
    if (!isVisible(a, requireVisibility) || !isVisible(b, requireVisibility)) {
      return null;
    }
    const start = mapPoint(a!, width, height, mirrorX, sourceAspect);
    const end = mapPoint(b!, width, height, mirrorX, sourceAspect);
    return (
      <Line
        key={`${keyPrefix}-l-${from}-${to}`}
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke={BONE_GREEN}
        strokeWidth={3}
        strokeLinecap="round"
      />
    );
  });

  const joints = points.map((point, index) => {
    if (!isVisible(point, requireVisibility)) return null;
    const mapped = mapPoint(point, width, height, mirrorX, sourceAspect);
    return (
      <Circle
        key={`${keyPrefix}-j-${index}`}
        cx={mapped.x}
        cy={mapped.y}
        r={4}
        fill={JOINT_GREEN}
      />
    );
  });

  return (
    <>
      {lines}
      {joints}
    </>
  );
}

function BonesSvgOverlayImpl({
  landmarks,
  width,
  height,
  mirrorX = false,
  sourceAspect = PORTRAIT_FRAME_ASPECT,
}: BonesSvgOverlayProps) {
  const content = useMemo(() => {
    if (!landmarks || width <= 0 || height <= 0) return null;
    return (
      <>
        {renderConnections(
          landmarks.pose,
          POSE_CONNECTIONS,
          width,
          height,
          mirrorX,
          sourceAspect,
          true,
          'pose',
        )}
        {renderConnections(
          landmarks.leftHand,
          HAND_CONNECTIONS,
          width,
          height,
          mirrorX,
          sourceAspect,
          false,
          'lh',
        )}
        {renderConnections(
          landmarks.rightHand,
          HAND_CONNECTIONS,
          width,
          height,
          mirrorX,
          sourceAspect,
          false,
          'rh',
        )}
      </>
    );
  }, [landmarks, width, height, mirrorX, sourceAspect]);

  if (!content) return null;

  return (
    <Svg
      width={width}
      height={height}
      style={[StyleSheet.absoluteFill, { zIndex: 10, elevation: 10 }]}
      pointerEvents="none"
    >
      {content}
    </Svg>
  );
}

export const BonesSvgOverlay = memo(BonesSvgOverlayImpl);
