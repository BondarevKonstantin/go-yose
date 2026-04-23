import { BoardPoint, BoardViewport, Marker, Stone } from '@/entities/go-board/model/types';
import { GoBoard } from '@/entities/go-board/ui/GoBoard';
import { Card } from './quizPage.styles';

type BoardCardProps = {
  title: string;
  size: 9 | 13 | 19;
  viewport: BoardViewport;
  solveModeLabel: string;
  stones: Stone[];
  markers: Marker[];
  isInteractive: boolean;
  onPointClick: (point: BoardPoint) => void;
};

export const BoardCard = ({
  title,
  size,
  viewport,
  solveModeLabel,
  stones,
  markers,
  isInteractive,
  onPointClick,
}: BoardCardProps) => {
  return (
    <Card>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 600 }}>{title}</div>

        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
          {size}×{size} · {solveModeLabel}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <GoBoard
          size={size}
          viewport={viewport}
          boardSizePx={460}
          stones={stones}
          markers={markers}
          isInteractive={isInteractive}
          onPointClick={onPointClick}
        />
      </div>
    </Card>
  );
};
