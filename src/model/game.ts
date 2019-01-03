import { API } from './api';
import { Battle, Bet, GameStatus, GlobalStats, Player, SpinResult, PlayerStats } from './model';
import { BetResult, Move, toBetResult } from './reel';
export interface ClientSpinResult {
  player: Player;
  bet: Bet;
  result: BetResult;
  currentBattle: Battle;
}

export class GameClient {
  troniumPrice: number;
  status: GameStatus = GameStatus.INSTALL_TRONLINK;
  private api: API;
  private _player: null | Player = null;
  private _battle: null | Battle = null;
  private _globalStats: null | GlobalStats = null;
  private _playerStats: null | PlayerStats = null;

  constructor(api: API) {
    this.api = api;

    setInterval(async () => {
      this.status = await this.api.getStatus();
    }, 1000);
  }

  get player() {
    return this._player;
  }

  get battle() {
    if (this._battle == null) {
      throw new Error('not current battle!');
    }
    return this._battle;
  }

  get connected() {
    return this.status === GameStatus.NOT_ENOUGH_BALANCE || this.status === GameStatus.READY;
  }

  async refreshPlayer() {
    this._player = await this.api.getPlayer();
    return this._player;
  }

  async refreshStatus() {
    this.status = await this.api.getStatus();
    return this.status;
  }

  async init() {
    this.troniumPrice = await this.api.getTroniumPrice();
    await this.refreshStatus();
    await this.refreshPlayer();
  }

  async connect() {
    if (!this.connected) {
      await this.api.openChannel(10);
      await this.refreshStatus();
      if (this.connected) {
        await this.refreshPlayer();
      }
    }
    return this.connected;
  }

  async getCurrentBattle() {
    this._battle = await this.api.getCurrentBattle();
    return this._battle;
  }

  async getGlobalStats(force: boolean = true) {
    if (force || this._globalStats == null) {
      this._globalStats = await this.api.getGlobalStats();
    }
    return this._globalStats;
  }

  async getPlayerStats(force: boolean = true) {
    if (force || this._playerStats == null) {
      this._playerStats = await this.api.getPlayerStats();
    }
    return this._playerStats;
  }

  async spin(bet: Bet): Promise<ClientSpinResult> {
    const res: SpinResult = await this.api.spin(bet);
    this._player = res.player;
    this._battle = res.currentBattle;
    return {
      ...res,
      result: toBetResult(bet, res.result.map(Move.fromDice)),
    };
  }

  async buyTronium(amount: number): Promise<Player> {
    await this.refreshStatus();
    if (this.status === GameStatus.NO_CHANNEL_OPENED) {
      await this.api.openChannel(amount);
      await this.refreshStatus();
      await this.refreshPlayer();
    } else if (this.status === GameStatus.READY || this.status === GameStatus.NOT_ENOUGH_BALANCE) {
      await this.api.addTronium(amount);
      await this.refreshStatus();
      await this.refreshPlayer();
    } else {
      throw new Error(`Invalid Game Status: ${this.status}`);
    }
    return this.player!;
  }

  async sellTronium(amount: number): Promise<Player> {
    await this.refreshStatus();
    if (this.status === GameStatus.READY || GameStatus.NOT_ENOUGH_BALANCE) {
      await this.api.closeChannel();
      await this.refreshStatus();
      await this.refreshPlayer();
    } else {
      throw new Error(`Invalid Game Status: ${this.status}`);
    }
    return this.player!;
  }

  changeName(name: string) {
    return this.api.updatePlayerName(name);
  }
}
