import { SpinResult } from './reel';
import { wait, rndInt } from '../utils';

export interface Player {
  readonly name: string;
  readonly tronium: number;
  readonly fame: number;
}

export interface Villain {
  readonly hp: number;
  readonly maxHp: number;
}

export interface Match {
  villain: Villain;
  score: number;
}

export interface Move {
  bet: number;
  lines: number;
}

export interface WinCombination {
  row: number;
  columns: number[];
  fame: number;
  tronium: number;
  villainHp: number;
}

export interface MoveResult {
  move: Move;
  rows: SpinResult[];
}

export class Game {
  player: Player;
  match: Match;

  constructor() {
    this.player = {
      name: 'Cono',
      tronium: 1100,
      fame: 100,
    };
  }

  async startMatch() {
    this.match = {
      villain: {
        maxHp: 300,
        hp: 300,
      },
      score: 0,
    };
  }

  async move(move: Move): Promise<MoveResult> {
    await wait(rndInt(500, 2000));
    const result: MoveResult = {
      move,
      rows: [SpinResult.spin(), SpinResult.spin(), SpinResult.spin()],
    };

    this.apply(move, result);
    return result;
  }

  private apply(move: Move, res: MoveResult) {
    if (isWin(res)) {
      const winnings = totalWins(res);

      this.player = {
        ...this.player,
        fame: this.player.fame + winnings.fame,
        tronium: this.player.tronium + winnings.tronium - move.bet,
      };

      this.match = {
        villain: {
          ...this.match.villain,
          hp: this.match.villain.hp - winnings.villainHp,
        },
        score: this.match.score + winnings.fame,
      };
    }
  }
}

function totalWins(res: MoveResult): { tronium: number; fame: number; villainHp: number } {
  return getBettedRows(res).reduce(
    (acc, wc) => {
      acc.fame += wc.famePayout;
      acc.tronium += wc.troniumPayout;
      acc.villainHp += wc.hpPayout;
      return acc;
    },
    { tronium: 0, fame: 0, villainHp: 0 }
  );
}

function getBettedRows(mr: MoveResult) {
  if (mr.move.lines === 1) {
    return [mr.rows[1]];
  } else if (mr.move.lines === 2) {
    return [mr.rows[0], mr.rows[2]];
  } else {
    return mr.rows;
  }
}

export function isWin(res: MoveResult) {
  return getBettedRows(res).some(sr => sr.isWin());
}
