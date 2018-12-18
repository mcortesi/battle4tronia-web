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
      },
      setBoostChoice: (boost: BoostChoice) => {
        this.currentBoost = boost;
      },
    });
  }

  async start() {
    this.ui.start();
    this.ui.enterLoading();
    await this.loader.loadAll();
    await this.game.init();
    if (this.game.connected) {
      this.ui.enterHome(this.game.player);
    } else {
      this.ui.enterTitle();
    }
  }

  requestConnect = async () => {
    await this.game.connect();
    this.ui.enterHome(this.game.player);
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

  requestGeneralStats = () => {
    this.gd.setGeneralStats();
  };

  requestPlayerStats = () => {
    this.gd.setPlayerStats();
  };

  requestSpin = async () => {
    this.gd.startSpinning(this.game.player.tronium - this.currentBoost.value);
    const res = await this.game.spin({
      tronium: this.currentBoost.value,
      lines: this.currentAttack.value,
    });
    this.gd.endSpinning(res);
  };

  exitBattle = () => this.ui.enterHome(this.game.player);
}
