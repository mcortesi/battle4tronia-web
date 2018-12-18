import * as Tween from '@tweenjs/tween.js';
import { Application, Container } from 'pixi.js';
import { Game, Player, Match } from '../model/game';
import { BattleModelActions, GlobalDispatcher, ModelActions, ScreenActions } from './actions';
import { Layout } from './constants';
import { LoadingScreen } from './LoadingScreen';
import { BoostChoice, LineChoice } from './model';
import { TitleScreen, HomeScreen, MainBackground } from './HomeAndTitleScreen';
import { BattleScreen } from './BattleScreen';

export class MainManager implements ModelActions, BattleModelActions, ScreenActions {
  private game: Game;
  private gd: GlobalDispatcher;
  private currentBoost: BoostChoice;
  private currentAttack: LineChoice;
  private app: Application;
  private currentScreen: Unloadable | null;
  private mainBg: Container | null;
  private size = {
    height: Layout.screen.h,
    width: Layout.screen.w,
  };

  constructor(gd: GlobalDispatcher) {
    this.gd = gd;
    this.game = new Game();
    this.currentAttack = LineChoice.DEFAULT;
    this.currentBoost = BoostChoice.DEFAULT;

    this.app = new Application({
      height: Layout.screen.h,
      width: Layout.screen.w,
      antialias: true,
      // transparent: true,
      // resolution: window.devicePixelRatio,
    });

    document.body.appendChild(this.app.view);
    this.app.ticker.add(delta => {
      Tween.update();
    });
    this.app.start();
    gd.registerForModel(this);
    gd.registerForBattleModel(this);
    gd.registerForScreen(this);
  }

  requestConnect = () => {
    this.gd.enterHome(this.game.player);
  };

  setAttackChoice = (attack: LineChoice) => {
    this.currentAttack = attack;
  };

  setBoostChoice = (boost: BoostChoice) => {
    this.currentBoost = boost;
  };

  requestBattle = async () => {
    await this.game.startMatch();
    this.gd.enterBattle({
      player: this.game.player,
      battle: this.game.match,
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
    const res = await this.game.move({
      bet: this.currentBoost.value,
      lines: this.currentAttack.value,
    });
    this.gd.endSpinning({
      newFame: this.game.player.fame,
      newTronium: this.game.player.tronium,
      newScore: this.game.match.score,
      newVillainHP: this.game.match.villain.hp,
      moveResult: res,
    });
  };

  enterLoading = () => {
    this.tryUnload();
    this.currentScreen = new LoadingScreen({
      gd: this.gd,
      size: this.size,
      parent: this.app.stage,
    });
  };

  enterTitle = () => {
    this.tryUnload();
    this.mainBg = MainBackground(this.size);
    this.app.stage.addChild(this.mainBg);

    this.currentScreen = TitleScreen({
      gd: this.gd,
      size: this.size,
      parent: this.app.stage,
    });
  };

  enterHome = (player: Player) => {
    this.tryUnload();
    if (!this.mainBg) {
      this.mainBg = MainBackground(this.size);
      this.app.stage.addChild(this.mainBg);
    }
    this.currentScreen = HomeScreen({
      gd: this.gd,
      size: this.size,
      parent: this.app.stage,
      player,
    });
  };

  enterBattle = (initialState: {
    player: Player;
    battle: Match;
    boost: BoostChoice;
    attack: LineChoice;
  }) => {
    this.tryUnload();
    if (this.mainBg) {
      this.app.stage.removeChild(this.mainBg);
      this.mainBg = null;
    }
    this.currentScreen = BattleScreen({
      gd: this.gd,
      size: this.size,
      parent: this.app.stage,
      player: initialState.player,
      battle: initialState.battle,
      boost: initialState.boost,
      attack: initialState.attack,
    });
  };

  exitBattle = () => {
    this.enterHome(this.game.player);
    //
  };

  private tryUnload() {
    if (this.currentScreen) {
      this.currentScreen.unload();
      this.currentScreen = null;
    }
  }
}

export interface Unloadable {
  unload(): void;
}
