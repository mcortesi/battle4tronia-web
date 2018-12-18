import { Bet, LineResult } from './api';
import { ReelResult } from './reel';

export class BoostChoice {
  static ALL: BoostChoice[] = [
    new BoostChoice('Normal', 10),
    new BoostChoice('Strong', 50),
    new BoostChoice('Max', 100),
  ];

  static DEFAULT = BoostChoice.ALL[0];
  static indexOf = (c: BoostChoice) => BoostChoice.ALL.indexOf(c);
  static fromIdx = (i: number) => BoostChoice.ALL[i];

  private constructor(public readonly label: string, public readonly value: number) {}
}

export class LineChoice {
  static ALL: LineChoice[] = [
    new LineChoice('Front', 1),
    new LineChoice('Flanks', 2),
    new LineChoice('All', 3),
  ];

  static DEFAULT = LineChoice.ALL[0];
  static indexOf = (c: LineChoice) => LineChoice.ALL.indexOf(c);
  static fromIdx = (i: number) => LineChoice.ALL[i];

  private constructor(public readonly label: string, public readonly value: number) {}
}

export function computeWinnings(bet: Bet, lineResults: LineResult[]) {
  return getBettedResult(bet, lineResults).reduce(
    (acc, lr) => {
      const reelResult = ReelResult.fromDice(lr.random);
      acc.tronium += bet.tronium * reelResult.troniumPayout;
      acc.fame += bet.tronium * reelResult.famePayout;
      acc.villainHp += bet.tronium * reelResult.hpPayout;
      return acc;
    },
    { tronium: 0, fame: 0, villainHp: 0 }
  );
}

export function getBettedResult(bet: Bet, lineResults: LineResult[]) {
  const bettedRows = linesToRows(bet.lines);
  return lineResults.filter(lr => bettedRows.indexOf(lr.line) >= 0);
}

export function linesToRows(lines: number) {
  switch (lines) {
    case 1:
      return [1];
    case 2:
      return [0, 2];
    case 3:
      return [0, 1, 3];
    default:
      throw new Error('invalid line number');
  }
}

export function hasWon(bet: Bet, lineResults: LineResult[]) {
  return computeWinnings(bet, lineResults).tronium > 0;
}
