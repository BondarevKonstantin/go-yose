import { BoardPoint, BoardViewport } from './types';

type GetBoardPixelPositionParams = {
  point: BoardPoint;
  cellSize: number;
  padding: number;
  xMin: number;
  yMin: number;
};

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

type DisplayBounds = {
  xStart: number;
  xEnd: number;
  yStart: number;
  yEnd: number;
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

export const getStarPoints = (size: 9 | 13 | 19): BoardPoint[] => {
  const offset = size === 19 ? 4 : 3;
  const far = size - offset + 1;

  return [
    { x: offset, y: offset },
    { x: offset, y: far },
    { x: far, y: offset },
    { x: far, y: far },
  ];
};

export const getVisibleArea = (
  size: 9 | 13 | 19,
  viewport: BoardViewport,
): VisibleArea => {
  if (viewport.type === 'full') {
    return {
      xMin: 1,
      xMax: size,
      yMin: 1,
      yMax: size,
    };
  }

  if (viewport.type === 'custom') {
    return {
      xMin: viewport.xMin,
      xMax: viewport.xMax,
      yMin: viewport.yMin,
      yMax: viewport.yMax,
    };
  }

  if (viewport.type === 'corner') {
    if (viewport.corner === 'top-left') {
      return {
        xMin: 1,
        xMax: viewport.width,
        yMin: 1,
        yMax: viewport.height,
      };
    }

    if (viewport.corner === 'top-right') {
      return {
        xMin: size - viewport.width + 1,
        xMax: size,
        yMin: 1,
        yMax: viewport.height,
      };
    }

    if (viewport.corner === 'bottom-left') {
      return {
        xMin: 1,
        xMax: viewport.width,
        yMin: size - viewport.height + 1,
        yMax: size,
      };
    }

    return {
      xMin: size - viewport.width + 1,
      xMax: size,
      yMin: size - viewport.height + 1,
      yMax: size,
    };
  }

  if (viewport.side === 'top') {
    return {
      xMin: 1,
      xMax: viewport.width,
      yMin: 1,
      yMax: viewport.height,
    };
  }

  if (viewport.side === 'bottom') {
    return {
      xMin: 1,
      xMax: viewport.width,
      yMin: size - viewport.height + 1,
      yMax: size,
    };
  }

  if (viewport.side === 'left') {
    return {
      xMin: 1,
      xMax: viewport.width,
      yMin: 1,
      yMax: viewport.height,
    };
  }

  return {
    xMin: size - viewport.width + 1,
    xMax: size,
    yMin: 1,
    yMax: viewport.height,
  };
};

export const isPointInVisibleArea = (point: BoardPoint, area: VisibleArea) => {
  return (
    point.x >= area.xMin &&
    point.x <= area.xMax &&
    point.y >= area.yMin &&
    point.y <= area.yMax
  );
};

export const getVisibleEdges = (
  size: 9 | 13 | 19,
  area: VisibleArea,
): VisibleEdges => {
  return {
    top: area.yMin === 1,
    right: area.xMax === size,
    bottom: area.yMax === size,
    left: area.xMin === 1,
  };
};

export const getDisplayBounds = ({
  padding,
  cellSize,
  xMin,
  xMax,
  yMin,
  yMax,
  boardSize,
}: {
  padding: number;
  cellSize: number;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  boardSize: 9 | 13 | 19;
}): DisplayBounds => {
  const leftLineX = padding;
  const rightLineX = padding + (xMax - xMin) * cellSize;
  const topLineY = padding;
  const bottomLineY = padding + (yMax - yMin) * cellSize;

  return {
    xStart: xMin === 1 ? leftLineX : leftLineX - cellSize / 2,
    xEnd: xMax === boardSize ? rightLineX : rightLineX + cellSize / 2,
    yStart: yMin === 1 ? topLineY : topLineY - cellSize / 2,
    yEnd: yMax === boardSize ? bottomLineY : bottomLineY + cellSize / 2,
  };
};