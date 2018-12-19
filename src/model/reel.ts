import { genArray, rndElem, transpose, shuffle } from '../utils';
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

export class Card {
  static ALL: Card[] = [];
  static ALL_BYKIND: Map<SymbolKind, Card[]> = new Map();
  static HeroA = new Card('symbol-attack1', SymbolKind.Attack);
  static HeroB = new Card('symbol-attack2', SymbolKind.Attack);
  static HeroC = new Card('symbol-attack3', SymbolKind.Attack);
  static HeroD = new Card('symbol-attack4', SymbolKind.Attack);
  static TrashA = new Card('symbol-trash1', SymbolKind.Trash);
  static TrashB = new Card('symbol-trash2', SymbolKind.Trash);
  static TrashC = new Card('symbol-trash3', SymbolKind.Trash);
  static TrashD = new Card('symbol-trash4', SymbolKind.Trash);
  static TrashE = new Card('symbol-trash5', SymbolKind.Trash);

  static rnd(): Card {
    return rndElem(Card.ALL);
  }

  static rndOfKind(kind: SymbolKind) {
    return rndElem(this.ALL_BYKIND.get(kind)!);
  }

  readonly idx: number;

  private constructor(readonly id: string, readonly kind: SymbolKind) {
    this.idx = Card.ALL.length;

    Card.ALL.push(this);
    if (!Card.ALL_BYKIND.has(this.kind)) {
      Card.ALL_BYKIND.set(this.kind, []);
    }
    Card.ALL_BYKIND.get(this.kind)!.push(this);
  }

  toString() {
    return this.id;
  }
}

function b5of(symbol: Card): () => Card[] {
  return () => genArray(5, () => symbol);
}
function b4of(symbol: Card): () => Card[] {
  return () => shuffle(genArray(4, () => symbol).concat([Card.rndOfKind(SymbolKind.Trash)]));
}

function b3of(symbol: Card): () => Card[] {
  return () =>
    shuffle(genArray(4, () => symbol).concat(genArray(2, () => Card.rndOfKind(SymbolKind.Trash))));
}

function b3and2(symbol3: Card, symbol2: Card): () => Card[] {
  return () => shuffle(genArray(3, () => symbol3).concat(genArray(2, () => symbol2)));
}

function missBuilder(): Card[] {
  return genArray(5, () => Card.rndOfKind(SymbolKind.Trash));
}

// function nearMissBuilder(): SlotSymbol[] {
//   const win = genArray(ReelSize.columns, () => SlotSymbol.AttackA);
//   win[win.length - 1] = SlotSymbol.AttackC;
//   return win;
// }

export class Move {
  static ALL: Array<{ max: number; result: Move }> = [];

  static A3 = new Move('3A2T', 0.0715, 0.5, 1, b3of(Card.HeroA));
  static B3 = new Move('3B2T', 0.0358, 1, 2, b3of(Card.HeroB));
  static C3 = new Move('3C2T', 0.0072, 5, 3, b3of(Card.HeroC));
  static D3 = new Move('3D2T', 0.0036, 10, 4, b3of(Card.HeroD));

  static A4 = new Move('4A1T', 0.0358, 1, 4, b4of(Card.HeroA));
  static B4 = new Move('4B1T', 0.0179, 2, 5, b4of(Card.HeroB));
  static C4 = new Move('4C1T', 0.0036, 10, 6, b4of(Card.HeroC));
  static D4 = new Move('4D1T', 0.0018, 20, 7, b4of(Card.HeroD));

  static A5 = new Move('5A', 0.0143, 2.5, 7, b5of(Card.HeroA));
  static B5 = new Move('5B', 0.0072, 5, 8, b5of(Card.HeroB));
  static C5 = new Move('5C', 0.0015, 25, 9, b5of(Card.HeroC));
  static D5 = new Move('5D', 0.0008, 50, 10, b5of(Card.HeroD));

  static A3B2 = new Move('3A2B', 0.0358, 1, 2, b3and2(Card.HeroA, Card.HeroB));
  static A3C2 = new Move('3A2C', 0.012, 3, 3, b3and2(Card.HeroA, Card.HeroC));
  static A3D2 = new Move('3A2D', 0.0065, 5.5, 4, b3and2(Card.HeroA, Card.HeroD));
  static B3A2 = new Move('3B2A', 0.0275, 1.3, 2, b3and2(Card.HeroB, Card.HeroA));
  static B3C2 = new Move('3B2C', 0.006, 6, 4, b3and2(Card.HeroB, Card.HeroC));
  static B3D2 = new Move('3B2D', 0.006, 6, 5, b3and2(Card.HeroB, Card.HeroD));
  static C3A2 = new Move('3C2A', 0.0068, 5.3, 4, b3and2(Card.HeroC, Card.HeroA));
  static C3B2 = new Move('3C2B', 0.0065, 5.5, 5, b3and2(Card.HeroC, Card.HeroB));
  static C3D2 = new Move('3C2D', 0.0036, 10, 6, b3and2(Card.HeroC, Card.HeroD));
  static D3A2 = new Move('3D2A', 0.0035, 10.3, 5, b3and2(Card.HeroD, Card.HeroA));
  static D3B2 = new Move('3D2B', 0.0035, 10.5, 6, b3and2(Card.HeroD, Card.HeroB));
  static D3C2 = new Move('3D2C', 0.0029, 12.5, 7, b3and2(Card.HeroD, Card.HeroC));

  static Miss = new Move('Miss', 1 - 0.3216, 0, 0, missBuilder);
  // static NearMiss = new RowCombination('NearMiss', 0.3, 0, 0, nearMissBuilder);

  static rnd() {
    return Move.fromDice(Math.random());
  }
  static fromDice(diceResult: number): Move {
    const result = Move.ALL.find(x => x.max > diceResult);
    if (result == null) {
      throw new Error('Logic Error: cant find result for ' + diceResult);
    }
    return result.result;
  }

  private static add(s: Move) {
    if (Move.ALL.length === 0) {
      Move.ALL.push({ max: s.probability, result: s });
    } else {
      const prevMax = Move.ALL[Move.ALL.length - 1].max;
      Move.ALL.push({ max: s.probability + prevMax, result: s });
    }
    if (Move.ALL[Move.ALL.length - 1].max > 1) {
      throw new Error('Bad RowCombination probabilities. Bigger than 1');
    }
  }

  private constructor(
    readonly id: string,
    readonly probability: number,
    readonly troniumPayout: number,
    readonly damage: number,
    private builder: () => Card[]
  ) {
    Move.add(this);
  }

  isWin() {
    return this.damage + this.troniumPayout > 0;
  }

  build(): Card[] {
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
  reels: Card[][];
  rowWinStatus: boolean[];
}

export function winningsFor(bet: number, combinations: Move[]) {
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

export function toBetResult(bet: Bet, combinations: Move[]): BetResult {
  const winnings = winningsFor(bet.tronium, combinations);

  switch (bet.lines) {
    case 1:
      return {
        winnings,
        reels: transpose([Move.rnd(), combinations[0], Move.rnd()].map(c => c.build())),
        rowWinStatus: [false, combinations[0].isWin(), false],
      };
    case 2:
      return {
        winnings,
        reels: transpose([combinations[0], Move.rnd(), combinations[1]].map(c => c.build())),
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
