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
}: ReviewPanelProps) => {
  return (
    <Panel>
      <PanelTitle>Review</PanelTitle>

      <SegmentedControl>
        {[
          { key: 'guided', label: 'Guided' },
          { key: 'step-viewer', label: 'Step' },
          { key: 'self-play', label: 'Self' },
        ].map((item) => (
          <SegmentButton
            key={item.key}
            $active={review.mode === item.key}
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
        <Button
          onClick={onStepViewerNextMove}
          disabled={review.isAnimating || review.progress === 'finished'}
        >
          Next move
        </Button>
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

        {!isSingleCardMode && (
          <Button style={{ marginLeft: 8 }} onClick={onNextCard}>
            Next card
          </Button>
        )}
      </div>
    </Panel>
  );
};
