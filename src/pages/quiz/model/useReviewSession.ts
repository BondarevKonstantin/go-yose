import { useMemo, useRef, useState } from 'react';
import { BoardPoint, Stone } from '@/entities/go-board/model/types';
import { applyMoveToStones } from '@/entities/go-board/model/stoneHelpers';
import {
  findVariationByFirstMove,
  getBestVariation,
  getScenarioById,
} from '@/entities/yose-card/model/helpers';
import { YoseCard, YoseMove, YoseVariation } from '@/entities/yose-card/model/types';
import { ReviewSessionState } from './types';
import { playStoneSound } from '@/shared/lib/sound/playStoneSound';

export const useReviewSession = (card: YoseCard) => {
  const initialScenario = useMemo(() => getScenarioById(card, card.initialScenarioId), [card]);

  const REVIEW_MODE_STORAGE_KEY = 'go-yose-review-mode';

  const getInitialReviewMode = (): ReviewSessionState['mode'] => {
    const savedMode = localStorage.getItem(REVIEW_MODE_STORAGE_KEY);

    if (savedMode === 'guided' || savedMode === 'step-viewer' || savedMode === 'self-play') {
      return savedMode;
    }

    return 'guided';
  };

  const createInitialReviewState = (
    mode: ReviewSessionState['mode'] = getInitialReviewMode(),
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

  const applyMoveWithSound = (stones: Stone[], move: YoseMove) => {
    if (move.type === 'play') {
      playStoneSound();
    }

    return applyMoveToStones(stones, move);
  };

  const finishVariationIfNeeded = () => {
    clearReviewTimeouts();

    setReview((prev) => ({
      ...prev,
      progress: 'finished',
      isAnimating: false,
      message: 'Variation is finished',
    }));
  };

  const playComputerMove = (variation: YoseVariation, moveIndex: number) => {
    const move = variation.moves[moveIndex];

    if (!move) {
      finishVariationIfNeeded();
      return;
    }

    setReview((prev) => ({
      ...prev,
      currentMoveIndex: moveIndex,
      currentStones: applyMoveWithSound(prev.currentStones, move),
      isAnimating: false,
    }));

    const isLastMove = moveIndex === variation.moves.length - 1;

    if (isLastMove) {
      const timeoutId = window.setTimeout(() => {
        finishVariationIfNeeded();
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
      currentStones: applyMoveWithSound(prev.currentStones, firstMove),
      message: variation.message ?? prev.message,
      isAnimating: variation.moves.length > 1,
    }));

    if (variation.moves.length === 1) {
      const timeoutId = window.setTimeout(() => {
        finishVariationIfNeeded();
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
        setReviewMessage("There's not such a variation yet");
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
      finishVariationIfNeeded();
      return;
    }

    if (expectedMove.type !== 'play') {
      setReviewMessage('Сейчас ожидается pass');
      return;
    }

    const isCorrect = expectedMove.x === point.x && expectedMove.y === point.y;

    if (!isCorrect) {
      setReviewMessage("There's not such a variation yet");
      return;
    }

    setReview((prev) => ({
      ...prev,
      currentMoveIndex: expectedIndex,
      currentStones: applyMoveWithSound(prev.currentStones, expectedMove),
      isAnimating: true,
    }));

    const isLastUserMove = expectedIndex === variation.moves.length - 1;

    if (isLastUserMove) {
      const timeoutId = window.setTimeout(() => {
        finishVariationIfNeeded();
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
      setReviewMessage('No variation for pass');
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
        setReviewMessage('We have got a variation error');
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
        currentStones: applyMoveWithSound(prev.currentStones, firstMove),
        message: variation.message ?? prev.message,
        isAnimating: false,
      }));

      if (variation.moves.length === 1) {
        finishVariationIfNeeded();
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
      finishVariationIfNeeded();
      return;
    }

    const isLastMove = nextMoveIndex === variation.moves.length - 1;

    setReview((prev) => ({
      ...prev,
      currentMoveIndex: nextMoveIndex,
      currentStones: applyMoveWithSound(prev.currentStones, nextMove),
      isAnimating: false,
    }));

    if (isLastMove) {
      finishVariationIfNeeded();
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
        setReviewMessage("There's not such a variation yet");
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
        currentStones: applyMoveWithSound(prev.currentStones, firstMove),
        message: variation.message ?? prev.message,
      }));

      if (variation.moves.length === 1) {
        finishVariationIfNeeded();
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
      finishVariationIfNeeded();
      return;
    }

    if (expectedMove.type !== 'play') {
      setReviewMessage('Сейчас ожидается pass');
      return;
    }

    const isCorrect = expectedMove.x === point.x && expectedMove.y === point.y;

    if (!isCorrect) {
      setReviewMessage("There's not such a variation yet");
      return;
    }

    setReview((prev) => ({
      ...prev,
      progress: 'in_progress',
      activeVariationId: variation.id,
      currentMoveIndex: nextMoveIndex,
      currentStones: applyMoveWithSound(prev.currentStones, expectedMove),
      message: variation.message ?? prev.message,
    }));

    if (nextMoveIndex === variation.moves.length - 1) {
      finishVariationIfNeeded();
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
      setReviewMessage('No variation for pass');
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
      finishVariationIfNeeded();
    }
  };

  const handleStepViewerPass = () => {
    if (review.mode !== 'step-viewer') {
      return;
    }

    if (review.isAnimating || review.progress === 'finished') {
      return;
    }

    if (review.progress === 'idle') {
      const move: YoseMove = {
        type: 'pass',
        color: currentScenario.startingColor,
      };

      const variation = findVariationByFirstMove(currentScenario.variations, move);

      if (!variation) {
        setReviewMessage('No variation for pass');
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
        finishVariationIfNeeded();
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
      finishVariationIfNeeded();
      return;
    }

    if (expectedMove.type !== 'pass') {
      setReviewMessage('Сейчас ожидается ход на доске');
      return;
    }

    setReview((prev) => ({
      ...prev,
      currentMoveIndex: nextMoveIndex,
      message: variation.message ?? prev.message,
    }));

    if (nextMoveIndex === variation.moves.length - 1) {
      finishVariationIfNeeded();
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

    localStorage.setItem(REVIEW_MODE_STORAGE_KEY, mode || 'guided');

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
          ? 'Guided mode'
          : mode === 'step-viewer'
            ? 'Step mode'
            : 'Click through mode',
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
    handleStepViewerPass,
  };
};
