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
            message: 'Best move',
            moves: [
              { type: 'play', x: 9, y: 5, color: 'black' },
              { type: 'play', x: 9, y: 6, color: 'white' },
              { type: 'play', x: 9, y: 4, color: 'black' },
            ],
          },
          {
            id: 'pass',
            message: 'If Black ignores this point',
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
      height: 10,
    },
    value: 7,
    resultType: 'sente',
    initialScenarioId: 'main',
    scenarios: [
      {
        id: 'main',
        startingColor: 'black',
        initialStones: [
          { x: 17, y: 13, color: 'black' },
          { x: 16, y: 12, color: 'black' },
          { x: 17, y: 12, color: 'black' },
          { x: 18, y: 12, color: 'black' },

          { x: 17, y: 11, color: 'white' },
          { x: 17, y: 10, color: 'white' },
          { x: 16, y: 10, color: 'white' },
          { x: 16, y: 9, color: 'white' },
          { x: 16, y: 8, color: 'white' },
          { x: 17, y: 7, color: 'white' },
          { x: 17, y: 6, color: 'white' },
        ],
        variations: [
          {
            id: 'best',
            isBest: true,
            message: 'Best move',
            moves: [
              { type: 'play', x: 19, y: 9, color: 'black' },
              { type: 'play', x: 18, y: 9, color: 'white' },
              { type: 'play', x: 19, y: 10, color: 'black' },
              { type: 'play', x: 18, y: 11, color: 'white' },
              { type: 'play', x: 19, y: 11, color: 'black' },
              { type: 'play', x: 18, y: 8, color: 'white' },
              { type: 'play', x: 19, y: 8, color: 'black' },
              { type: 'play', x: 19, y: 7, color: 'white' },
            ],
          },
          {
            id: 'worse',
            isBest: true,
            message: 'Not the best move',
            moves: [
              { type: 'play', x: 19, y: 10, color: 'black' },
              { type: 'play', x: 19, y: 9, color: 'white' },
              { type: 'play', x: 18, y: 11, color: 'black' },
              { type: 'play', x: 18, y: 10, color: 'white' },
              { type: 'play', x: 19, y: 11, color: 'black' },
            ],
          },
          {
            id: 'ok',
            isBest: false,
            message: 'Also a good move',
            moves: [
              { type: 'play', x: 19, y: 11, color: 'black' },
              { type: 'play', x: 18, y: 9, color: 'white' },
              { type: 'play', x: 19, y: 9, color: 'black' },
              { type: 'play', x: 19, y: 8, color: 'white' },
              { type: 'play', x: 19, y: 10, color: 'black' },
              { type: 'play', x: 18, y: 8, color: 'white' },
            ],
          },
          {
            id: 'pass',
            message: 'If Black ignores this point',
            moves: [
              { type: 'pass', color: 'black' },
              { type: 'play', x: 18, y: 11, color: 'white' },
              { type: 'play', x: 19, y: 11, color: 'black' },
              { type: 'play', x: 19, y: 10, color: 'white' },
              { type: 'play', x: 19, y: 12, color: 'black' },
            ],
          },
        ],
      },
    ],
    explanation: 'Monkey Jump',
  },
];
