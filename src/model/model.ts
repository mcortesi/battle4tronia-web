export type Address = string;
export interface Collectable {
  id: Address;
}
export type Line = 1 | 2 | 3;
export interface Player {
  name: string;
  tronium: number;
  fame: number;
  collectables: Collectable[];
  item1: null | Collectable;
  item2: null | Collectable;
  item3: null | Collectable;
  item4: null | Collectable;
}
export interface Bet {
  level: number;
  tronium: number;
  lines: Line;
}
export interface Villain {
  hp: number;
  readonly maxHp: number;
}
export const enum BattleStatus {
  READY = 'READY',
  ONGOING = 'ONGOING',
  FINISHED = 'FINISHED',
}
export interface Battle {
  status: BattleStatus;
  epicness: number;
  tronium: number;
  villain: Villain;
}
export interface SpinResult {
  player: Player;
  bet: Bet;
  result: number[];
  currentBattle: Battle;
}
export const enum GameStatus {
  INSTALL_TRONLINK = 'INSTALL_TRONLINK',
  LOGIN_TRONLINK = 'LOGIN_TRONLINK',
  NO_CHANNEL_OPENED = 'NO_CHANNEL_OPENED',
  NOT_ENOUGH_BALANCE = 'NOT_ENOUGH_BALANCE',
  READY = 'READY',
  ERROR = 'ERROR',
}
export interface FightStats {
  playerName: string;
  epicness: number;
  troniums: number;
  seconds: number;
}
export interface PlayerStats {
  bestFight: FightStats;
  villainsDefeated: number;
}
export interface GlobalStats {
  allTime: FightStats[]; // sorted by famepoints descending
  villainsDefeated: number; // total
  bestFightWeek: FightStats;
}
