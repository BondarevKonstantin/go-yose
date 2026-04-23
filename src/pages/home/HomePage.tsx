import { useState } from 'react';
import { GoBoard } from '@/entities/go-board/ui/GoBoard';
import { BoardPoint } from '@/entities/go-board/model/types';

export const HomePage = () => {
  const [selectedPoint, setSelectedPoint] = useState<BoardPoint | null>(null);

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
      markers={selectedPoint ? [{ ...selectedPoint, type: 'triangle' }] : []}
      onPointClick={setSelectedPoint}
    />
  );
};
