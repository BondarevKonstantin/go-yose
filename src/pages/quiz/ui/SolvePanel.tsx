import { YoseResultType } from '@/entities/yose-card/model/types';
import { AnswerFormState } from '../model/types';
import { Button, Field, Label, Panel, PanelTitle, PrimaryButton, Select } from './quizPage.styles';

export type QuizSolveMode = 'full' | 'count-only';

type SolvePanelProps = {
  solveMode: QuizSolveMode;
  answerForm: AnswerFormState;
  onSolveModeChange: (mode: QuizSolveMode) => void;
  onAnswerFormChange: (value: AnswerFormState) => void;
  onSubmit: () => void;
};

export const SolvePanel = ({
  solveMode,
  answerForm,
  onSolveModeChange,
  onAnswerFormChange,
  onSubmit,
}: SolvePanelProps) => {
  return (
    <Panel>
      <PanelTitle>Solve</PanelTitle>

      <div style={{ marginBottom: 12 }}>
        <Label>Mode</Label>

        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={() => onSolveModeChange('full')}>
            {solveMode === 'full' ? '✓ ' : ''}
            Full
          </Button>

          <Button onClick={() => onSolveModeChange('count-only')}>
            {solveMode === 'count-only' ? '✓ ' : ''}
            Count only
          </Button>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <Label>Points</Label>

        <Field
          type="number"
          value={answerForm.value}
          onChange={(e) =>
            onAnswerFormChange({
              ...answerForm,
              value: e.target.value,
            })
          }
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <Label>Type</Label>

        <Select
          value={answerForm.resultType}
          onChange={(e) =>
            onAnswerFormChange({
              ...answerForm,
              resultType: e.target.value as YoseResultType,
            })
          }
        >
          <option value="">Select</option>
          <option value="sente">Sente</option>
          <option value="gote">Gote</option>
          <option value="reverse-sente">Reverse sente</option>
          <option value="double-sente">Double sente</option>
        </Select>
      </div>

      <PrimaryButton onClick={onSubmit}>Submit</PrimaryButton>
    </Panel>
  );
};
