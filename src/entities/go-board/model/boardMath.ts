import { BoardPoint, BoardViewport } from './types';

type BoardSize = 9 | 13 | 19;

type VisibleArea = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
};

type VisibleEdges = {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
};

type GetBoardPixelPositionParams = {
  point: BoardPoint;
  cellSize: number;
  padding: number;
  xMin: number;
  yMin: number;
};

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const getCenteredRange = (size: BoardSize, length: number) => {
  const safeLength = clamp(length, 1, size);
  const start = Math.floor((size - safeLength) / 2) + 1;

  return {
    min: start,
    max: start + safeLength - 1,
  };
};

const normalizeArea = (size: BoardSize, area: VisibleArea): VisibleArea => {
  const xMin = clamp(Math.min(area.xMin, area.xMax), 1, size);
  const xMax = clamp(Math.max(area.xMin, area.xMax), 1, size);
  const yMin = clamp(Math.min(area.yMin, area.yMax), 1, size);
  const yMax = clamp(Math.max(area.yMin, area.yMax), 1, size);

  return {
    xMin,
    xMax,
    yMin,
    yMax,
  };
};

export const getVisibleArea = (size: BoardSize, viewport: BoardViewport): VisibleArea => {
  if (viewport.type === 'full') {
    return {
      xMin: 1,
      xMax: size,
      yMin: 1,
      yMax: size,
    };
  }

  if (viewport.type === 'custom') {
    return normalizeArea(size, viewport);
  }

  if (viewport.type === 'corner') {
    const width = clamp(viewport.width, 1, size);
    const height = clamp(viewport.height, 1, size);

    if (viewport.corner === 'top-left') {
      return {
        xMin: 1,
        xMax: width,
        yMin: 1,
        yMax: height,
      };
    }

    if (viewport.corner === 'top-right') {
      return {
        xMin: size - width + 1,
        xMax: size,
        yMin: 1,
        yMax: height,
      };
    }

    if (viewport.corner === 'bottom-left') {
      return {
        xMin: 1,
        xMax: width,
        yMin: size - height + 1,
        yMax: size,
      };
    }

    return {
      xMin: size - width + 1,
      xMax: size,
      yMin: size - height + 1,
      yMax: size,
    };
  }

  const width = clamp(viewport.width, 1, size);
  const height = clamp(viewport.height, 1, size);

  if (viewport.side === 'right') {
    const yRange = getCenteredRange(size, height);

    return {
      xMin: size - width + 1,
      xMax: size,
      yMin: yRange.min,
      yMax: yRange.max,
    };
  }

  if (viewport.side === 'left') {
    const yRange = getCenteredRange(size, height);

    return {
      xMin: 1,
      xMax: width,
      yMin: yRange.min,
      yMax: yRange.max,
    };
  }

  if (viewport.side === 'top') {
    const xRange = getCenteredRange(size, width);

    return {
      xMin: xRange.min,
      xMax: xRange.max,
      yMin: 1,
      yMax: height,
    };
  }

  const xRange = getCenteredRange(size, width);

  return {
    xMin: xRange.min,
    xMax: xRange.max,
    yMin: size - height + 1,
    yMax: size,
  };
};

export const getVisibleEdges = (size: BoardSize, area: VisibleArea): VisibleEdges => {
  return {
    top: area.yMin === 1,
    right: area.xMax === size,
    bottom: area.yMax === size,
    left: area.xMin === 1,
  };
};

export const getBoardPixelPosition = ({
  point,
  cellSize,
  padding,
  xMin,
  yMin,
}: GetBoardPixelPositionParams) => {
  return {
    x: padding + (point.x - xMin) * cellSize,
    y: padding + (point.y - yMin) * cellSize,
  };
};

export const isPointInVisibleArea = (point: BoardPoint, area: VisibleArea) => {
  return (
    point.x >= area.xMin && point.x <= area.xMax && point.y >= area.yMin && point.y <= area.yMax
  );
};

export const getVisiblePoints = (area: VisibleArea): BoardPoint[] => {
  const points: BoardPoint[] = [];

  for (let y = area.yMin; y <= area.yMax; y += 1) {
    for (let x = area.xMin; x <= area.xMax; x += 1) {
      points.push({ x, y });
    }
  }

  return points;
};

export const getStarPoints = (size: BoardSize): BoardPoint[] => {
  if (size === 9) {
    return [
      { x: 3, y: 3 },
      { x: 7, y: 3 },
      { x: 5, y: 5 },
      { x: 3, y: 7 },
      { x: 7, y: 7 },
    ];
  }

  if (size === 13) {
    return [
      { x: 4, y: 4 },
      { x: 10, y: 4 },
      { x: 7, y: 7 },
      { x: 4, y: 10 },
      { x: 10, y: 10 },
    ];
  }

  return [
    { x: 4, y: 4 },
    { x: 10, y: 4 },
    { x: 16, y: 4 },
    { x: 4, y: 10 },
    { x: 10, y: 10 },
    { x: 16, y: 10 },
    { x: 4, y: 16 },
    { x: 10, y: 16 },
    { x: 16, y: 16 },
  ];
};
