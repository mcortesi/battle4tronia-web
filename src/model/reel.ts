import { rndElem, shuffle, transpose } from '../utils';
import { Bet } from './api';
import { BoostChoice } from './base';
import { SoundId } from '../pixi/SoundManager';

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

export class Card {
  static ALL: Card[] = [];
  static ALL_BYKIND: Map<CardKind, Card[]> = new Map();

  static Punch = new Card('punch', CardKind.Attack, true);
  static Boomerang = new Card('boomerang', CardKind.Attack, true);
  static Sword = new Card('sword', CardKind.Attack, true);
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
    table: Array<[string, number, number, number, number, () => CardPosition[], SoundId]>
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
    readonly soundId: SoundId
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
  sound: SoundId;
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
    payout: baseWinnings.payout * bet.tronium * bet.lines,
    damage: baseWinnings.damage * damageMultiplier,
    epicness: baseWinnings.epicness * damageMultiplier,
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
        sound: featuredMove.soundId,
      };
    case 2:
      return {
        winnings,
        reels: transpose([pos[0], stillMove(), pos[1]]),
        rowWinStatus: [combinations[0].isWin(), false, combinations[1].isWin()],
        sound: featuredMove.soundId,
      };
    case 3:
      return {
        winnings,
        reels: transpose(pos),
        rowWinStatus: combinations.map(c => c.isWin()),
        sound: featuredMove.soundId,
      };

    default:
      throw new Error('Illegal bet lines ' + bet.lines);
  }
}

// prettier-ignore
const MovesTable: Array<[string, number, number, number, number, () => CardPosition[], SoundId]> = [
  // ID          PROB    PAYOUT DAMAGE EPICNESS   MOVE GENERATOR
  ['1S4*'	      , 0.0015 , 30	  , 45   , 3333   , scatter                             , 'card-scatter'   ],
  ['3A2T'	      , 0.0600 , 0.5  , 4	   , 83     , b3of(Card.Punch)                    , 'card-punch'     ],
  ['3B2T'	      , 0.0500 , 0.7  , 7    , 100    , b3of(Card.Boomerang)                , 'card-boomerang' ],
  ['3C2T'	      , 0.0400 , 1.2  , 14   , 125    , b3of(Card.Sword)                    , 'card-sword'     ],
  ['3D2T'	      , 0.0080 , 7.7  , 29   , 625    , b3of(Card.Tronium)                  , 'card-tronium'   ],
  ['4A1T'	      , 0.0312 , 1	  , 5    , 160    , b4of(Card.Punch)                    , 'card-punch'     ],
  ['4B1T'	      , 0.0260 , 1.4  , 9	   , 192    , b4of(Card.Boomerang)                , 'card-boomerang' ],
  ['4C1T'	      , 0.0208 , 2.4  , 19	 , 240    , b4of(Card.Sword)                    , 'card-sword'     ],
  ['4D1T'	      , 0.0042 , 15.4	, 38	 , 1202   , b4of(Card.Tronium)                  , 'card-tronium'   ],
  ['5A'	        , 0.0150 , 2.5	, 6	   , 333    , b5of(Card.Punch)                    , 'card-punch'     ],
  ['5B'	        , 0.0125 , 3.5	, 12.5 , 400    , b5of(Card.Boomerang)                , 'card-boomerang' ],
  ['5C'	        , 0.0100 , 18	  , 25	 , 500    , b5of(Card.Sword)                    , 'card-sword'     ],
  ['5D'	        , 0.0020 , 50	  , 50	 , 2500   , b5of(Card.Tronium)                  , 'card-tronium'   ],
  ['3A2B'	      , 0.0080 , 0.9	, 9	   , 625    , b3and2(Card.Punch, Card.Boomerang)  , 'card-punch'     ],
  ['3A2C'	      , 0.0072 , 1.1	, 15	 , 694    , b3and2(Card.Punch, Card.Sword)      , 'card-punch'     ],
  ['3A2D'	      , 0.0065 , 4.4	, 26	 , 772    , b3and2(Card.Punch, Card.Tronium)    , 'card-punch'     ],
  ['3B2A'	      , 0.0067 , 1	  , 10	 , 750    , b3and2(Card.Boomerang, Card.Punch)  , 'card-boomerang' ],
  ['3B2C'	      , 0.0060 , 1.3	, 18	 , 833    , b3and2(Card.Boomerang, Card.Sword)  , 'card-boomerang' ],
  ['3B2D'	      , 0.0054 , 4.6	, 29	 , 926    , b3and2(Card.Boomerang, Card.Tronium), 'card-boomerang' ],
  ['3C2A'	      , 0.0053 , 1.5	, 17	 , 938    , b3and2(Card.Sword, Card.Punch)      , 'card-sword'     ],
  ['3C2B'	      , 0.0048 , 1.6	, 19	 , 1042   , b3and2(Card.Sword, Card.Boomerang)  , 'card-sword'     ],
  ['3C2D'	      , 0.0043 , 5.1	, 36	 , 1157   , b3and2(Card.Sword, Card.Tronium)    , 'card-sword'     ],
  ['3D2A'	      , 0.0011 , 8	  , 32	 , 4688   , b3and2(Card.Tronium, Card.Punch)    , 'card-tronium'   ],
  ['3D2B'	      , 0.0010 , 8.1	, 34	 , 5208   , b3and2(Card.Tronium, Card.Boomerang), 'card-tronium'   ],
  ['3D2C'	      , 0.0009 , 8.3	, 40	 , 5787   , b3and2(Card.Tronium, Card.Sword)    , 'card-tronium'   ],
  ['3ABCD1SN1T'	, 0.1000 , 0	  , 0	   , 1000   , b3ABCD1SN1T                         , 'card-scatterneg'],
  ['4ABCD1SN'	  , 0.0500 , 0	  , 0	   , 1500   , b4ABCD1SN                           , 'card-scatterneg'],
  ['2ABCD3T'	  , 0.1000 , 0	  , 0	   , 0      , b2ABCD3T                            , 'card-trashA'     ],
  ['1ABCD4T'	  , 0.1000 , 0	  , 0	   , 0      , b1ABCD4T                            , 'card-trashB'     ],
  ['2ABCD1NP2T'	, 0.0500 , 0	  , 0	   , 0      , b2ABCD1NP2T                         , 'card-trashC'     ],
  ['2ABCD2NP1T'	, 0.0500 , 0	  , 0	   , 0      , b2ABCD2NP1T                         , 'card-trashD'     ],
  ['5T'	        , 0.2116 , 0	  , 0	   , 0      , b5T                                 , 'card-trashE'     ],
];

Move.createAll(MovesTable);
