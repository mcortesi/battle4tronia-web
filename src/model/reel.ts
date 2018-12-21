import { rndElem, shuffle, transpose } from '../utils';
import { Bet } from './api';

export const ReelSize = {
  rows: 3,
  columns: 5,
};

export const enum CardKind {
  Attack,
  Scatter,
  Trash,
  NegativeScatter,
  Joker,
}

export class Card {
  static ALL: Card[] = [];
  static ALL_BYKIND: Map<CardKind, Card[]> = new Map();

  static HeroA = new Card('cardAttack1', CardKind.Attack);
  static HeroB = new Card('cardAttack2', CardKind.Attack);
  static HeroC = new Card('cardAttack3', CardKind.Attack);
  static HeroD = new Card('cardAttack4', CardKind.Attack);

  static TrashA = new Card('cardTrash1', CardKind.Trash);
  static TrashB = new Card('cardTrash2', CardKind.Trash);
  static TrashC = new Card('cardTrash3', CardKind.Trash);
  static TrashD = new Card('cardTrash4', CardKind.Trash);
  static TrashE = new Card('cardTrash5', CardKind.Trash);

  static NegScatter = new Card('cardNegScatter', CardKind.NegativeScatter);
  static Scatter = new Card('cardScatter', CardKind.Scatter);

  static rnd(): Card {
    return rndElem(Card.ALL);
  }

  static rndOfKind(kind: CardKind) {
    return rndElem(this.ALL_BYKIND.get(kind)!);
  }

  readonly idx: number;

  private constructor(readonly id: string, readonly kind: CardKind) {
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

function scatter(): Card[] {
  return shuffle([
    Card.Scatter,
    Card.rndOfKind(CardKind.Attack),
    Card.rndOfKind(CardKind.Attack),
    Card.rndOfKind(CardKind.Trash),
    Card.rndOfKind(CardKind.Trash),
  ]);
}

function b5of(symbol: Card): () => Card[] {
  return () => [symbol, symbol, symbol, symbol, symbol];
}
function b4of(symbol: Card): () => Card[] {
  return () => shuffle([symbol, symbol, symbol, symbol, Card.rndOfKind(CardKind.Trash)]);
}

function b3of(symbol: Card): () => Card[] {
  return () =>
    shuffle([
      symbol,
      symbol,
      symbol,
      Card.rndOfKind(CardKind.Trash),
      Card.rndOfKind(CardKind.Trash),
    ]);
}

function b3and2(symbol3: Card, symbol2: Card): () => Card[] {
  return () => shuffle([symbol3, symbol3, symbol3, symbol2, symbol2]);
}

function b3ABCD1SN1T(): Card[] {
  const attackCard = Card.rndOfKind(CardKind.Attack);
  return shuffle([attackCard, attackCard, attackCard, Card.rndOfKind(CardKind.Trash)]).concat(
    Card.NegScatter
  );
}

function b4ABCD1SN(): Card[] {
  const attackCard = Card.rndOfKind(CardKind.Attack);
  return [attackCard, attackCard, attackCard, attackCard, Card.NegScatter];
}

function b2ABCD3T(): Card[] {
  const attackCard = Card.rndOfKind(CardKind.Attack);
  return shuffle([
    attackCard,
    attackCard,
    Card.rndOfKind(CardKind.Trash),
    Card.rndOfKind(CardKind.Trash),
    Card.rndOfKind(CardKind.Trash),
  ]);
}

function b1ABCD4T(): Card[] {
  const attackCard = Card.rndOfKind(CardKind.Attack);
  return shuffle([
    attackCard,
    attackCard,
    attackCard,
    Card.rndOfKind(CardKind.Trash),
    Card.rndOfKind(CardKind.Trash),
  ]);
}
function b2ABCD1NP2T(): Card[] {
  const [attackCard, diffAttackCard] = shuffle(
    rndElem([
      [Card.HeroA, Card.HeroB],
      [Card.HeroA, Card.HeroC],
      [Card.HeroA, Card.HeroD],
      [Card.HeroB, Card.HeroC],
      [Card.HeroB, Card.HeroD],
      [Card.HeroC, Card.HeroD],
    ])
  );

  return shuffle([
    attackCard,
    attackCard,
    diffAttackCard,
    Card.rndOfKind(CardKind.Trash),
    Card.rndOfKind(CardKind.Trash),
  ]);
}

function b2ABCD2NP1T(): Card[] {
  const [attackCard, diffAttackCard] = shuffle(
    rndElem([
      [Card.HeroA, Card.HeroB],
      [Card.HeroA, Card.HeroC],
      [Card.HeroA, Card.HeroD],
      [Card.HeroB, Card.HeroC],
      [Card.HeroB, Card.HeroD],
      [Card.HeroC, Card.HeroD],
    ])
  );

  return shuffle([
    attackCard,
    attackCard,
    diffAttackCard,
    diffAttackCard,
    Card.rndOfKind(CardKind.Trash),
  ]);
}

function b5T(): Card[] {
  return [
    Card.rndOfKind(CardKind.Trash),
    Card.rndOfKind(CardKind.Trash),
    Card.rndOfKind(CardKind.Trash),
    Card.rndOfKind(CardKind.Trash),
    Card.rndOfKind(CardKind.Trash),
  ];
}

// function nearMissBuilder(): SlotSymbol[] {
//   const win = genArray(ReelSize.columns, () => SlotSymbol.AttackA);
//   win[win.length - 1] = SlotSymbol.AttackC;
//   return win;
// }

export class Move {
  static ALL: Array<{ max: number; result: Move }> = [];

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

  static createAll(table: Array<[string, number, number, number, number, () => Card[]]>) {
    if (Move.ALL.length > 0) {
      throw new Error('Moves Already created!');
    }

    for (const moveArgs of table) {
      const move = new Move(...moveArgs);
      Move.add(move);
    }

    const max = Move.ALL[Move.ALL.length - 1].max;
    const epsilon = 0.0001;
    if (max > 1 + epsilon || max < 1 - epsilon) {
      throw new Error(`Bad RowCombination probabilities. Sum not 1. They sum: ${max}`);
    }
    Move.ALL[Move.ALL.length - 1].max = 1;
  }
  private static add(s: Move) {
    if (Move.ALL.length === 0) {
      Move.ALL.push({ max: s.probability, result: s });
    } else {
      const prevMax = Move.ALL[Move.ALL.length - 1].max;
      Move.ALL.push({ max: s.probability + prevMax, result: s });
    }
  }

  private constructor(
    readonly id: string,
    readonly probability: number,
    readonly payout: number,
    readonly damage: number,
    readonly epicness: number,
    private builder: () => Card[]
  ) {}

  isWin() {
    return this.damage + this.payout > 0;
  }

  build(): Card[] {
    return this.builder();
  }

  winnings(): Winnings {
    return {
      payout: this.payout,
      damage: this.damage,
      epicness: this.epicness,
    };
  }

  toString() {
    return this.id;
  }
}

export interface Winnings {
  payout: number;
  damage: number;
  epicness: number;
}

export interface BetResult {
  winnings: Winnings;
  reels: Card[][];
  rowWinStatus: boolean[];
}

export function winningsFor(bet: Bet, combinations: Move[]) {
  const baseWinnings = combinations.reduce(
    (acc, c) => {
      acc.payout = c.payout;
      acc.damage = c.damage;
      acc.epicness = c.epicness;
      return acc;
    },
    {
      payout: 0,
      damage: 0,
      epicness: 0,
    }
  );

  return {
    payout: baseWinnings.payout * bet.tronium,
    damage: baseWinnings.damage * bet.damageMultiplier,
    epicness: baseWinnings.epicness * bet.damageMultiplier,
  };
}

export function toBetResult(bet: Bet, combinations: Move[]): BetResult {
  const winnings = winningsFor(bet, combinations);

  // console.log('WIN_COMB', combinations.map(c => c.id));
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

// prettier-ignore
const MovesTable: Array<[string, number, number, number, number, () => Card[]]> = [
  // ID          PROB    PAYOUT DAMAGE EPICNESS   MOVE GENERATOR
  ['1S4*'	      , 0.0015 , 30	  , 45   , 3333   , scatter                         ],
  ['3A2T'	      , 0.0600 , 0.5  , 4	   , 83     , b3of(Card.HeroA)                ],
  ['3B2T'	      , 0.0500 , 0.7  , 7    , 100    , b3of(Card.HeroB)                ],
  ['3C2T'	      , 0.0400 , 1.2  , 14   , 125    , b3of(Card.HeroC)                ],
  ['3D2T'	      , 0.0080 , 7.7  , 29   , 625    , b3of(Card.HeroD)                ],
  ['4A1T'	      , 0.0312 , 1	  , 5    , 160    , b4of(Card.HeroA)                ],
  ['4B1T'	      , 0.0260 , 1.4  , 9	   , 192    , b4of(Card.HeroB)                ],
  ['4C1T'	      , 0.0208 , 2.4  , 19	 , 240    , b4of(Card.HeroC)                ],
  ['4D1T'	      , 0.0042 , 15.4	, 38	 , 1202   , b4of(Card.HeroD)                ],
  ['5A'	        , 0.0150 , 2.5	, 6	   , 333    , b5of(Card.HeroA)                ],
  ['5B'	        , 0.0125 , 3.5	, 12.5 , 400    , b5of(Card.HeroB)                ],
  ['5C'	        , 0.0100 , 18	  , 25	 , 500    , b5of(Card.HeroC)                ],
  ['5D'	        , 0.0020 , 50	  , 50	 , 2500   , b5of(Card.HeroD)                ],
  ['3A2B'	      , 0.0080 , 0.9	, 9	   , 625    , b3and2(Card.HeroA, Card.HeroB)  ],
  ['3A2C'	      , 0.0072 , 1.1	, 15	 , 694    , b3and2(Card.HeroA, Card.HeroC)  ],
  ['3A2D'	      , 0.0065 , 4.4	, 26	 , 772    , b3and2(Card.HeroA, Card.HeroD)  ],
  ['3B2A'	      , 0.0067 , 1	  , 10	 , 750    , b3and2(Card.HeroB, Card.HeroA)  ],
  ['3B2C'	      , 0.0060 , 1.3	, 18	 , 833    , b3and2(Card.HeroB, Card.HeroC)  ],
  ['3B2D'	      , 0.0054 , 4.6	, 29	 , 926    , b3and2(Card.HeroB, Card.HeroD)  ],
  ['3C2A'	      , 0.0053 , 1.5	, 17	 , 938    , b3and2(Card.HeroC, Card.HeroA)  ],
  ['3C2B'	      , 0.0048 , 1.6	, 19	 , 1042   , b3and2(Card.HeroC, Card.HeroB)  ],
  ['3C2D'	      , 0.0043 , 5.1	, 36	 , 1157   , b3and2(Card.HeroC, Card.HeroD)  ],
  ['3D2A'	      , 0.0011 , 8	  , 32	 , 4688   , b3and2(Card.HeroD, Card.HeroA)  ],
  ['3D2B'	      , 0.0010 , 8.1	, 34	 , 5208   , b3and2(Card.HeroD, Card.HeroB)  ],
  ['3D2C'	      , 0.0009 , 8.3	, 40	 , 5787   , b3and2(Card.HeroD, Card.HeroC)  ],
  ['3ABCD1SN1T'	, 0.1000 , 0	  , 0	   , 1000   , b3ABCD1SN1T                     ],
  ['4ABCD1SN'	  , 0.0500 , 0	  , 0	   , 1500   , b4ABCD1SN                       ],
  ['2ABCD3T'	  , 0.1000 , 0	  , 0	   , 0      , b2ABCD3T                        ],
  ['1ABCD4T'	  , 0.1000 , 0	  , 0	   , 0      , b1ABCD4T                        ],
  ['2ABCD1NP2T'	, 0.0500 , 0	  , 0	   , 0      , b2ABCD1NP2T                     ],
  ['2ABCD2NP1T'	, 0.0500 , 0	  , 0	   , 0      , b2ABCD2NP1T                     ],
  ['5T'	        , 0.2116 , 0	  , 0	   , 0      , b5T                             ],
];

Move.createAll(MovesTable);
