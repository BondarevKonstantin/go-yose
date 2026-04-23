import { Panel, PanelTitle } from './quizPage.styles';

type ResultPanelProps = {
  message: string | null;
};

export const ResultPanel = ({ message }: ResultPanelProps) => {
  return (
    <Panel>
      <PanelTitle>Result</PanelTitle>
      <div>{message}</div>
    </Panel>
  );
};
