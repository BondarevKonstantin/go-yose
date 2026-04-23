import { YoseCard } from './types';

export const mockCards: YoseCard[] = [
  {
    id: 'card-1',
    title: 'Corner yose example',
    size: 9,
    viewport: {
      type: 'corner',
      corner: 'top-right',
      width: 5,
      height: 6,
    },
    value: 3,
    resultType: 'sente',
    initialScenarioId: 'main',
    scenarios: [
      {
        id: 'main',
        startingColor: 'black',
        initialStones: [
          { x: 7, y: 2, color: 'black' },
          { x: 6, y: 4, color: 'black' },
          { x: 7, y: 4, color: 'black' },
          { x: 6, y: 5, color: 'white' },
          { x: 7, y: 5, color: 'white' },
        ],
        variations: [
          {
            id: 'best',
            isBest: true,
            message: 'Лучший ход',
            moves: [
              { type: 'play', x: 7, y: 3, color: 'black' },
              { type: 'play', x: 8, y: 3, color: 'white' },
            ],
          },
          {
            id: 'pass',
            message: 'Если проигнорировать эту точку',
            followUpScenarioId: 'after-pass',
            moves: [
              { type: 'pass', color: 'black' },
              { type: 'play', x: 8, y: 3, color: 'white' },
            ],
          },
        ],
      },
      {
        id: 'after-pass',
        startingColor: 'black',
        message: 'Теперь можно посмотреть продолжение.',
        initialStones: [
          { x: 7, y: 2, color: 'black' },
          { x: 6, y: 4, color: 'black' },
          { x: 7, y: 4, color: 'black' },
          { x: 6, y: 5, color: 'white' },
          { x: 7, y: 5, color: 'white' },
          { x: 8, y: 3, color: 'white' },
        ],
        variations: [
          {
            id: 'reply',
            isBest: true,
            moves: [
              { type: 'play', x: 7, y: 3, color: 'black' },
              { type: 'play', x: 8, y: 4, color: 'white' },
            ],
          },
        ],
      },
    ],
  },
];
