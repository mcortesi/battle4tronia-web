import { genArray, rndElem, transpose } from '../utils';
import { Bet } from './api';

export const ReelSize = {
  rows: 3,
  columns: 5,
};

export const enum SymbolKind {
  Attack,
  Scatter,
  Trash,
  NegativeScatter,
  Joker,
}

export class SlotSymbol {
  static ALL: SlotSymbol[] = [];
  static ALL_BYKIND: Map<SymbolKind, SlotSymbol[]> = new Map();
  static AttackA = new SlotSymbol('symbol-attack1', SymbolKind.Attack);
  static AttackB = new SlotSymbol('symbol-attack2', SymbolKind.Attack);
  static AttackC = new SlotSymbol('symbol-attack3', SymbolKind.Attack);
  static AttackD = new SlotSymbol('symbol-attack4', SymbolKind.Attack);
  static TrashA = new SlotSymbol('symbol-trash1', SymbolKind.Trash);
  static TrashB = new SlotSymbol('symbol-trash2', SymbolKind.Trash);
  static TrashC = new SlotSymbol('symbol-trash3', SymbolKind.Trash);
  static TrashD = new SlotSymbol('symbol-trash4', SymbolKind.Trash);
  static TrashE = new SlotSymbol('symbol-trash5', SymbolKind.Trash);

  static rnd(): SlotSymbol {
    return rndElem(SlotSymbol.ALL);
  }

  static rndOfKind(kind: SymbolKind) {
    return rndElem(this.ALL_BYKIND.get(kind)!);
  }

  readonly idx: number;

  private constructor(readonly id: string, readonly kind: SymbolKind) {
    this.idx = SlotSymbol.ALL.length;

    SlotSymbol.ALL.push(this);
    if (!SlotSymbol.ALL_BYKIND.has(this.kind)) {
      SlotSymbol.ALL_BYKIND.set(this.kind, []);
    }
    SlotSymbol.ALL_BYKIND.get(this.kind)!.push(this);
  }

  toString() {
    return this.id;
  }
}

function same5Of(symbol: SlotSymbol): () => SlotSymbol[] {
  return () => genArray(5, () => symbol);
}
function same4Of(symbol: SlotSymbol): () => SlotSymbol[] {
  return () => genArray(4, () => symbol).concat([SlotSymbol.rndOfKind(SymbolKind.Trash)]);
}

function same3Of(symbol: SlotSymbol): () => SlotSymbol[] {
  return () =>
    genArray(4, () => symbol).concat(genArray(2, () => SlotSymbol.rndOfKind(SymbolKind.Trash)));
}

function missBuilder(): SlotSymbol[] {
  return genArray(5, () => SlotSymbol.rndOfKind(SymbolKind.Trash));
}

// function nearMissBuilder(): SlotSymbol[] {
//   const win = genArray(ReelSize.columns, () => SlotSymbol.AttackA);
//   win[win.length - 1] = SlotSymbol.AttackC;
//   return win;
// }

export class RowCombination {
  static ALL: Array<{ max: number; result: RowCombination }> = [];

  static A3 = new RowCombination('A3', 0.0715, 0.5, 1, same3Of(SlotSymbol.AttackA));
  static B3 = new RowCombination('B3', 0.0358, 1, 2, same3Of(SlotSymbol.AttackB));
  static C3 = new RowCombination('C3', 0.0072, 5, 3, same3Of(SlotSymbol.AttackC));
  static D3 = new RowCombination('D3', 0.0036, 10, 4, same3Of(SlotSymbol.AttackD));

  static A4 = new RowCombination('A4', 0.0358, 1, 4, same4Of(SlotSymbol.AttackA));
  static B4 = new RowCombination('B4', 0.0179, 2, 5, same4Of(SlotSymbol.AttackB));
  static C4 = new RowCombination('C4', 0.0036, 10, 6, same4Of(SlotSymbol.AttackC));
  static D4 = new RowCombination('D4', 0.0018, 20, 7, same4Of(SlotSymbol.AttackD));

  static A5 = new RowCombination('A5', 0.0143, 2.5, 7, same5Of(SlotSymbol.AttackA));
  static B5 = new RowCombination('B5', 0.0072, 5, 8, same5Of(SlotSymbol.AttackB));
  static C5 = new RowCombination('C5', 0.0015, 25, 9, same5Of(SlotSymbol.AttackC));
  static D5 = new RowCombination('D5', 0.0008, 50, 10, same5Of(SlotSymbol.AttackD));

  static Miss = new RowCombination('Miss', 1 - 0.201, 0, 0, missBuilder);
  // static NearMiss = new RowCombination('NearMiss', 0.3, 0, 0, nearMissBuilder);

  static rnd() {
    return RowCombination.fromDice(Math.random());
  }
  static fromDice(diceResult: number): RowCombination {
    const result = RowCombination.ALL.find(x => x.max > diceResult);
    if (result == null) {
      throw new Error('Logic Error: cant find result for ' + diceResult);
    }
    return result.result;
  }

  private static add(s: RowCombination) {
    if (RowCombination.ALL.length === 0) {
      RowCombination.ALL.push({ max: s.probability, result: s });
    } else {
      const prevMax = RowCombination.ALL[RowCombination.ALL.length - 1].max;
      RowCombination.ALL.push({ max: s.probability + prevMax, result: s });
    }
    if (RowCombination.ALL[RowCombination.ALL.length - 1].max > 1) {
      throw new Error('Bad RowCombination probabilities. Bigger than 1');
    }
  }

  private constructor(
    readonly id: string,
    readonly probability: number,
    readonly troniumPayout: number,
    readonly damage: number,
    private builder: () => SlotSymbol[]
  ) {
    RowCombination.add(this);
  }

  isWin() {
    return this.damage + this.troniumPayout > 0;
  }

  build(): SlotSymbol[] {
    return this.builder();
  }

  winnings(): Winnings {
    return {
      troniumPayout: this.troniumPayout,
      damage: this.damage,
    };
  }
  toString() {
    return this.id;
  }
}

export interface Winnings {
  troniumPayout: number;
  damage: number;
}

export interface BetResult {
  winnings: Winnings;
  reels: SlotSymbol[][];
  rowWinStatus: boolean[];
}

export function winningsFor(bet: number, combinations: RowCombination[]) {
  const baseWinnings = combinations.filter(c => c.isWin()).reduce(
    (acc, c) => {
      acc.troniumPayout = c.troniumPayout;
      acc.damage = c.damage;
      return acc;
    },
    {
      troniumPayout: 0,
      damage: 0,
    }
  );

  return {
    troniumPayout: baseWinnings.troniumPayout * bet,
    damage: baseWinnings.damage * bet,
  };
}

export function toBetResult(bet: Bet, combinations: RowCombination[]): BetResult {
  const winnings = winningsFor(bet.tronium, combinations);

  switch (bet.lines) {
    case 1:
      return {
        winnings,
        reels: transpose(
          [RowCombination.rnd(), combinations[0], RowCombination.rnd()].map(c => c.build())
        ),
        rowWinStatus: [false, combinations[0].isWin(), false],
      };
    case 2:
      return {
        winnings,
        reels: transpose(
          [combinations[0], RowCombination.rnd(), combinations[1]].map(c => c.build())
        ),
        rowWinStatus: [combinations[0].isWin(), false, combinations[1].isWin()],
      };
    case 3:
      return {
        winnings,
        reels: transpose(combinations.map(c => c.build())),
        rowWinStatus: combinations.map(c => c.isWin()),
      };

    default:
      throw new Error('Illegal bet lines ' + bet.lines);
  }
}
