import { genArray, wait } from '../utils';
import { Move, winningsFor } from './reel';
import {
  GameStatus,
  Player,
  Collectable,
  Battle,
  Bet,
  SpinResult,
  GlobalStats,
  PlayerStats,
  BattleStatus,
} from './model';
import { API } from './api';
export class FakeApi implements API {
  private status: GameStatus;
  private player: Player;
  private battle: null | Battle = null;
  constructor(
    status: GameStatus = GameStatus.NO_CHANNEL_OPENED,
    private loggedOut: boolean = false
  ) {
    this.status = status;
    this.player = {
      name: 'Papu',
      tronium: 0,
      fame: 0,
      collectables: [],
      item1: null,
      item2: null,
      item3: null,
      item4: null,
    };
  }
  /**
   * Need to check this constantly (every x sec) to proactively check for errors
   */
  async getStatus(): Promise<GameStatus> {
    return this.status;
  }
  async openChannel(tronium: number): Promise<boolean> {
    this.loggedOut = false;
    this.status = GameStatus.READY;
    this.player.tronium += tronium;
    return true;
  }
  async addTronium(tronium: number): Promise<boolean> {
    this.player.tronium += tronium;
    return true;
  }
  async getPlayer(): Promise<Player | null> {
    if (this.loggedOut) {
      return null;
    } else {
      return clonePlayer(this.player);
    }
  }
  async updatePlayerName(name: string): Promise<Player> {
    this.player.name = name;
    return clonePlayer(this.player);
  }
  async updatePlayerItems(
    item1: null | Collectable,
    item2: null | Collectable,
    item3: null | Collectable,
    item4: null | Collectable
  ): Promise<Player> {
    this.player.item1 = item1;
    this.player.item2 = item2;
    this.player.item3 = item3;
    this.player.item4 = item4;
    return clonePlayer(this.player);
  }
  async getCurrentBattle(): Promise<Battle> {
    if (this.battle == null || this.battle.status === BattleStatus.FINISHED) {
      this.battle = {
        status: BattleStatus.READY,
        villain: {
          hp: 100,
          maxHp: 100,
        },
        epicness: 0,
        tronium: 0,
      };
    }
    return cloneBattle(this.battle);
  }
  async closeChannel(): Promise<boolean> {
    this.status = GameStatus.NO_CHANNEL_OPENED;
    this.player.tronium = 0; // CASH OUT
    return true;
  }
  async spin(bet: Bet): Promise<SpinResult> {
    if (!this.battle) {
      throw new Error('Not in battle');
    }
    const lineResults = genArray(bet.lines, () => Math.random());
    const winnings = winningsFor(bet, lineResults.map(x => Move.fromDice(x)));
    const betCost = bet.lines * bet.tronium * bet.level;
    this.player.tronium += winnings.payout - betCost;
    this.battle.tronium += winnings.payout - betCost;
    this.player.fame += winnings.epicness;
    this.battle.epicness += winnings.epicness;
    this.battle.villain.hp = Math.max(this.battle.villain.hp - winnings.damage, 0);
    this.battle.status = this.battle.villain.hp <= 0 ? BattleStatus.FINISHED : BattleStatus.ONGOING;
    return {
      result: lineResults,
      player: clonePlayer(this.player),
      currentBattle: cloneBattle(this.battle),
      bet,
    };
  }
  async getGlobalStats(): Promise<GlobalStats> {
    await wait(2000);
    return {
      allTimeByEpicness: [
        {
          playerName: 'Rob',
          epicness: 100,
          troniums: 1000000,
          seconds: 90000,
        },
        {
          playerName: 'Cono',
          epicness: 100,
          troniums: 100000,
          seconds: 90000,
        },
        {
          playerName: 'Danny',
          epicness: 100,
          troniums: 100000,
          seconds: 90000,
        },
        {
          playerName: 'Really Long Name is HEREeeeeeeeeeeeeeeeeeeee',
          epicness: 100,
          troniums: 100000,
          seconds: 90000,
        },
        {
          playerName: 'Big',
          epicness: 100,
          troniums: 100000,
          seconds: 90000,
        },
      ],
      allTimeByTroniunm: [
        {
          playerName: 'Rob',
          epicness: 100,
          troniums: 1000000,
          seconds: 90000,
        },
        {
          playerName: 'Cono',
          epicness: 100,
          troniums: 100000,
          seconds: 90000,
        },
        {
          playerName: 'Danny',
          epicness: 100,
          troniums: 100000,
          seconds: 90000,
        },
        {
          playerName: 'Really Long Name is HEREeeeeeeeeeeeeeeeeeeee',
          epicness: 100,
          troniums: 100000,
          seconds: 90000,
        },
        {
          playerName: 'Big',
          epicness: 100,
          troniums: 100000,
          seconds: 90000,
        },
      ],
      villainsDefeated: 3588,
      bestFightWeekByEpicness: {
        seconds: 55,
        epicness: 100,
        troniums: 500,
        playerName: 'Cono',
      },
      bestFightWeekByTroniunm: {
        seconds: 55,
        epicness: 100,
        troniums: 500,
        playerName: 'Cono',
      },
    };
  }
  async getPlayerStats(): Promise<PlayerStats> {
    await wait(2000);
    return {
      bestFightByEpicness: {
        seconds: 55,
        epicness: 100,
        troniums: 500,
        playerName: 'Cono',
      },
      bestFightByTroniums: {
        seconds: 55,
        epicness: 100,
        troniums: 500,
        playerName: 'Cono',
      },
      villainsDefeated: 55,
    };
  }
  async getTroniumPrice() {
    return 1.5;
  }
}
function clonePlayer(player: Player) {
  return {
    ...player,
    collectables: ([] as Collectable[]).concat(player.collectables),
  };
}
function cloneBattle(battle: Battle) {
  return {
    ...battle,
    villain: {
      ...battle.villain,
    },
  };
}
