import { YoseCard } from './types';

export const mockCards: YoseCard[] = [
  {
    id: '1',
    size: 9,
    viewport: {
      type: 'corner',
      corner: 'top-right',
      width: 5,
      height: 6,
    },
    stones: [
      { x: 7, y: 2, color: 'black' },
      { x: 6, y: 4, color: 'black' },
      { x: 7, y: 4, color: 'black' },
      { x: 6, y: 5, color: 'white' },
      { x: 7, y: 5, color: 'white' },
    ],
    correctMove: { x: 7, y: 3 },
    value: 3,
    resultType: 'sente',
  },
];
