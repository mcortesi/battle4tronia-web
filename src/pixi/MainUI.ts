import { Application, Container } from 'pixi.js';
import { Battle, Player } from '../model/api';
import { BoostChoice, LineChoice } from '../model/base';
import { BattleScreen } from './BattleScreen';
import { Dimension } from './commons';
import { Layout } from './constants';
import { GlobalDispatcher } from './GlobalDispatcher';
import { TitleScreen } from './TitleScreen';
import { HomeScreen } from './HomeScreen';
import { LoadingScreen } from './LoadingScreen';
import * as Tween from '@tweenjs/tween.js';
import { MainBackground } from './backgrounds';
import { newContainer } from './utils';
import debounce from 'lodash.debounce';
import { AddMoreModal } from './AddMoreModal';
import { CashOutModal } from './CashOutModal';

export class MainUI {
  private currentScreen: Disposable | null = null;
  private mainBg: Container | null = null;
  private ctx: ScreenContext;
  private app: Application;
  private mainStage: Container;
  private resolution = 1;

  private currentModal: Disposable | null = null;
  // private resolution = window.devicePixelRatio;

  constructor(gd: GlobalDispatcher, size: Dimension) {
    this.app = new Application({
      height: window.innerHeight / this.resolution,
      width: window.innerWidth / this.resolution,
      resolution: this.resolution,
      antialias: true,
    });
    this.mainStage = newContainer();
    this.app.stage.addChild(this.mainStage);
    this.ctx = {
      gd,
      size,
      parent: this.mainStage,
    };
  }

  start() {
    document.body.appendChild(this.app.view);
    this.refreshScale();
    window.addEventListener('resize', debounce(this.refreshScale, 50));

    this.app.ticker.add(delta => {
      Tween.update();
    });
    this.app.start();
  }

  enterLoading() {
    this.setScreen(LoadingScreen(this.ctx));
  }

  enterTitle() {
    this.ensureMainBackground();
    this.setScreen(TitleScreen(this.ctx));
  }

  enterHome(player: Player) {
    this.ensureMainBackground();
    this.setScreen(
      HomeScreen({
        ...this.ctx,
        player,
      })
    );
  }
  enterBattle(initialState: {
    player: Player;
    battle: Battle;
    boost: BoostChoice;
    attack: LineChoice;
  }) {
    this.clearMainBackground();
    this.setScreen(
      BattleScreen({
        ...this.ctx,
        player: initialState.player,
        battle: initialState.battle,
        boost: initialState.boost,
        attack: initialState.attack,
      })
    );
  }

  openAddMoreModal() {
    this.setModal(AddMoreModal(this.ctx));
  }

  openCashOutModal() {
    this.setModal(CashOutModal(this.ctx));
  }

  private ensureMainBackground() {
    if (!this.mainBg) {
      this.mainBg = MainBackground(this.ctx.size);
      this.ctx.parent.addChild(this.mainBg);
    }
  }
  private clearMainBackground() {
    if (this.mainBg) {
      this.ctx.parent.removeChild(this.mainBg);
      this.mainBg = null;
    }
  }
  private setModal(modal: Disposable) {
    if (this.currentModal) {
      this.currentModal.dispose();
      this.currentModal = null;
    }
    this.currentModal = modal;
  }

  private setScreen(screen: Disposable) {
    if (this.currentScreen) {
      this.currentScreen.dispose();
      this.currentScreen = null;
    }
    this.currentScreen = screen;
  }

  private refreshScale = () => {
    const deviceWidth = window.innerWidth / this.resolution;
    const deviceHeight = window.innerHeight / this.resolution;
    this.app.renderer.resize(deviceWidth, deviceHeight);
    const scale = Math.min(deviceWidth / Layout.screen.width, deviceHeight / Layout.screen.height);
    this.mainStage.scale.set(scale, scale);
  };
}
export interface ScreenContext {
  gd: GlobalDispatcher;
  size: Dimension;
  parent: Container;
}
export interface Disposable {
  dispose(): void;
}
