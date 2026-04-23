import { Stone, BoardViewport } from '@/entities/go-board/model/types';

export type YoseResultType = 'sente' | 'gote' | 'reverse-sente' | 'double-sente';

export type YoseCard = {
  id: string;

  size: 9 | 13 | 19;
  viewport: BoardViewport;

  stones: Stone[];

  correctMove: {
    x: number;
    y: number;
  };

  value: number; // очки (например 2, 3, 5)
  resultType: YoseResultType;
};
