import { API, Battle, Bet, GameStatus, Player, SpinResult } from './api';
import { BetResult, Move, toBetResult } from './reel';
import { wait } from '../utils';
export interface ClientSpinResult {
  player: Player;
  bet: Bet;
  result: BetResult;
  currentBattle: Battle;
}

export class GameClient {
  private api: API;
  private status: GameStatus = GameStatus.INSTALL_TRONLINK;
  private _player: null | Player = null;
  private _battle: null | Battle = null;

  constructor(api: API) {
    this.api = api;

    setInterval(async () => {
      this.status = await this.api.getStatus();
    }, 1000);
  }

  get player() {
    if (this._player == null) {
      throw new Error('not current player!');
    }
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
    await this.refreshStatus();
    switch (this.status) {
      case GameStatus.INSTALL_TRONLINK:
      case GameStatus.LOGIN_TRONLINK:
      case GameStatus.NO_CHANNEL_OPENED:
        break;
      case GameStatus.NOT_ENOUGH_BALANCE:
      case GameStatus.READY:
        this._player = await this.api.getPlayer();
        break;
      case GameStatus.ERROR:
        break;
    }
  }

  async connect() {
    if (!this.connected) {
      await this.api.openChannel(1000);
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

  async getGlobalStats() {
    await wait(2000);
    return this.api.getGlobalStats();
  }

  async getPlayerStats() {
    await wait(2000);
    return this.api.getPlayerStats();
  }

  async spin(bet: Bet): Promise<ClientSpinResult> {
    // FIXME
    await wait(1000);
    const res: SpinResult = await this.api.spin(bet);
    this._player = res.player;
    this._battle = res.currentBattle;
    return {
      ...res,
      result: toBetResult(bet, res.result.map(Move.fromDice)),
    };
  }
}
