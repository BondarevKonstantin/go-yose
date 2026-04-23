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

  const createInitialReviewState = (): ReviewSessionState => ({
    mode: null,
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
    <div style={{ padding: 24 }}>
      <GoBoard
        size={card.size}
        viewport={card.viewport}
        stones={phase === 'answering' ? initialScenario.initialStones : review.currentStones}
        isInteractive={
          phase === 'review' &&
          (review.mode === 'guided' || review.mode === 'self-play') &&
          review.progress !== 'finished' &&
          !review.isAnimating
        }
        onPointClick={handleBoardPointClick}
        markers={markers}
      />

      <div style={{ marginTop: 16 }}>
        {phase === 'answering' && (
          <>
            <div style={{ marginBottom: 12 }}>
              <div>Режим:</div>

              <button
                onClick={() => setSolveMode('full')}
                style={{
                  marginRight: 8,
                  fontWeight: solveMode === 'full' ? 'bold' : 'normal',
                }}
              >
                Полная задача
              </button>

              <button
                onClick={() => setSolveMode('count-only')}
                style={{
                  fontWeight: solveMode === 'count-only' ? 'bold' : 'normal',
                }}
              >
                Только посчитать
              </button>
            </div>
            <div>Сколько очков?</div>

            <input
              type="number"
              value={answerForm.value}
              onChange={(e) =>
                setAnswerForm((prev) => ({
                  ...prev,
                  value: e.target.value,
                }))
              }
            />

            <div style={{ marginTop: 12 }}>
              Тип:
              <select
                value={answerForm.resultType}
                onChange={(e) =>
                  setAnswerForm((prev) => ({
                    ...prev,
                    resultType: e.target.value as YoseResultType,
                  }))
                }
              >
                <option value="">Выбери</option>
                <option value="sente">Sente</option>
                <option value="gote">Gote</option>
                <option value="reverse-sente">Reverse sente</option>
                <option value="double-sente">Double sente</option>
              </select>
            </div>

            <button style={{ marginTop: 12 }} onClick={handleCheckAnswer}>
              Проверить
            </button>
          </>
        )}

        {phase === 'review' && (
          <>
            <div>{review.message}</div>

            {review.progress === 'idle' && (
              <div style={{ marginTop: 12 }}>
                <div>Выбери режим:</div>

                <button
                  onClick={() =>
                    setReview((prev) => ({
                      ...prev,
                      mode: 'guided',
                      message: 'Режим: автоответ',
                    }))
                  }
                >
                  Автоответ
                </button>

                <button
                  onClick={() =>
                    setReview((prev) => ({
                      ...prev,
                      mode: 'self-play',
                      message: 'Режим: прокликай вариант самостоятельно',
                    }))
                  }
                >
                  Прокликать самому
                </button>

                <button
                  onClick={() =>
                    setReview((prev) => ({
                      ...prev,
                      mode: 'step-viewer',
                      message: 'Режим: по шагам',
                    }))
                  }
                >
                  По шагам
                </button>

                {review.mode === 'guided' && (
                  <div style={{ marginTop: 12 }}>
                    <button onClick={handleGuidedPass}>Pass</button>
                    <button onClick={handleBestMove} style={{ marginLeft: 8 }}>
                      Следующий лучший ход
                    </button>
                  </div>
                )}

                {review.mode === 'self-play' && (
                  <div style={{ marginTop: 12 }}>
                    <button onClick={handleSelfPlayPass}>Pass</button>
                  </div>
                )}
              </div>
            )}

            {review.mode === 'step-viewer' && (
              <div style={{ marginTop: 12 }}>
                <button
                  onClick={handleStepViewerNextMove}
                  disabled={review.isAnimating || review.progress === 'finished'}
                >
                  Следующий ход
                </button>
              </div>
            )}

            {review.progress !== 'idle' && (
              <div style={{ marginTop: 12 }}>
                Режим: {review.mode}
                {review.isAnimating && <div>Компьютер думает...</div>}
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <button onClick={resetReviewState}>Сбросить разбор</button>

              {!isSingleCardMode && (
                <button onClick={handleNextCard} style={{ marginLeft: 8 }}>
                  Следующая карточка
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
