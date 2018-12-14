import * as Tween from '@tweenjs/tween.js';
import * as PIXI from 'pixi.js';
import { Game } from './model/game';
import { Button, Dimension, Position } from './pixi/commons';
import { Layout } from './pixi/constants';
import { newContainer, newSprite } from './pixi/helpers';
import { BoostChoice, LineChoice } from './pixi/model';
import { ReelsUI } from './pixi/Reels';
import { Bar } from './pixi/scoreBars';
import { ScoreBox } from './pixi/ScoreBox';
import { BoostSelector, LinesSelector, SelectorUI } from './pixi/selectors';
import { SpinBtn } from './pixi/SpinBtn';

export function loadAssets(onLoad: () => void) {
  const loader = PIXI.loader;
  // loader.add('battleground', '/assets/battleground.jpg');
  loader.add('battleground', '/assets/battleground2.png');
  loader.add('hero', '/assets/hero_1.png');
  loader.add('villain', '/assets/villain.png');
  loader.add('energyArrow', '/assets/energy-arrow.png');
  loader.add('linesArrow', '/assets/lines-arrow.png');
  loader.add('bgCoatofarms', '/assets/bg-coatofarms.png');
  loader.add('icoTronium', '/assets/ico-tronium.png');
  loader.add('btnSpin', '/assets/btnSpin.png');
  loader.add('icoFame', '/assets/ico-fame.png');
  loader.add('icoClose', '/assets/ico-close.png');
  loader.add('icoHelp', '/assets/ico-help.png');
  loader.add('symbol-attack1', '/assets/symbol-attack1.png');
  loader.add('symbol-attack2', '/assets/symbol-attack2.png');
  loader.add('symbol-attack3', '/assets/symbol-attack3.png');
  loader.load(onLoad);
}

export interface UIState {
  boostIdx: number;
  boostChoices: BoostChoice[];
  linesIdx: number;
  linesChoices: LineChoice[];
}

export interface Handlers {
  setBoost: (idx: number) => void;
  setLines: (idx: number) => void;
  onClose: () => void;
  onHelp: () => void;
}

export class BattleApp {
  private uiState: UIState = {
    boostIdx: 0,
    boostChoices: BoostChoice.ALL,
    linesIdx: 0,
    linesChoices: LineChoice.ALL,
  };

  private game: Game = new Game();

  private app: PIXI.Application;
  private scoresUI: ScoreBox;
  private energyBarUI: Bar;
  private hpBarUI: Bar;
  private betSelectorUI: SelectorUI<BoostChoice>;
  private linesSelectorUI: SelectorUI<LineChoice>;
  private reelsUI: ReelsUI;
  private spinBtn: Button;

  public constructor() {
    // FIXME
    this.game.startMatch();

    this.app = new PIXI.Application({
      height: Layout.screen.h,
      width: Layout.screen.w,
      antialias: true,
      // transparent: true,
      // resolution: window.devicePixelRatio,
    });
    const stage = this.app.stage;

    stage.addChild(
      createBackground({
        width: Layout.screen.w,
        height: Layout.screen.h,
      })
    );

    this.scoresUI = new ScoreBox({
      ...Layout.scoreBox,
      initFame: this.game.player.fame,
      initTronium: this.game.player.tronium,
    }).addTo(stage);
    this.reelsUI = new ReelsUI(Layout.reels).addTo(stage);
    this.reelsUI.selectLines(this.uiState.linesChoices[this.uiState.linesIdx]);

    stage.addChild(createHero(Layout.hero));
    stage.addChild(createVillain(Layout.villain));

    this.energyBarUI = new Bar({
      ...Layout.energyBar,
      maxValue: 1000,
      initValue: Math.min(1000, this.game.player.tronium),
      leftToRight: true,
    }).addTo(stage);

    this.hpBarUI = new Bar({
      ...Layout.hpBar,
      maxValue: this.game.match.villain.maxHp,
      initValue: this.game.match.villain.hp,
    }).addTo(stage);

    stage.addChild(
      createGlobalButtons({
        x: 1260,
        y: 27,
        onClose: this.onClose,
        onHelp: this.onHelp,
      })
    );

    // Bet Controls
    this.betSelectorUI = new BoostSelector({
      ...Layout.betSelector,
      parent: stage,
      initValue: this.uiState.boostIdx,
      choices: this.uiState.boostChoices,
      setValue: this.setBoost,
    });

    // Lines Controls
    this.linesSelectorUI = new LinesSelector({
      ...Layout.linesSelector,
      parent: stage,
      initValue: this.uiState.linesIdx,
      choices: this.uiState.linesChoices,
      setValue: this.setLines,
    });

    this.spinBtn = SpinBtn({
      parent: stage,
      onClick: this.onSpin,
    });

    // stage.addChild(drawRules([643, 643 + 95], [305, 400]));
  }

  start() {
    document.body.appendChild(this.app.view);
    this.app.ticker.add(delta => {
      Tween.update();
    });
    this.app.start();
  }

  onClose = () => {
    console.log('onClose');
  };

  onHelp = () => {
    console.log('onHelp');
  };

  onSpin = async () => {
    this.spinBtn.disable = true;
    const bet = this.uiState.boostChoices[this.uiState.boostIdx].value;

    this.scoresUI.setTronium(this.game.player.tronium - bet);
    this.energyBarUI.updateValue(Math.min(1000, this.game.player.tronium - bet));

    this.reelsUI.startAnimation();

    console.time('GOT Result');
    const res = await this.game.move({
      bet,
      lines: this.uiState.linesChoices[this.uiState.linesIdx].value,
    });
    console.timeEnd('GOT Result');
    await this.reelsUI.stopAnimation(res);

    this.scoresUI.setFame(this.game.player.fame);
    this.scoresUI.setTronium(this.game.player.tronium);
    this.energyBarUI.updateValue(Math.min(1000, this.game.player.tronium));
    this.hpBarUI.updateValue(this.game.match.villain.hp);
    this.spinBtn.disable = false;
  };

  setBoost = (boostIdx: number) => {
    this.uiState = {
      ...this.uiState,
      boostIdx,
    };
    this.betSelectorUI.update(this.uiState.boostIdx);
  };

  setLines = (linesIdx: number) => {
    this.uiState = {
      ...this.uiState,
      linesIdx,
    };
    this.linesSelectorUI.update(this.uiState.linesIdx);
    this.reelsUI.selectLines(this.uiState.linesChoices[this.uiState.linesIdx]);
  };
}

function createBackground(opts: Dimension) {
  const bg = newSprite('battleground');
  bg.width = opts.width;
  bg.height = opts.height;
  bg.tint = 0x999999;
  return bg;
}

function createHero(opts: Position & Dimension) {
  const hero = newSprite('hero');
  hero.position.set(opts.x, opts.y);
  hero.width = opts.width;
  hero.height = opts.height;
  return hero;
}

function createVillain(opts: Position & Dimension) {
  const villain = newSprite('villain');
  villain.position.set(opts.x, opts.y);
  villain.width = opts.width;
  villain.height = opts.height;
  return villain;
}

function createGlobalButtons(opts: Position & { onClose: () => void; onHelp: () => void }) {
  const container = newContainer(opts.x, opts.y);

  new Button({
    x: 0,
    y: 0,
    texture: 'icoHelp',
    onClick: opts.onHelp,
  }).addTo(container);
  new Button({
    x: 49,
    y: 0,
    texture: 'icoClose',
    onClick: opts.onClose,
  }).addTo(container);

  return container;
}
