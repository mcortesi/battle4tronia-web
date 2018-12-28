import { BattleStatus, GameStatus } from '../model/api';
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
  private loggedIn = false;

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
    this.loggedIn = true;
    this.ui.enterHome(this.game.player);
    const globalStats = await this.game.getGlobalStats(false);
    this.gd.setGlobalStats(globalStats);
    const playerStats = await this.game.getPlayerStats();
    this.gd.setPlayerStats(playerStats);
  }
  async goTitle() {
    this.loggedIn = false;
    this.ui.enterTitle();
    const stats = await this.game.getGlobalStats();
    this.gd.setGlobalStats(stats);
  }

  requestConnect = async () => {
    const status = await this.game.refreshStatus();
    switch (status) {
      case GameStatus.ERROR:
        this.ui.openErrorModal();
        break;
      case GameStatus.INSTALL_TRONLINK:
        this.ui.openGetTronlinkModal();
        break;
      case GameStatus.LOGIN_TRONLINK:
        this.ui.openTronlinkLoggedOutModal();
        break;
      case GameStatus.NO_CHANNEL_OPENED:
        this.ui.openConnectModal(this.game.troniumPrice);

        break;
      case GameStatus.NOT_ENOUGH_BALANCE:
      case GameStatus.READY:
        await this.goHome();
        break;
      default:
        this.ui.openErrorModal();
    }
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

  requestNameChange = (name: string) => {
    this.game.changeName(name);
  };

  requestBuyTronium = async (amount: number) => {
    await this.game.buyTronium(amount);
    this.gd.playerUpdated(this.game.player);
    this.gd.closeAddMoreModal();
    if (!this.loggedIn) {
      await this.goHome();
    }
  };

  requestSellTronium = async (amount: number) => {
    await this.game.sellTronium(amount);
    this.gd.playerUpdated(this.game.player);
    this.gd.closeCashOutModal();
    await this.goTitle();
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
    if (res.currentBattle.status === BattleStatus.FINISHED) {
      const battle = await this.game.getCurrentBattle();
      this.gd.resetBattle(battle);
    }
  };

  updateBetBalanceCheck() {
    const bet = this.currentBoost.bet * this.currentAttack.value;
    this.gd.canBetWithCurrentBalance(bet <= this.game.player.tronium);
  }

  openAddMoreModal = () => {
    this.ui.openAddMoreModal(this.game.troniumPrice);
  };

  openCashOutModal = () => {
    this.ui.openCashOutModal({
      player: this.game.player,
      troniumPrice: this.game.troniumPrice,
    });
  };

  showHowToPlay = () => {
    this.ui.openHowtoPlayModal();
  };

  exitBattle = () => this.goHome();
}
