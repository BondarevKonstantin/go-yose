import { YoseResultType } from '@/entities/yose-card/model/types';
import { Panel, PanelTitle } from './quizPage.styles';

type ResultPanelProps = {
  message: string | null;
  correctValue: number;
  correctResultType: YoseResultType;
};

const resultTypeLabelMap: Record<YoseResultType, string> = {
  sente: 'Sente',
  gote: 'Gote',
  'reverse-sente': 'Reverse sente',
  'double-sente': 'Double sente',
};

export const ResultPanel = ({ message, correctValue, correctResultType }: ResultPanelProps) => {
  const isFinishedMessage = message === 'The variation is finished';

  return (
    <Panel>
      <PanelTitle>Result</PanelTitle>

      {message && (
        <div
          style={{
            fontSize: isFinishedMessage ? 18 : 14,
            fontWeight: isFinishedMessage ? 700 : 400,
            marginBottom: 12,
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          padding: 12,
          borderRadius: 12,
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
        }}
      >
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Correct answer</div>

        <div style={{ fontWeight: 600 }}>
          {correctValue} points · {resultTypeLabelMap[correctResultType]}
        </div>
      </div>
    </Panel>
  );
};
