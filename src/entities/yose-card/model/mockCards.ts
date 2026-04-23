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

  {
    id: 'card-02',
    title: 'Side yose #02',
    size: 19,
    viewport: {
      type: 'side',
      side: 'right',
      width: 5,
      height: 9,
    },
    value: 0, // TODO
    resultType: 'gote', // TODO
    initialScenarioId: 'main',
    scenarios: [
      {
        id: 'main',
        startingColor: 'black',
        initialStones: [
          // black
          { x: 7, y: 7, color: 'black' },
          { x: 8, y: 7, color: 'black' },
          { x: 9, y: 7, color: 'black' },
          { x: 8, y: 8, color: 'black' },

          // white
          { x: 8, y: 2, color: 'white' },
          { x: 8, y: 3, color: 'white' },
          { x: 7, y: 4, color: 'white' },
          { x: 7, y: 5, color: 'white' },
          { x: 7, y: 6, color: 'white' },
          { x: 8, y: 6, color: 'white' },
        ],
        variations: [
          {
            id: 'best',
            isBest: true,
            message: 'Лучший ход',
            moves: [
              { type: 'play', x: 9, y: 5, color: 'black' },
              { type: 'play', x: 9, y: 4, color: 'white' },
              { type: 'play', x: 9, y: 6, color: 'black' },
            ],
          },
          {
            id: 'pass',
            message: 'Если черные проигнорируют эту точку',
            moves: [
              { type: 'pass', color: 'black' },
              { type: 'play', x: 9, y: 5, color: 'white' },
              { type: 'play', x: 9, y: 6, color: 'black' },
            ],
          },
        ],
      },
    ],
    explanation: '',
  },
];
