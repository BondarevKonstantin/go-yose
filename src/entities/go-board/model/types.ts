export type StoneColor = 'black' | 'white';

export type BoardPoint = {
  x: number;
  y: number;
};

export type Stone = BoardPoint & {
  color: StoneColor;
};

export type BoardViewport =
  | { type: 'full' }
  | {
      type: 'corner';
      corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
      width: number;
      height: number;
    }
  | {
      type: 'side';
      side: 'top' | 'right' | 'bottom' | 'left';
      width: number;
      height: number;
    }
  | {
      type: 'custom';
      xMin: number;
      xMax: number;
      yMin: number;
      yMax: number;
    };