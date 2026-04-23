import { BoardViewport, Stone } from '@/entities/go-board/model/types';

export type YoseResultType = 'sente' | 'gote' | 'reverse-sente' | 'double-sente';

export type MoveColor = 'black' | 'white';

export type YoseMove =
  | {
      type: 'play';
      x: number;
      y: number;
      color: MoveColor;
    }
  | {
      type: 'pass';
      color: MoveColor;
    };

export type YoseVariation = {
  id: string;
  moves: YoseMove[];
  isBest?: boolean;
  isKnownButBad?: boolean;
  label?: string;
  message?: string;
  followUpScenarioId?: string;
};

export type YoseScenario = {
  id: string;
  initialStones: Stone[];
  startingColor: MoveColor;
  variations: YoseVariation[];
  label?: string;
  message?: string;
};

export type YoseCard = {
  id: string;
  title?: string;
  size: 9 | 13 | 19;
  viewport: BoardViewport;

  value: number;
  resultType: YoseResultType;

  initialScenarioId: string;
  scenarios: YoseScenario[];

  explanation?: string;
};
