import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Marker } from '@/entities/go-board/model/types';
import { mockCards } from '@/entities/yose-card/model/mockCards';
import { getBestVariation } from '@/entities/yose-card/model/helpers';
import { YoseCard } from '@/entities/yose-card/model/types';
import { AnswerFormState, QuizPhase } from './model/types';
import { useReviewSession } from './model/useReviewSession';
import { BoardCard } from './ui/BoardCard';
import { ResultPanel } from './ui/ResultPanel';
import { ReviewPanel } from './ui/ReviewPanel';
import { QuizSolveMode, SolvePanel } from './ui/SolvePanel';
import { Layout, Page, PanelStack } from './ui/quizPage.styles';

export const QuizPage = () => {
  const { cardId } = useParams<{ cardId?: string }>();
  const [cardIndex, setCardIndex] = useState(0);

  const isSingleCardMode = Boolean(cardId);

  const card = useMemo(() => {
    if (cardId) {
      return mockCards.find((item) => item.id === cardId) ?? mockCards[0];
    }

    return mockCards[cardIndex];
  }, [cardId, cardIndex]);

  return (
    <QuizPageContent
      key={`${card.id}-${isSingleCardMode ? 'single' : `training-${cardIndex}`}`}
      card={card}
      isSingleCardMode={isSingleCardMode}
      onNextCard={() => {
        if (isSingleCardMode) {
          return;
        }

        setCardIndex((prev) => (prev + 1) % mockCards.length);
      }}
    />
  );
};

type QuizPageContentProps = {
  card: YoseCard;
  isSingleCardMode: boolean;
  onNextCard: () => void;
};

const QuizPageContent = ({ card, isSingleCardMode, onNextCard }: QuizPageContentProps) => {
  const {
    initialScenario,
    review,
    setReview,
    resetReviewState,
    clearReviewTimeouts,
    handleBoardPointClick,
    handleGuidedPass,
    handleStepViewerNextMove,
    handleSelfPlayPass,
    handleReviewModeChange,
    handleStepViewerPass,
  } = useReviewSession(card);

  const [phase, setPhase] = useState<QuizPhase>('answering');
  const [solveMode, setSolveMode] = useState<QuizSolveMode>('full');

  const [answerForm, setAnswerForm] = useState<AnswerFormState>({
    value: '',
    resultType: '',
  });

  const markers = useMemo<Marker[]>(() => {
    if (phase !== 'answering') return [];
    if (solveMode !== 'count-only') return [];

    const bestVariation = getBestVariation(initialScenario.variations);
    const firstMove = bestVariation?.moves[0];

    if (!firstMove || firstMove.type !== 'play') {
      return [];
    }

    return [
      {
        type: 'triangle',
        x: firstMove.x,
        y: firstMove.y,
      },
    ];
  }, [phase, solveMode, initialScenario]);

  const handleCheckAnswer = () => {
    const isValueCorrect = Number(answerForm.value) === card.value;
    const isTypeCorrect = answerForm.resultType === card.resultType;

    setPhase('review');

    setReview((prev) => ({
      ...prev,
      message:
        isValueCorrect && isTypeCorrect
          ? '✅ Correct'
          : '❌ Incorrect. Review the answer and the lines',
    }));
  };

  const handleNextCard = () => {
    if (isSingleCardMode) {
      return;
    }

    clearReviewTimeouts();
    setSolveMode('full');
    onNextCard();
  };

  return (
    <Page>
      <Layout>
        <BoardCard
          title={card.title ?? card.id}
          size={card.size}
          viewport={card.viewport}
          solveModeLabel={solveMode === 'full' ? 'Full task' : 'Count only'}
          stones={phase === 'answering' ? initialScenario.initialStones : review.currentStones}
          markers={markers}
          isInteractive={
            phase === 'review' &&
            (review.mode === 'guided' || review.mode === 'self-play') &&
            review.progress !== 'finished' &&
            !review.isAnimating
          }
          onPointClick={handleBoardPointClick}
        />

        <PanelStack>
          {phase === 'answering' && (
            <SolvePanel
              solveMode={solveMode}
              answerForm={answerForm}
              onSolveModeChange={setSolveMode}
              onAnswerFormChange={setAnswerForm}
              onSubmit={handleCheckAnswer}
            />
          )}

          {phase === 'review' && (
            <>
              <ResultPanel
                message={review.message}
                correctValue={card.value}
                correctResultType={card.resultType}
              />

              <ReviewPanel
                review={review}
                isSingleCardMode={isSingleCardMode}
                onStepViewerPass={handleStepViewerPass}
                onModeChange={handleReviewModeChange}
                onGuidedPass={handleGuidedPass}
                onStepViewerNextMove={handleStepViewerNextMove}
                onSelfPlayPass={handleSelfPlayPass}
                onReset={resetReviewState}
                onNextCard={handleNextCard}
              />
            </>
          )}
        </PanelStack>
      </Layout>
    </Page>
  );
};
