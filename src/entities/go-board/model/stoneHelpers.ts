import { Stone } from './types';
import { YoseMove } from '@/entities/yose-card/model/types';

export const applyMoveToStones = (stones: Stone[], move: YoseMove): Stone[] => {
  if (move.type === 'pass') {
    return stones;
  }

  const hasStoneOnPoint = stones.some((stone) => stone.x === move.x && stone.y === move.y);

  if (hasStoneOnPoint) {
    return stones;
  }

  return [
    ...stones,
    {
      x: move.x,
      y: move.y,
      color: move.color,
    },
  ];
};
