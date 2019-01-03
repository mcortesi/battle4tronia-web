import { MoveSound } from '../pixi/SoundManager';
import { rndElem, shuffle, transpose } from '../utils';
import { Bet } from './model';
import { BoostChoice } from './base';

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

export interface CardPosition {
  card: Card;
  active: boolean;
}

type SoundPlayer = () => void;

export class Card {
  static ALL: Card[] = [];
  static ALL_BYKIND: Map<CardKind, Card[]> = new Map();

  static Punch = new Card('punch', CardKind.Attack, true);
  static Sword = new Card('sword', CardKind.Attack, true);
  static Boomerang = new Card('boomerang', CardKind.Attack, true);
  static Tronium = new Card('tronium', CardKind.Attack, true);

  static TrashA = new Card('tA', CardKind.Trash, false);
  static TrashB = new Card('tB', CardKind.Trash, false);
  static TrashC = new Card('tC', CardKind.Trash, false);
  static TrashD = new Card('tD', CardKind.Trash, false);
  static TrashE = new Card('tE', CardKind.Trash, false);

  static NegScatter = new Card('scatterneg', CardKind.NegativeScatter, true);
  static Scatter = new Card('scatter', CardKind.Scatter, true);
  static Joker = new Card('joker', CardKind.Joker, true);

  static rnd(): Card {
    return rndElem(Card.ALL);
  }

  static rndOfKind(kind: CardKind) {
    return rndElem(this.ALL_BYKIND.get(kind)!);
  }

  readonly idx: number;

  private constructor(readonly id: string, readonly kind: CardKind, readonly canAnimate: boolean) {
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

  active(): CardPosition {
    return {
      card: this,
      active: true,
    };
  }

  still(): CardPosition {
    return {
      card: this,
      active: false,
    };
  }
}

function scatter(): CardPosition[] {
  return shuffle([
    Card.Scatter.active(),
    Card.rndOfKind(CardKind.Attack).still(),
    Card.rndOfKind(CardKind.Attack).still(),
    Card.rndOfKind(CardKind.Trash).still(),
    Card.rndOfKind(CardKind.Trash).still(),
  ]);
}

function b5of(symbol: Card): () => CardPosition[] {
  const activeCard = symbol.active();
  return () => [activeCard, activeCard, activeCard, activeCard, activeCard];
}
function b4of(symbol: Card): () => CardPosition[] {
  return () =>
    shuffle([
      symbol.active(),
      symbol.active(),
      symbol.active(),
      symbol.active(),
      Card.rndOfKind(CardKind.Trash).still(),
    ]);
}

function b3of(symbol: Card): () => CardPosition[] {
  return () =>
    shuffle([
      symbol.active(),
      symbol.active(),
      symbol.active(),
      Card.rndOfKind(CardKind.Trash).still(),
      Card.rndOfKind(CardKind.Trash).still(),
    ]);
}

function b3and2(symbol3: Card, symbol2: Card): () => CardPosition[] {
  return () =>
    shuffle([
      symbol3.active(),
      symbol3.active(),
      symbol3.active(),
      symbol2.active(),
      symbol2.active(),
    ]);
}

function b3ABCD1SN1T(): CardPosition[] {
  const attackCard = Card.rndOfKind(CardKind.Attack);
  return shuffle([attackCard, attackCard, attackCard, Card.rndOfKind(CardKind.Trash)])
    .map(c => c.still())
    .concat(Card.NegScatter.active());
}

function b4ABCD1SN(): CardPosition[] {
  const attackCard = Card.rndOfKind(CardKind.Attack);
  return [
    attackCard.still(),
    attackCard.still(),
    attackCard.still(),
    attackCard.still(),
    Card.NegScatter.active(),
  ];
}

function b2ABCD3T(): CardPosition[] {
  const attackCard = Card.rndOfKind(CardKind.Attack);
  return shuffle([
    attackCard,
    attackCard,
    Card.rndOfKind(CardKind.Trash),
    Card.rndOfKind(CardKind.Trash),
    Card.rndOfKind(CardKind.Trash),
  ]).map(c => c.still());
}

function b1ABCD4T(): CardPosition[] {
  const attackCard = Card.rndOfKind(CardKind.Attack);
  return shuffle([
    attackCard,
    Card.rndOfKind(CardKind.Trash),
    Card.rndOfKind(CardKind.Trash),
    Card.rndOfKind(CardKind.Trash),
    Card.rndOfKind(CardKind.Trash),
  ]).map(c => c.still());
}
function b2ABCD1NP2T(): CardPosition[] {
  const [attackCard, diffAttackCard] = shuffle(
    rndElem([
      [Card.Punch, Card.Boomerang],
      [Card.Punch, Card.Sword],
      [Card.Punch, Card.Tronium],
      [Card.Boomerang, Card.Sword],
      [Card.Boomerang, Card.Tronium],
      [Card.Sword, Card.Tronium],
    ])
  );

  return shuffle([
    attackCard,
    attackCard,
    diffAttackCard,
    Card.rndOfKind(CardKind.Trash),
    Card.rndOfKind(CardKind.Trash),
  ]).map(c => c.still());
}

function b2ABCD2NP1T(): CardPosition[] {
  const [attackCard, diffAttackCard] = shuffle(
    rndElem([
      [Card.Punch, Card.Boomerang],
      [Card.Punch, Card.Sword],
      [Card.Punch, Card.Tronium],
      [Card.Boomerang, Card.Sword],
      [Card.Boomerang, Card.Tronium],
      [Card.Sword, Card.Tronium],
    ])
  );

  return shuffle([
    attackCard,
    attackCard,
    diffAttackCard,
    diffAttackCard,
    Card.rndOfKind(CardKind.Trash),
  ]).map(c => c.still());
}

function b5T(): CardPosition[] {
  return [
    Card.rndOfKind(CardKind.Trash),
    Card.rndOfKind(CardKind.Trash),
    Card.rndOfKind(CardKind.Trash),
    Card.rndOfKind(CardKind.Trash),
    Card.rndOfKind(CardKind.Trash),
  ].map(c => c.still());
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

  static createAll(
    table: Array<
      [string, number, number, number, number, () => CardPosition[], SoundPlayer, string | null]
    >
  ) {
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
    private builder: () => CardPosition[],
    readonly playSound: SoundPlayer,
    readonly winMsg: string | null
  ) {}

  isWin() {
    return this.damage + this.payout > 0;
  }

  build(): CardPosition[] {
    return this.builder();
  }

  buildStill(): CardPosition[] {
    return this.builder().map(cp => ({ card: cp.card, active: false }));
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
  reels: CardPosition[][];
  rowWinStatus: boolean[];
  featuredMove: Move;
}

export function winningsFor(bet: Bet, combinations: Move[]) {
  const damageMultiplier = BoostChoice.fromBet(bet.tronium).damageMultiplier;
  const baseWinnings = combinations.reduce(
    (acc, c) => {
      acc.payout += c.payout;
      acc.damage += c.damage;
      acc.epicness += c.epicness;
      return acc;
    },
    {
      payout: 0,
      damage: 0,
      epicness: 0,
    }
  );

  return {
    payout: Math.round(baseWinnings.payout * bet.tronium * bet.level),
    damage: Math.round(baseWinnings.damage * damageMultiplier),
    epicness: Math.round(baseWinnings.epicness * damageMultiplier),
  };
}

function getFeaturedMove(moves: Move[]) {
  const winningMoves = moves.filter(c => c.isWin());
  if (winningMoves.length > 0) {
    return winningMoves.reduce((best, curr) => (best.payout >= curr.payout ? best : curr));
  }
  return moves.reduce((best, curr) => (best.epicness >= curr.epicness ? best : curr));
}

export function toBetResult(bet: Bet, combinations: Move[]): BetResult {
  const winnings = winningsFor(bet, combinations);
  const stillMove = () => Move.rnd().buildStill();
  const pos = combinations.map(c => c.build());

  const featuredMove = getFeaturedMove(combinations);

  console.log('WIN_COMB', combinations.map(c => c.id));
  switch (bet.lines) {
    case 1:
      return {
        winnings,
        reels: transpose([stillMove(), pos[0], stillMove()]),
        rowWinStatus: [false, combinations[0].isWin(), false],
        featuredMove,
      };
    case 2:
      return {
        winnings,
        reels: transpose([pos[0], stillMove(), pos[1]]),
        rowWinStatus: [combinations[0].isWin(), false, combinations[1].isWin()],
        featuredMove,
      };
    case 3:
      return {
        winnings,
        reels: transpose(pos),
        rowWinStatus: combinations.map(c => c.isWin()),
        featuredMove,
      };

    default:
      throw new Error('Illegal bet lines ' + bet.lines);
  }
}

// prettier-ignore
const MovesTable: Array<[string, number, number, number, number, () => CardPosition[], SoundPlayer, string | null]> = [
  // ID          PROB    PAYOUT DAMAGE EPICNESS   MOVE GENERATOR                         SOUND PLAYER            WIN MSG
  ['1S4*'	      , 0.0015 , 30	  , 45   , 333   , scatter                             , MoveSound.scatter    , "Wizards weren't joking with this!"    ],
  ['3A2T'	      , 0.0600 , 0.5  , 4	   , 8     , b3of(Card.Punch)                    , MoveSound.punch      , "Eat it grunt!"                        ],
  ['3B2T'	      , 0.0500 , 0.7  , 7    , 10    , b3of(Card.Sword)                    , MoveSound.sword      , "Taste my steel"                       ],
  ['3C2T'	      , 0.0400 , 1.2  , 14   , 13    , b3of(Card.Boomerang)                , MoveSound.boomerang  , "Swift Troomerang!"                    ],
  ['3D2T'	      , 0.0080 , 7.7  , 29   , 63    , b3of(Card.Tronium)                  , MoveSound.tronium    , "I found Tronium!"                     ],
  ['4A1T'	      , 0.0312 , 1	  , 5    , 16    , b4of(Card.Punch)                    , MoveSound.punch      , "Squishy sand bag!"                    ],
  ['4B1T'	      , 0.0260 , 1.4  , 9	   , 19    , b4of(Card.Sword)                    , MoveSound.sword      , "I'm gonna chop you!"                  ],
  ['4C1T'	      , 0.0208 , 2.4  , 19	 , 24    , b4of(Card.Boomerang)                , MoveSound.boomerang  , "Twisted just like you grunts!"        ],
  ['4D1T'	      , 0.0042 , 15.4	, 38	 , 120   , b4of(Card.Tronium)                  , MoveSound.tronium    , "I'm the tronium hunter"               ],
  ['5A'	        , 0.0150 , 2.5	, 6	   , 33    , b5of(Card.Punch)                    , MoveSound.punch      , "Somersault and punch!"                ],
  ['5B'	        , 0.0125 , 3.5	, 12.5 , 40    , b5of(Card.Sword)                    , MoveSound.sword      , "Chop chop chop potato"                ],
  ['5C'	        , 0.0100 , 18	  , 25	 , 50    , b5of(Card.Boomerang)                , MoveSound.boomerang  , "and that my friends.. is a headshot!" ],
  ['5D'	        , 0.0020 , 50	  , 50	 , 250   , b5of(Card.Tronium)                  , MoveSound.tronium    , "Tronia wants me to win!"              ],
  ['3A2B'	      , 0.0080 , 0.9	, 9	   , 63    , b3and2(Card.Punch, Card.Sword)      , MoveSound.punch      , "You won't escape this!"               ],
  ['3A2C'	      , 0.0072 , 1.1	, 15	 , 69    , b3and2(Card.Punch, Card.Boomerang)  , MoveSound.punch      , "and that my friends.. is a headshot!" ],
  ['3A2D'	      , 0.0065 , 4.4	, 26	 , 77    , b3and2(Card.Punch, Card.Tronium)    , MoveSound.punch      , "Tronium overcharge!"                  ],
  ['3B2A'	      , 0.0067 , 1	  , 10	 , 75    , b3and2(Card.Sword, Card.Punch)      , MoveSound.sword      , "Steady blade!"                        ],
  ['3B2C'	      , 0.0060 , 1.3	, 18	 , 83    , b3and2(Card.Sword, Card.Boomerang)  , MoveSound.sword      , "Hits like an eagle with steel claws!" ],
  ['3B2D'	      , 0.0054 , 4.6	, 29	 , 93    , b3and2(Card.Sword, Card.Tronium)    , MoveSound.sword      , "Tronium overcharge!"                  ],
  ['3C2A'	      , 0.0053 , 1.5	, 17	 , 94    , b3and2(Card.Boomerang, Card.Punch)  , MoveSound.boomerang  , "Take that you grunt!"                 ],
  ['3C2B'	      , 0.0048 , 1.6	, 19	 , 104   , b3and2(Card.Boomerang, Card.Sword)  , MoveSound.boomerang  , "Gonna chop you like a chainsaw!"      ],
  ['3C2D'	      , 0.0043 , 5.1	, 36	 , 116   , b3and2(Card.Boomerang, Card.Tronium), MoveSound.boomerang  , "Tronium overcharge!"                  ],
  ['3D2A'	      , 0.0011 , 8	  , 32	 , 469   , b3and2(Card.Tronium, Card.Punch)    , MoveSound.tronium    , "Tronium overcharge!"                  ],
  ['3D2B'	      , 0.0010 , 8.1	, 34	 , 521   , b3and2(Card.Tronium, Card.Sword)    , MoveSound.tronium    , "Tronium overcharge!"                  ],
  ['3D2C'	      , 0.0009 , 8.3	, 40	 , 579   , b3and2(Card.Tronium, Card.Boomerang), MoveSound.tronium    , "Tronium overcharge!"                  ],
  ['3ABCD1SN1T'	, 0.1000 , 0	  , 0	   , 100   , b3ABCD1SN1T                         , MoveSound.block      , "Enemy dodge"                          ],
  ['4ABCD1SN'	  , 0.0500 , 0	  , 0	   , 150   , b4ABCD1SN                           , MoveSound.block      , "Enemy dodge"                          ],
  ['2ABCD3T'	  , 0.1000 , 0	  , 0	   , 0     , b2ABCD3T                            , MoveSound.trash      , "Almost hit"                           ],
  ['1ABCD4T'	  , 0.1000 , 0	  , 0	   , 0     , b1ABCD4T                            , MoveSound.trash      , "He blocked the attacks!"              ],
  ['2ABCD1NP2T'	, 0.0500 , 0	  , 0	   , 0     , b2ABCD1NP2T                         , MoveSound.trash      , "Very close"                           ],
  ['2ABCD2NP1T'	, 0.0500 , 0	  , 0	   , 0     , b2ABCD2NP1T                         , MoveSound.trash      , "Darn lizard!"                         ],
  ['5T'	        , 0.2116 , 0	  , 0	   , 0     , b5T                                 , MoveSound.trash      , "That grunt threw dust at my face"     ],
]

Move.createAll(MovesTable);
