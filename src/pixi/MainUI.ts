import { Application, Container } from 'pixi.js';
import { Battle, Player } from '../model/api';
import { BoostChoice, LineChoice } from '../model/base';
import { BattleScreen } from './BattleScreen';
import { Dimension } from './commons';
import { Layout } from './constants';
import { GlobalDispatcher } from './GlobalDispatcher';
import { HomeScreen, MainBackground, TitleScreen } from './HomeAndTitleScreen';
import { LoadingScreen } from './LoadingScreen';
import * as Tween from '@tweenjs/tween.js';

export class MainUI {
  private currentScreen: Disposable | null = null;
  private mainBg: Container | null = null;
  private ctx: ScreenContext;
  private app: Application;
  constructor(gd: GlobalDispatcher, size: Dimension) {
    this.app = new Application({
      height: Layout.screen.height,
      width: Layout.screen.width,
      antialias: true,
    });
    this.ctx = {
      gd,
      size,
      parent: this.app.stage,
    };
  }
  start() {
    document.body.appendChild(this.app.view);
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
  private setScreen(screen: Disposable) {
    if (this.currentScreen) {
      this.currentScreen.dispose();
      this.currentScreen = null;
    }
    this.currentScreen = screen;
  }
}
export interface ScreenContext {
  gd: GlobalDispatcher;
  size: Dimension;
  parent: Container;
}
export interface Disposable {
  dispose(): void;
}
