import { BoostChoice, LineChoice } from '../model/base';
import { GameClient } from '../model/game';
import { AssetLoader } from './AssetLoader';
import { Layout } from './constants';
import { GlobalDispatcher, ModelActions } from './GlobalDispatcher';
import { MainUI } from './MainUI';

export class Orchestrator implements ModelActions {
  private game: GameClient;
  private gd: GlobalDispatcher;
  private loader: AssetLoader;

  private currentBoost: BoostChoice;
  private currentAttack: LineChoice;
  private ui: MainUI;

  constructor(gd: GlobalDispatcher, game: GameClient, loader: AssetLoader) {
    this.game = game;
    this.gd = gd;
    this.loader = loader;
    this.currentAttack = LineChoice.DEFAULT;
    this.currentBoost = BoostChoice.DEFAULT;

    this.ui = new MainUI(gd, Layout.screen);

    gd.registerForModel(this);

    gd.registerForBattleModel({
      setAttackChoice: (attack: LineChoice) => {
        this.currentAttack = attack;
        this.updateBetBalanceCheck();
      },
      setBoostChoice: (boost: BoostChoice) => {
        this.currentBoost = boost;
        this.updateBetBalanceCheck();
      },
    });
  }

  async start() {
    this.ui.start();
    this.ui.enterLoading();
    await this.loader.loadAll();
    await this.game.init();
    if (this.game.connected) {
      await this.goHome();
    } else {
      await this.goTitle();
    }
  }

  async goHome() {
    this.ui.enterHome(this.game.player);
    await this.requestGlobalStats();
  }
  async goTitle() {
    this.ui.enterTitle();
    await this.requestGlobalStats();
  }

  requestConnect = async () => {
    await this.game.connect();
    await this.goHome();
  };

  requestBattle = async () => {
    const battle = await this.game.getCurrentBattle();
    this.ui.enterBattle({
      player: this.game.player,
      battle,
      attack: this.currentAttack,
      boost: this.currentBoost,
    });
  };

  requestGlobalStats = async () => {
    const stats = await this.game.getGlobalStats();
    this.gd.setGlobalStats(stats);
  };

  requestPlayerStats = async () => {
    const stats = await this.game.getPlayerStats();
    this.gd.setPlayerStats(stats);
  };

  requestSpin = async () => {
    this.gd.startSpinning(
      this.game.player.tronium - this.currentBoost.bet * this.currentAttack.value
    );
    const res = await this.game.spin({
      level: 1,
      tronium: this.currentBoost.bet,
      lines: this.currentAttack.value,
    });
    this.gd.endSpinning(res);
    this.updateBetBalanceCheck();
  };

  updateBetBalanceCheck() {
    const bet = this.currentBoost.bet * this.currentAttack.value;
    this.gd.canBetWithCurrentBalance(bet <= this.game.player.tronium);
  }

  exitBattle = () => this.goHome();
}
