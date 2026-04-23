import { GoBoard } from '@/entities/go-board/ui/GoBoard';

export const HomePage = () => {
  return (
    <GoBoard
      size={9}
      viewport={{
        type: 'corner',
        corner: 'top-right',
        width: 5,
        height: 6,
      }}
      stones={[
        { x: 7, y: 2, color: 'black' },
        { x: 6, y: 4, color: 'black' },
        { x: 7, y: 4, color: 'black' },
        { x: 6, y: 5, color: 'white' },
        { x: 7, y: 5, color: 'white' },
        { x: 7, y: 7, color: 'white' },
      ]}
    />
  );
};