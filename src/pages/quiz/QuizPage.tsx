import { useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { GoBoard } from '@/entities/go-board/ui/GoBoard';
import { BoardPoint, Marker } from '@/entities/go-board/model/types';
import { applyMoveToStones } from '@/entities/go-board/model/stoneHelpers';
import { mockCards } from '@/entities/yose-card/model/mockCards';
import {
  findVariationByFirstMove,
  getBestVariation,
  getScenarioById,
} from '@/entities/yose-card/model/helpers';
import {
  YoseCard,
  YoseMove,
  YoseResultType,
  YoseVariation,
} from '@/entities/yose-card/model/types';
import { AnswerFormState, QuizPhase, ReviewSessionState } from './model/types';

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

type QuizSolveMode = 'full' | 'count-only';

const QuizPageContent = ({ card, isSingleCardMode, onNextCard }: QuizPageContentProps) => {
  const initialScenario = useMemo(() => getScenarioById(card, card.initialScenarioId), [card]);

  const baseButtonStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: 10,
    border: '1px solid #e5e7eb',
    background: '#ffffff',
    color: '#374151',
    cursor: 'pointer',
    fontSize: 14,
    transition: 'all 0.15s ease',
  };

  const createInitialReviewState = (): ReviewSessionState => ({
    mode: 'guided',
    progress: 'idle',
    currentScenarioId: card.initialScenarioId,
    currentStones: initialScenario.initialStones,
    activeVariationId: null,
    currentMoveIndex: -1,
    isAnimating: false,
    message: null,
  });

  const [phase, setPhase] = useState<QuizPhase>('answering');
  const [solveMode, setSolveMode] = useState<QuizSolveMode>('full');

  const [answerForm, setAnswerForm] = useState<AnswerFormState>({
    value: '',
    resultType: '',
  });

  const [review, setReview] = useState<ReviewSessionState>(() => createInitialReviewState());

  const reviewTimeoutsRef = useRef<number[]>([]);

  const currentScenario = useMemo(
    () => getScenarioById(card, review.currentScenarioId),
    [card, review.currentScenarioId],
  );

  const markers = useMemo<Marker[]>(() => {
    // показываем только до ответа
    if (phase !== 'answering') return [];

    // только в режиме "посчитать"
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

  const clearReviewTimeouts = () => {
    reviewTimeoutsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });

    reviewTimeoutsRef.current = [];
  };

  const resetReviewState = () => {
    clearReviewTimeouts();
    setReview(createInitialReviewState());
  };

  const handleCheckAnswer = () => {
    const isValueCorrect = Number(answerForm.value) === card.value;
    const isTypeCorrect = answerForm.resultType === card.resultType;

    setPhase('review');

    setReview((prev) => ({
      ...prev,
      message:
        isValueCorrect && isTypeCorrect
          ? '✅ Правильно'
          : `❌ Неправильно (ответ: ${card.value}, ${card.resultType})`,
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

  const finishVariationIfNeeded = (variation: YoseVariation) => {
    clearReviewTimeouts();

    if (variation.followUpScenarioId) {
      const nextScenario = getScenarioById(card, variation.followUpScenarioId);

      setReview({
        mode: null,
        progress: 'idle',
        currentScenarioId: nextScenario.id,
        currentStones: nextScenario.initialStones,
        activeVariationId: null,
        currentMoveIndex: -1,
        isAnimating: false,
        message: nextScenario.message ?? variation.message ?? null,
      });

      return;
    }

    setReview((prev) => ({
      ...prev,
      progress: 'finished',
      isAnimating: false,
    }));
  };

  const playComputerMove = (variation: YoseVariation, moveIndex: number) => {
    const move = variation.moves[moveIndex];

    if (!move) {
      finishVariationIfNeeded(variation);
      return;
    }

    setReview((prev) => ({
      ...prev,
      currentMoveIndex: moveIndex,
      currentStones: applyMoveToStones(prev.currentStones, move),
      isAnimating: false,
    }));

    const isLastMove = moveIndex === variation.moves.length - 1;

    if (isLastMove) {
      const timeoutId = window.setTimeout(() => {
        finishVariationIfNeeded(variation);
      }, 150);

      reviewTimeoutsRef.current.push(timeoutId);
    }
  };

  const startGuidedVariation = (variation: YoseVariation) => {
    clearReviewTimeouts();

    const firstMove = variation.moves[0];

    if (!firstMove) {
      return;
    }

    setReview((prev) => ({
      ...prev,
      progress: 'in_progress',
      activeVariationId: variation.id,
      currentMoveIndex: 0,
      currentStones: applyMoveToStones(prev.currentStones, firstMove),
      message: variation.isKnownButBad
        ? (variation.message ?? 'Это не лучший вариант')
        : (variation.message ?? prev.message),
      isAnimating: variation.moves.length > 1,
    }));

    if (variation.moves.length === 1) {
      const timeoutId = window.setTimeout(() => {
        finishVariationIfNeeded(variation);
      }, 150);

      reviewTimeoutsRef.current.push(timeoutId);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      playComputerMove(variation, 1);
    }, 500);

    reviewTimeoutsRef.current.push(timeoutId);
  };

  const handleGuidedMoveClick = (point: BoardPoint) => {
    if (phase !== 'review' || review.mode !== 'guided') {
      return;
    }

    if (review.isAnimating || review.progress === 'finished') {
      return;
    }

    const move: YoseMove = {
      type: 'play',
      x: point.x,
      y: point.y,
      color: currentScenario.startingColor,
    };

    if (review.progress === 'idle') {
      const variation = findVariationByFirstMove(currentScenario.variations, move);

      if (!variation) {
        setReview((prev) => ({
          ...prev,
          message: 'Такого варианта нет',
        }));
        return;
      }

      startGuidedVariation(variation);
      return;
    }

    if (review.progress === 'in_progress') {
      const variation = currentScenario.variations.find(
        (item) => item.id === review.activeVariationId,
      );

      if (!variation) {
        return;
      }

      const expectedIndex = review.currentMoveIndex + 1;
      const expectedMove = variation.moves[expectedIndex];

      if (!expectedMove) {
        finishVariationIfNeeded(variation);
        return;
      }

      if (expectedMove.type !== 'play') {
        setReview((prev) => ({
          ...prev,
          message: 'Сейчас ожидается pass',
        }));
        return;
      }

      const isCorrect = expectedMove.x === point.x && expectedMove.y === point.y;

      if (!isCorrect) {
        setReview((prev) => ({
          ...prev,
          message: 'Ожидался другой ход',
        }));
        return;
      }

      setReview((prev) => ({
        ...prev,
        currentMoveIndex: expectedIndex,
        currentStones: applyMoveToStones(prev.currentStones, expectedMove),
        isAnimating: true,
      }));

      const isLastUserMove = expectedIndex === variation.moves.length - 1;

      if (isLastUserMove) {
        const timeoutId = window.setTimeout(() => {
          finishVariationIfNeeded(variation);
        }, 150);

        reviewTimeoutsRef.current.push(timeoutId);
        return;
      }

      const timeoutId = window.setTimeout(() => {
        playComputerMove(variation, expectedIndex + 1);
      }, 500);

      reviewTimeoutsRef.current.push(timeoutId);
    }
  };

  const handleGuidedPass = () => {
    if (phase !== 'review' || review.mode !== 'guided' || review.progress !== 'idle') {
      return;
    }

    const move: YoseMove = {
      type: 'pass',
      color: currentScenario.startingColor,
    };

    const variation = findVariationByFirstMove(currentScenario.variations, move);

    if (!variation) {
      setReview((prev) => ({
        ...prev,
        message: 'Для pass варианта нет',
      }));
      return;
    }

    startGuidedVariation(variation);
  };

  const handleBestMove = () => {
    if (phase !== 'review' || review.mode !== 'guided' || review.progress !== 'idle') {
      return;
    }

    const variation = getBestVariation(currentScenario.variations);

    if (!variation) {
      setReview((prev) => ({
        ...prev,
        message: 'Лучший вариант не найден',
      }));
      return;
    }

    const firstMove = variation.moves[0];

    if (!firstMove) {
      return;
    }

    if (firstMove.type === 'pass') {
      handleGuidedPass();
      return;
    }

    startGuidedVariation(variation);
  };

  const handleStepViewerNextMove = () => {
    if (phase !== 'review' || review.mode !== 'step-viewer') {
      return;
    }

    if (review.isAnimating || review.progress === 'finished') {
      return;
    }

    if (review.progress === 'idle') {
      const variation = getBestVariation(currentScenario.variations);

      if (!variation) {
        setReview((prev) => ({
          ...prev,
          message: 'Лучший вариант не найден',
        }));
        return;
      }

      const firstMove = variation.moves[0];

      if (!firstMove) {
        return;
      }

      setReview((prev) => ({
        ...prev,
        progress: 'in_progress',
        activeVariationId: variation.id,
        currentMoveIndex: 0,
        currentStones: applyMoveToStones(prev.currentStones, firstMove),
        message: variation.message ?? prev.message,
        isAnimating: false,
      }));

      if (variation.moves.length === 1) {
        finishVariationIfNeeded(variation);
      }

      return;
    }

    if (review.progress !== 'in_progress') {
      return;
    }

    const variation = currentScenario.variations.find(
      (item) => item.id === review.activeVariationId,
    );

    if (!variation) {
      return;
    }

    const nextMoveIndex = review.currentMoveIndex + 1;
    const nextMove = variation.moves[nextMoveIndex];

    if (!nextMove) {
      finishVariationIfNeeded(variation);
      return;
    }

    const isLastMove = nextMoveIndex === variation.moves.length - 1;

    setReview((prev) => ({
      ...prev,
      currentMoveIndex: nextMoveIndex,
      currentStones: applyMoveToStones(prev.currentStones, nextMove),
      isAnimating: false,
    }));

    if (isLastMove) {
      finishVariationIfNeeded(variation);
    }
  };

  const handleSelfPlayMoveClick = (point: BoardPoint) => {
    if (phase !== 'review' || review.mode !== 'self-play') {
      return;
    }

    if (review.isAnimating || review.progress === 'finished') {
      return;
    }

    const variation =
      review.activeVariationId !== null
        ? (currentScenario.variations.find((item) => item.id === review.activeVariationId) ?? null)
        : getBestVariation(currentScenario.variations);

    if (!variation) {
      setReview((prev) => ({
        ...prev,
        message: 'Лучший вариант не найден',
      }));
      return;
    }

    const nextMoveIndex = review.progress === 'idle' ? 0 : review.currentMoveIndex + 1;
    const expectedMove = variation.moves[nextMoveIndex];

    if (!expectedMove) {
      finishVariationIfNeeded(variation);
      return;
    }

    if (expectedMove.type !== 'play') {
      setReview((prev) => ({
        ...prev,
        message: 'Сейчас ожидается pass',
      }));
      return;
    }

    const isCorrect = expectedMove.x === point.x && expectedMove.y === point.y;

    if (!isCorrect) {
      setReview((prev) => ({
        ...prev,
        message: 'Ожидался другой ход',
      }));
      return;
    }

    setReview((prev) => ({
      ...prev,
      progress: 'in_progress',
      activeVariationId: variation.id,
      currentMoveIndex: nextMoveIndex,
      currentStones: applyMoveToStones(prev.currentStones, expectedMove),
      message: variation.message ?? prev.message,
    }));

    const isLastMove = nextMoveIndex === variation.moves.length - 1;

    if (isLastMove) {
      finishVariationIfNeeded(variation);
    }
  };

  const handleSelfPlayPass = () => {
    if (phase !== 'review' || review.mode !== 'self-play') {
      return;
    }

    if (review.isAnimating || review.progress === 'finished') {
      return;
    }

    const variation =
      review.activeVariationId !== null
        ? (currentScenario.variations.find((item) => item.id === review.activeVariationId) ?? null)
        : getBestVariation(currentScenario.variations);

    if (!variation) {
      setReview((prev) => ({
        ...prev,
        message: 'Лучший вариант не найден',
      }));
      return;
    }

    const nextMoveIndex = review.progress === 'idle' ? 0 : review.currentMoveIndex + 1;
    const expectedMove = variation.moves[nextMoveIndex];

    if (!expectedMove) {
      finishVariationIfNeeded(variation);
      return;
    }

    if (expectedMove.type !== 'pass') {
      setReview((prev) => ({
        ...prev,
        message: 'Сейчас ожидается ход на доске',
      }));
      return;
    }

    setReview((prev) => ({
      ...prev,
      progress: 'in_progress',
      activeVariationId: variation.id,
      currentMoveIndex: nextMoveIndex,
      message: variation.message ?? prev.message,
    }));

    const isLastMove = nextMoveIndex === variation.moves.length - 1;

    if (isLastMove) {
      finishVariationIfNeeded(variation);
    }
  };

  const handleBoardPointClick = (point: BoardPoint) => {
    if (review.mode === 'guided') {
      handleGuidedMoveClick(point);
      return;
    }

    if (review.mode === 'self-play') {
      handleSelfPlayMoveClick(point);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 56px)',
        background: '#f3f4f6',
        display: 'flex',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1200,
          display: 'grid',
          gridTemplateColumns: '480px 380px',
          gap: 32,
          alignItems: 'flex-start',
        }}
      >
        {/* LEFT: BOARD CARD */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 20,
            padding: 20,
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{card.title ?? card.id}</div>

            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
              {card.size}×{card.size} · {solveMode === 'full' ? 'Full task' : 'Count only'}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoBoard
              size={card.size}
              viewport={card.viewport}
              boardSizePx={460}
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
          </div>
        </div>

        {/* RIGHT: WORK PANEL */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {/* SOLVE */}
          {phase === 'answering' && (
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 16,
                padding: 16,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 12 }}>Solve</div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>Mode</div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setSolveMode('full')}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      background: solveMode === 'full' ? '#e5e7eb' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    Full
                  </button>

                  <button
                    onClick={() => setSolveMode('count-only')}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      background: solveMode === 'count-only' ? '#e5e7eb' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    Count only
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, color: '#6b7280' }}>Points</div>
                <input
                  type="number"
                  value={answerForm.value}
                  onChange={(e) =>
                    setAnswerForm((prev) => ({
                      ...prev,
                      value: e.target.value,
                    }))
                  }
                  style={{
                    width: '100%',
                    padding: 8,
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    marginTop: 4,
                  }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, color: '#6b7280' }}>Type</div>
                <select
                  value={answerForm.resultType}
                  onChange={(e) =>
                    setAnswerForm((prev) => ({
                      ...prev,
                      resultType: e.target.value as YoseResultType,
                    }))
                  }
                  style={{
                    width: '100%',
                    padding: 8,
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    marginTop: 4,
                  }}
                >
                  <option value="">Select</option>
                  <option value="sente">Sente</option>
                  <option value="gote">Gote</option>
                  <option value="reverse-sente">Reverse sente</option>
                  <option value="double-sente">Double sente</option>
                </select>
              </div>

              <button
                onClick={handleCheckAnswer}
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 10,
                  border: 'none',
                  background: '#4b5563',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Submit
              </button>
            </div>
          )}

          {/* RESULT */}
          {phase === 'review' && (
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 16,
                padding: 16,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Result</div>
              <div>{review.message}</div>
            </div>
          )}

          {/* REVIEW */}
          {phase === 'review' && (
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 16,
                padding: 16,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 12 }}>Review</div>

              <div
                style={{
                  display: 'flex',
                  background: '#f3f4f6',
                  borderRadius: 12,
                  padding: 4,
                  gap: 4,
                }}
              >
                {[
                  { key: 'guided', label: 'Guided' },
                  { key: 'step-viewer', label: 'Step' },
                  { key: 'self-play', label: 'Self' },
                ].map((item) => {
                  const isActive = review.mode === item.key;

                  return (
                    <button
                      key={item.key}
                      onClick={() =>
                        setReview((prev) => ({
                          ...prev,
                          mode: item.key as typeof prev.mode,
                          message:
                            item.key === 'guided'
                              ? 'Режим: автоответ'
                              : item.key === 'step-viewer'
                                ? 'Режим: по шагам'
                                : 'Режим: прокликай вариант самостоятельно',
                        }))
                      }
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        borderRadius: 10,
                        border: 'none',
                        background: isActive ? '#ffffff' : 'transparent',
                        boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                        cursor: 'pointer',
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? '#111827' : '#6b7280',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {review.mode === 'guided' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleGuidedPass}
                    style={baseButtonStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#ffffff';
                    }}
                  >
                    Pass
                  </button>

                  <button
                    onClick={handleBestMove}
                    style={baseButtonStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#ffffff';
                    }}
                  >
                    Best move
                  </button>
                </div>
              )}

              {review.mode === 'step-viewer' && (
                <button
                  onClick={handleStepViewerNextMove}
                  disabled={review.isAnimating || review.progress === 'finished'}
                  style={{
                    ...baseButtonStyle,
                    opacity: review.isAnimating || review.progress === 'finished' ? 0.5 : 1,
                    cursor:
                      review.isAnimating || review.progress === 'finished' ? 'default' : 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!review.isAnimating && review.progress !== 'finished') {
                      e.currentTarget.style.background = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ffffff';
                  }}
                >
                  Next move
                </button>
              )}

              {review.mode === 'self-play' && (
                <button
                  onClick={handleSelfPlayPass}
                  style={baseButtonStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ffffff';
                  }}
                >
                  Pass
                </button>
              )}

              <div style={{ marginTop: 12 }}>
                <button
                  onClick={resetReviewState}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1px solid #e5e7eb',
                    background: '#ffffff',
                    color: '#374151',
                    cursor: 'pointer',
                    fontSize: 14,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ffffff';
                  }}
                >
                  Reset
                </button>
                {!isSingleCardMode && (
                  <button style={{ marginLeft: 8 }} onClick={handleNextCard}>
                    Next card
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
