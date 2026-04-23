import { useState } from 'react';
import { GoBoard } from '@/entities/go-board/ui/GoBoard';
import { mockCards } from '@/entities/yose-card/model/mockCards';
import { BoardPoint } from '@/entities/go-board/model/types';

export const QuizPage = () => {
  const [cardIndex, setCardIndex] = useState(0);
  const [selectedMove, setSelectedMove] = useState<BoardPoint | null>(null);

  const card = mockCards[cardIndex];

  const isCorrect =
    selectedMove && selectedMove.x === card.correctMove.x && selectedMove.y === card.correctMove.y;

  return (
    <div style={{ padding: 24 }}>
      <GoBoard
        size={card.size}
        viewport={card.viewport}
        stones={card.stones}
        markers={selectedMove ? [{ ...selectedMove, type: 'triangle' }] : []}
        onPointClick={setSelectedMove}
      />

      <div style={{ marginTop: 16 }}>
        <div>Выбери лучший ход</div>

        {selectedMove && (
          <div style={{ marginTop: 12 }}>{isCorrect ? '✅ Правильно' : '❌ Неправильно'}</div>
        )}
      </div>
    </div>
  );
};
