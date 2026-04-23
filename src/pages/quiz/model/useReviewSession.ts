import { useMemo, useRef, useState } from 'react';
import { BoardPoint } from '@/entities/go-board/model/types';
import { applyMoveToStones } from '@/entities/go-board/model/stoneHelpers';
import {
  findVariationByFirstMove,
  getBestVariation,
  getScenarioById,
} from '@/entities/yose-card/model/helpers';
import { YoseCard, YoseMove, YoseVariation } from '@/entities/yose-card/model/types';
import { ReviewSessionState } from './types';

export const useReviewSession = (card: YoseCard) => {
  const initialScenario = useMemo(() => getScenarioById(card, card.initialScenarioId), [card]);

  const createInitialReviewState = (
    mode: ReviewSessionState['mode'] = 'guided',
  ): ReviewSessionState => ({
    mode,
    progress: 'idle',
    currentScenarioId: card.initialScenarioId,
    currentStones: initialScenario.initialStones,
    activeVariationId: null,
    currentMoveIndex: -1,
    isAnimating: false,
    message: null,
  });

  const [review, setReview] = useState<ReviewSessionState>(() => createInitialReviewState());

  const reviewTimeoutsRef = useRef<number[]>([]);

  const currentScenario = useMemo(
    () => getScenarioById(card, review.currentScenarioId),
    [card, review.currentScenarioId],
  );

  const clearReviewTimeouts = () => {
    reviewTimeoutsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });

    reviewTimeoutsRef.current = [];
  };

  const resetReviewState = () => {
    clearReviewTimeouts();
    setReview((prev) => createInitialReviewState(prev.mode));
  };

  const setReviewMessage = (message: string) => {
    setReview((prev) => ({
      ...prev,
      message,
    }));
  };

  const finishVariationIfNeeded = (variation: YoseVariation) => {
    clearReviewTimeouts();

    setReview((prev) => ({
      ...prev,
      progress: 'finished',
      isAnimating: false,
      message: variation.message ? `${variation.message}\nВариант окончен` : 'Вариант окончен',
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
      message: variation.message ?? prev.message,
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
    if (review.mode !== 'guided') {
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
        setReviewMessage('Такого варианта нет');
        return;
      }

      startGuidedVariation(variation);
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

    const expectedIndex = review.currentMoveIndex + 1;
    const expectedMove = variation.moves[expectedIndex];

    if (!expectedMove) {
      finishVariationIfNeeded(variation);
      return;
    }

    if (expectedMove.type !== 'play') {
      setReviewMessage('Сейчас ожидается pass');
      return;
    }

    const isCorrect = expectedMove.x === point.x && expectedMove.y === point.y;

    if (!isCorrect) {
      setReviewMessage('Ожидался другой ход');
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
  };

  const handleGuidedPass = () => {
    if (review.mode !== 'guided' || review.progress !== 'idle') {
      return;
    }

    const move: YoseMove = {
      type: 'pass',
      color: currentScenario.startingColor,
    };

    const variation = findVariationByFirstMove(currentScenario.variations, move);

    if (!variation) {
      setReviewMessage('Для pass варианта нет');
      return;
    }

    startGuidedVariation(variation);
  };

  const handleStepViewerNextMove = () => {
    if (review.mode !== 'step-viewer') {
      return;
    }

    if (review.isAnimating || review.progress === 'finished') {
      return;
    }

    if (review.progress === 'idle') {
      const variation = getBestVariation(currentScenario.variations);

      if (!variation) {
        setReviewMessage('Лучший вариант не найден');
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
    if (review.mode !== 'self-play') {
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
        setReviewMessage('Такого варианта нет');
        return;
      }

      const firstMove = variation.moves[0];

      if (!firstMove || firstMove.type !== 'play') {
        return;
      }

      setReview((prev) => ({
        ...prev,
        progress: 'in_progress',
        activeVariationId: variation.id,
        currentMoveIndex: 0,
        currentStones: applyMoveToStones(prev.currentStones, firstMove),
        message: variation.message ?? prev.message,
      }));

      if (variation.moves.length === 1) {
        finishVariationIfNeeded(variation);
      }

      return;
    }

    const variation = currentScenario.variations.find(
      (item) => item.id === review.activeVariationId,
    );

    if (!variation) {
      return;
    }

    const nextMoveIndex = review.currentMoveIndex + 1;
    const expectedMove = variation.moves[nextMoveIndex];

    if (!expectedMove) {
      finishVariationIfNeeded(variation);
      return;
    }

    if (expectedMove.type !== 'play') {
      setReviewMessage('Сейчас ожидается pass');
      return;
    }

    const isCorrect = expectedMove.x === point.x && expectedMove.y === point.y;

    if (!isCorrect) {
      setReviewMessage('Ожидался другой ход');
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

    if (nextMoveIndex === variation.moves.length - 1) {
      finishVariationIfNeeded(variation);
    }
  };

  const handleSelfPlayPass = () => {
    if (review.mode !== 'self-play') {
      return;
    }

    if (review.isAnimating || review.progress === 'finished' || review.progress !== 'idle') {
      return;
    }

    const move: YoseMove = {
      type: 'pass',
      color: currentScenario.startingColor,
    };

    const variation = findVariationByFirstMove(currentScenario.variations, move);

    if (!variation) {
      setReviewMessage('Для pass варианта нет');
      return;
    }

    const firstMove = variation.moves[0];

    if (!firstMove || firstMove.type !== 'pass') {
      return;
    }

    setReview((prev) => ({
      ...prev,
      progress: 'in_progress',
      activeVariationId: variation.id,
      currentMoveIndex: 0,
      message: variation.message ?? prev.message,
    }));

    if (variation.moves.length === 1) {
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

  const handleReviewModeChange = (mode: ReviewSessionState['mode']) => {
    clearReviewTimeouts();

    setReview((prev) => ({
      ...prev,
      mode,
      progress: 'idle',
      activeVariationId: null,
      currentMoveIndex: -1,
      currentStones: initialScenario.initialStones,
      isAnimating: false,
      message:
        mode === 'guided'
          ? 'Режим: автоответ'
          : mode === 'step-viewer'
            ? 'Режим: по шагам'
            : 'Режим: прокликай вариант самостоятельно',
    }));
  };

  return {
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
  };
};
