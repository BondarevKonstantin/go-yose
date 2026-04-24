import { ReviewSessionState } from '../model/types';
import { Button, Panel, PanelTitle, SegmentedControl, SegmentButton } from './quizPage.styles';

type ReviewPanelProps = {
  review: ReviewSessionState;
  isSingleCardMode: boolean;
  onModeChange: (mode: ReviewSessionState['mode']) => void;
  onGuidedPass: () => void;
  onStepViewerNextMove: () => void;
  onSelfPlayPass: () => void;
  onReset: () => void;
  onNextCard: () => void;
  onStepViewerPass: () => void;
};

export const ReviewPanel = ({
  review,
  isSingleCardMode,
  onModeChange,
  onGuidedPass,
  onStepViewerNextMove,
  onSelfPlayPass,
  onReset,
  onNextCard,
  onStepViewerPass,
}: ReviewPanelProps) => {
  return (
    <Panel>
      <PanelTitle>Review</PanelTitle>

      <SegmentedControl>
        {[
          {
            key: 'guided',
            label: 'Guided',
            title: 'You make a move, and the system automatically responds with the next move',
          },
          {
            key: 'step-viewer',
            label: 'Step',
            title: 'You go through the correct variation step by step',
          },
          {
            key: 'self-play',
            label: 'Self',
            title: 'You reproduce the entire variation on your own',
          },
        ].map((item) => (
          <SegmentButton
            key={item.key}
            $active={review.mode === item.key}
            title={item.title}
            onClick={() => onModeChange(item.key as ReviewSessionState['mode'])}
          >
            {item.label}
          </SegmentButton>
        ))}
      </SegmentedControl>

      {review.mode === 'guided' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            onClick={onGuidedPass}
            disabled={review.progress !== 'idle' || review.isAnimating}
          >
            Pass
          </Button>
        </div>
      )}

      {review.mode === 'step-viewer' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            onClick={onStepViewerNextMove}
            disabled={review.isAnimating || review.progress === 'finished'}
          >
            Next move
          </Button>

          <Button
            onClick={onStepViewerPass}
            disabled={review.isAnimating || review.progress === 'finished'}
          >
            Pass
          </Button>
        </div>
      )}

      {review.mode === 'self-play' && (
        <Button
          onClick={onSelfPlayPass}
          disabled={review.progress !== 'idle' || review.isAnimating}
        >
          Pass
        </Button>
      )}

      <div style={{ marginTop: 12 }}>
        <Button onClick={onReset}>Reset</Button>
      </div>

      {!isSingleCardMode && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
          <Button onClick={onNextCard}>Next card</Button>
        </div>
      )}
    </Panel>
  );
};
