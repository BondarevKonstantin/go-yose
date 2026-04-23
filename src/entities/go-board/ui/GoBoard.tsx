import { useMemo, useState } from 'react';
import {
  getBoardPixelPosition,
  getStarPoints,
  getVisibleArea,
  getVisibleEdges,
  getVisiblePoints,
  isPointInVisibleArea,
} from '../model/boardMath';
import { BoardPoint, BoardViewport, Marker, Stone } from '../model/types';

type Props = {
  size?: 9 | 13 | 19;
  boardSizePx?: number;
  stones?: Stone[];
  markers?: Marker[];
  viewport?: BoardViewport;
  onPointClick?: (point: BoardPoint) => void;
};

export const GoBoard = ({
  size = 9,
  boardSizePx = 560,
  stones = [],
  markers = [],
  viewport = { type: 'full' },
  onPointClick,
}: Props) => {
  const [hoveredPoint, setHoveredPoint] = useState<BoardPoint | null>(null);

  const padding = 36;
  const edgeStrokeWidth = 2.6;
  const edgeBleed = edgeStrokeWidth / 2 + 1;

  const {
    cellSize,
    visibleArea,
    visibleEdges,
    verticalLines,
    horizontalLines,
    innerStart,
    innerEndX,
    innerEndY,
    stoneRadius,
    starPoints,
    visibleStones,
    visibleMarkers,
    visiblePoints,
    isHoveredPointVisible,
    viewBox,
    svgWidth,
    svgHeight,
  } = useMemo(() => {
    const area = getVisibleArea(size, viewport);

    const visibleColumns = area.xMax - area.xMin + 1;
    const visibleRows = area.yMax - area.yMin + 1;

    const innerWidth = boardSizePx - padding * 2;
    const innerHeight = boardSizePx - padding * 2;

    const nextCellSize = Math.min(
      innerWidth / Math.max(visibleColumns - 1, 1),
      innerHeight / Math.max(visibleRows - 1, 1),
    );

    const realInnerWidth = nextCellSize * Math.max(visibleColumns - 1, 1);
    const realInnerHeight = nextCellSize * Math.max(visibleRows - 1, 1);

    const nextInnerEndX = padding + realInnerWidth;
    const nextInnerEndY = padding + realInnerHeight;

    const leftCrop = area.xMin === 1 ? padding - edgeBleed : padding + nextCellSize / 2;
    const rightCrop =
      area.xMax === size ? nextInnerEndX + edgeBleed : nextInnerEndX - nextCellSize / 2;
    const topCrop = area.yMin === 1 ? padding - edgeBleed : padding + nextCellSize / 2;
    const bottomCrop =
      area.yMax === size ? nextInnerEndY + edgeBleed : nextInnerEndY - nextCellSize / 2;

    const nextViewBox = {
      x: leftCrop,
      y: topCrop,
      width: rightCrop - leftCrop,
      height: bottomCrop - topCrop,
    };

    const longerSide = Math.max(nextViewBox.width, nextViewBox.height);
    const scale = boardSizePx / longerSide;

    return {
      cellSize: nextCellSize,
      visibleArea: area,
      visibleEdges: getVisibleEdges(size, area),
      verticalLines: Array.from({ length: visibleColumns }, (_, index) => index),
      horizontalLines: Array.from({ length: visibleRows }, (_, index) => index),
      innerStart: padding,
      innerEndX: nextInnerEndX,
      innerEndY: nextInnerEndY,
      stoneRadius: nextCellSize * 0.42,
      starPoints: getStarPoints(size).filter((point) => isPointInVisibleArea(point, area)),
      visibleStones: stones.filter((stone) => isPointInVisibleArea(stone, area)),
      visibleMarkers: markers.filter((marker) => isPointInVisibleArea(marker, area)),
      visiblePoints: getVisiblePoints(area),
      isHoveredPointVisible: hoveredPoint ? isPointInVisibleArea(hoveredPoint, area) : false,
      viewBox: nextViewBox,
      svgWidth: nextViewBox.width * scale,
      svgHeight: nextViewBox.height * scale,
    };
  }, [boardSizePx, padding, size, stones, markers, viewport, hoveredPoint, edgeBleed]);

  const hoveredPointPosition =
    hoveredPoint && isHoveredPointVisible
      ? getBoardPixelPosition({
          point: hoveredPoint,
          cellSize,
          padding,
          xMin: visibleArea.xMin,
          yMin: visibleArea.yMin,
        })
      : null;

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
    >
      <defs>
        <radialGradient id="board-bg" cx="50%" cy="45%" r="75%">
          <stop offset="0%" stopColor="#f6f2ea" />
          <stop offset="100%" stopColor="#ece6da" />
        </radialGradient>

        <radialGradient id="black-stone" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#4a4a4a" />
          <stop offset="45%" stopColor="#1d1d1d" />
          <stop offset="100%" stopColor="#0b0b0b" />
        </radialGradient>

        <radialGradient id="white-stone" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#f3f3f3" />
          <stop offset="100%" stopColor="#dddddd" />
        </radialGradient>
      </defs>

      <rect
        x={viewBox.x}
        y={viewBox.y}
        width={viewBox.width}
        height={viewBox.height}
        fill="url(#board-bg)"
      />

      {verticalLines.map((index) => {
        const x = innerStart + index * cellSize;

        return (
          <line
            key={`vertical-${index}`}
            x1={x}
            y1={innerStart}
            x2={x}
            y2={innerEndY}
            stroke="#2f2c28"
            strokeWidth={1.4}
            shapeRendering="geometricPrecision"
          />
        );
      })}

      {horizontalLines.map((index) => {
        const y = innerStart + index * cellSize;

        return (
          <line
            key={`horizontal-${index}`}
            x1={innerStart}
            y1={y}
            x2={innerEndX}
            y2={y}
            stroke="#2f2c28"
            strokeWidth={1.4}
            shapeRendering="geometricPrecision"
          />
        );
      })}

      {starPoints.map((point) => {
        const position = getBoardPixelPosition({
          point,
          cellSize,
          padding,
          xMin: visibleArea.xMin,
          yMin: visibleArea.yMin,
        });

        return (
          <circle
            key={`star-${point.x}-${point.y}`}
            cx={position.x}
            cy={position.y}
            r={cellSize * 0.08}
            fill="#2b2824"
          />
        );
      })}

      {visibleEdges.top && (
        <line
          x1={innerStart}
          y1={innerStart}
          x2={innerEndX}
          y2={innerStart}
          stroke="#2b2824"
          strokeWidth={edgeStrokeWidth}
          shapeRendering="geometricPrecision"
        />
      )}

      {visibleEdges.right && (
        <line
          x1={innerEndX}
          y1={innerStart}
          x2={innerEndX}
          y2={innerEndY}
          stroke="#2b2824"
          strokeWidth={edgeStrokeWidth}
          shapeRendering="geometricPrecision"
        />
      )}

      {visibleEdges.bottom && (
        <line
          x1={innerStart}
          y1={innerEndY}
          x2={innerEndX}
          y2={innerEndY}
          stroke="#2b2824"
          strokeWidth={edgeStrokeWidth}
          shapeRendering="geometricPrecision"
        />
      )}

      {visibleEdges.left && (
        <line
          x1={innerStart}
          y1={innerStart}
          x2={innerStart}
          y2={innerEndY}
          stroke="#2b2824"
          strokeWidth={edgeStrokeWidth}
          shapeRendering="geometricPrecision"
        />
      )}

      {hoveredPointPosition && (
        <circle
          cx={hoveredPointPosition.x}
          cy={hoveredPointPosition.y}
          r={cellSize * 0.24}
          fill="#d64545"
          opacity={0.18}
          pointerEvents="none"
        />
      )}

      {visiblePoints.map((point) => {
        const position = getBoardPixelPosition({
          point,
          cellSize,
          padding,
          xMin: visibleArea.xMin,
          yMin: visibleArea.yMin,
        });

        return (
          <circle
            key={`hit-area-${point.x}-${point.y}`}
            cx={position.x}
            cy={position.y}
            r={cellSize * 0.32}
            fill="transparent"
            onMouseEnter={() => setHoveredPoint(point)}
            onMouseLeave={() => setHoveredPoint(null)}
            onClick={() => onPointClick?.(point)}
            style={{ cursor: onPointClick ? 'pointer' : 'default' }}
          />
        );
      })}

      {visibleStones.map((stone) => {
        const position = getBoardPixelPosition({
          point: stone,
          cellSize,
          padding,
          xMin: visibleArea.xMin,
          yMin: visibleArea.yMin,
        });

        const isBlack = stone.color === 'black';

        return (
          <g key={`${stone.color}-${stone.x}-${stone.y}`}>
            {!isBlack && (
              <circle
                cx={position.x}
                cy={position.y}
                r={stoneRadius}
                fill="none"
                stroke="#d8d1c4"
                strokeWidth={1}
              />
            )}

            <circle
              cx={position.x}
              cy={position.y}
              r={stoneRadius}
              fill={isBlack ? 'url(#black-stone)' : 'url(#white-stone)'}
              stroke={isBlack ? '#111111' : '#cfc7bb'}
              strokeWidth={1}
            />
          </g>
        );
      })}

      {visibleMarkers.map((marker) => {
        const position = getBoardPixelPosition({
          point: marker,
          cellSize,
          padding,
          xMin: visibleArea.xMin,
          yMin: visibleArea.yMin,
        });

        if (marker.type === 'triangle') {
          const triangleSize = stoneRadius * 0.8;

          const points = [
            `${position.x},${position.y - triangleSize}`,
            `${position.x - triangleSize * 0.866},${position.y + triangleSize / 2}`,
            `${position.x + triangleSize * 0.866},${position.y + triangleSize / 2}`,
          ].join(' ');

          return (
            <polygon
              key={`marker-${marker.type}-${marker.x}-${marker.y}`}
              points={points}
              fill="none"
              stroke="#d64545"
              strokeWidth={2.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        }

        return null;
      })}
    </svg>
  );
};
