import { YoseCard } from './types';

export const mockCards: YoseCard[] = [
  {
    id: 'card-01',
    title: 'Corner yose #01',
    size: 9,
    viewport: {
      type: 'corner',
      corner: 'top-right',
      width: 5,
      height: 8,
    },
    value: 2,
    resultType: 'sente',
    initialScenarioId: 'main',
    scenarios: [
      {
        id: 'main',
        startingColor: 'black',
        initialStones: [
          { x: 8, y: 2, color: 'black' },
          { x: 7, y: 4, color: 'black' },
          { x: 8, y: 4, color: 'black' },

          { x: 7, y: 5, color: 'white' },
          { x: 8, y: 5, color: 'white' },
          { x: 8, y: 7, color: 'white' },
        ],
        variations: [
          {
            id: 'best',
            isBest: true,
            message: 'Лучший ход',
            moves: [
              { type: 'play', x: 9, y: 5, color: 'black' },
              { type: 'play', x: 9, y: 6, color: 'white' },
              { type: 'play', x: 9, y: 4, color: 'black' },
            ],
          },
          {
            id: 'pass',
            message: 'Если черные проигнорируют эту точку',
            moves: [
              { type: 'pass', color: 'black' },
              { type: 'play', x: 9, y: 4, color: 'white' },
              { type: 'play', x: 9, y: 3, color: 'black' },
              { type: 'play', x: 9, y: 5, color: 'white' },
            ],
          },
        ],
      },
    ],
    explanation: '',
  },
];
