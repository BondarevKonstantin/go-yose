import { Stone } from '@/entities/go-board/model/types';
import { YoseResultType } from '@/entities/yose-card/model/types';

export type QuizPhase = 'answering' | 'review';

export type ReviewMode = 'guided' | 'self-play' | 'step-viewer';

export type AnswerFormState = {
  value: string;
  resultType: YoseResultType | '';
};

export type ReviewProgress = 'idle' | 'in_progress' | 'finished';

export type ReviewSessionState = {
  mode: ReviewMode | null;
  progress: ReviewProgress;

  currentScenarioId: string;
  currentStones: Stone[];

  activeVariationId: string | null;
  currentMoveIndex: number;

  isAnimating: boolean;
  message: string | null;
};
