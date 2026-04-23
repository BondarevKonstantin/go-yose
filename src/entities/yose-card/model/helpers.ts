import { YoseCard, YoseMove, YoseScenario, YoseVariation } from './types';

export const getScenarioById = (card: YoseCard, scenarioId: string): YoseScenario => {
  const scenario = card.scenarios.find((item) => item.id === scenarioId);

  if (!scenario) {
    throw new Error(`Scenario "${scenarioId}" not found`);
  }

  return scenario;
};

export const areMovesEqual = (left: YoseMove, right: YoseMove) => {
  if (left.type !== right.type) {
    return false;
  }

  if (left.type === 'pass' && right.type === 'pass') {
    return left.color === right.color;
  }

  if (left.type === 'play' && right.type === 'play') {
    return left.x === right.x && left.y === right.y && left.color === right.color;
  }

  return false;
};

export const findVariationByFirstMove = (
  variations: YoseVariation[],
  move: YoseMove,
): YoseVariation | null => {
  return (
    variations.find((variation) => {
      const firstMove = variation.moves[0];

      if (!firstMove) {
        return false;
      }

      return areMovesEqual(firstMove, move);
    }) ?? null
  );
};

export const getBestVariation = (variations: YoseVariation[]): YoseVariation | null => {
  return variations.find((variation) => variation.isBest) ?? null;
};
