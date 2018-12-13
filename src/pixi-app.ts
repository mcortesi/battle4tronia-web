import * as PIXI from 'pixi.js';
import * as Tween from '@tweenjs/tween.js';
import { createButton, Dimension, Position } from './pixi/commons';
import { Layout } from './pixi/constants';
import { BoostChoice, LineChoice } from './pixi/model';
import { createScoreBox, ScoresUI } from './pixi/score-view';
import { BoostSelector, LinesSelector, SelectorUI } from './pixi/selectors';
import { ReelsUI } from './pixi/slots';
import SoundManager from './pixi/sounds';

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
  loader.add('symbol1', '/assets/ficha1.png');
  loader.add('symbol2', '/assets/ficha2.png');
  loader.add('symbol3', '/assets/ficha3.png');
  loader.load(onLoad);
}

export interface BoardState {
  troniumBalance: number;
  fameBalance: number;
  boostIdx: number;
  boostChoices: BoostChoice[];
  linesIdx: number;
  linesChoices: LineChoice[];
  villain: {
    maxHP: number;
    hp: number;
  };
}

export interface Handlers {
  setBoost: (idx: number) => void;
  setLines: (idx: number) => void;
  onClose: () => void;
  onHelp: () => void;
}

export class BattleApp {
  private boardState: BoardState;
  private battleUI: BattleUI;

  constructor() {
    this.battleUI = new BattleUI();
    this.boardState = {
      fameBalance: 100,
      troniumBalance: 100,
      boostIdx: 0,
      boostChoices: BoostChoice.ALL,
      linesIdx: 0,
      linesChoices: LineChoice.ALL,
      villain: {
        hp: 300,
        maxHP: 300,
      },
    };

    this.battleUI.setup(this.boardState, {
      setBoost: this.updater(this.setBoost),
      setLines: this.updater(this.setLines),
      onClose: () => {
        console.log('closeee');
      },
      onHelp: () => {
        console.log('Helpee');
      },
    });
  }

  public start() {
    this.battleUI.start();
  }

  setBoost = (boostIdx: number) => {
    this.boardState = {
      ...this.boardState,
      boostIdx,
    };
  };
  setLines = (linesIdx: number) => {
    this.boardState = {
      ...this.boardState,
      linesIdx,
    };
  };

  updater(f: (...args: any[]) => void) {
    return (...args: any[]) => {
      f(...args);
      this.battleUI.update(this.boardState);
    };
  }
}

export class BattleUI {
  private app: PIXI.Application;
  private scoresUI: ScoresUI;
  private energyBarUI: MetricBar;
  private hpBarUI: MetricBar;
  private betSelectorUI: SelectorUI<BoostChoice>;
  private linesSelectorUI: SelectorUI<LineChoice>;
  private reelsUI: ReelsUI;

  public setup(boardState: BoardState, handlers: Handlers): void {
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

    this.scoresUI = createScoreBox({
      fame: boardState.fameBalance,
      tronium: boardState.troniumBalance,
    });
    stage.addChild(this.scoresUI.view);

    this.reelsUI = new ReelsUI(Layout.reels);
    this.reelsUI.selectLines(boardState.linesChoices[boardState.linesIdx]);
    stage.addChild(this.reelsUI.stage);

    stage.addChild(createHero(Layout.hero));
    stage.addChild(createVillain(Layout.villain));

    this.energyBarUI = createEnergyBar({
      color: 0x05bcec,
      x: Layout.energyBar.x,
      y: Layout.energyBar.y,
      width: Layout.energyBar.w,
      height: Layout.energyBar.h,
    });
    stage.addChild(this.energyBarUI.view);

    this.hpBarUI = createHPBar({
      color: 0xff3300,
      x: Layout.hpBar.x,
      y: Layout.hpBar.y,
      width: Layout.hpBar.w,
      height: Layout.hpBar.h,
    });
    stage.addChild(this.hpBarUI.view);

    stage.addChild(
      createGlobalButtons({
        x: 1260,
        y: 27,
        onClose: handlers.onClose,
        onHelp: handlers.onHelp,
      })
    );

    // Bet Controls
    this.betSelectorUI = new BoostSelector({
      ...Layout.betSelector,
      parent: stage,
      initValue: boardState.boostIdx,
      choices: boardState.boostChoices,
      setValue: handlers.setBoost,
    });

    // Lines Controls
    this.linesSelectorUI = new LinesSelector({
      ...Layout.linesSelector,
      parent: stage,
      initValue: boardState.linesIdx,
      choices: boardState.linesChoices,
      setValue: handlers.setLines,
    });

    const spinBtn = createButton({
      x: 0,
      y: 520,
      texture: PIXI.loader.resources.btnSpin.texture,
      onClick: () => {
        SoundManager.playSpin();
        this.reelsUI.animateReels();
      },
    });
    spinBtn.anchor.set(0.5, 0);
    spinBtn.x = stage.width / 2;
    spinBtn.alpha = 0.5;
    spinBtn.hitArea = new PIXI.Rectangle(-103, 7, 207, 115);
    stage.addChild(spinBtn);

    stage.addChild(drawRules([643, 643 + 95], [305, 400]));
  }

  start() {
    document.body.appendChild(this.app.view);
    this.app.ticker.add(delta => {
      Tween.update();
    });
    this.app.start();
  }

  public update(boardState: BoardState): void {
    this.scoresUI.setFame(boardState.fameBalance);
    this.scoresUI.setTronium(boardState.troniumBalance);
    this.betSelectorUI.update(boardState.boostIdx);
    this.linesSelectorUI.update(boardState.linesIdx);
    this.reelsUI.selectLines(boardState.linesChoices[boardState.linesIdx]);
  }
}

function createBackground(opts: Dimension) {
  const bg = new PIXI.Sprite(PIXI.loader.resources.battleground.texture);
  bg.width = opts.width;
  bg.height = opts.height;
  bg.tint = 0x999999;
  return bg;
}

function createHero(opts: Position & Dimension) {
  const hero = new PIXI.Sprite(PIXI.loader.resources.hero.texture);
  hero.position.set(opts.x, opts.y);
  hero.width = opts.width;
  hero.height = opts.height;
  return hero;
}

function createVillain(opts: Position & Dimension) {
  const villain = new PIXI.Sprite(PIXI.loader.resources.villain.texture);
  villain.position.set(opts.x, opts.y);
  villain.width = opts.width;
  villain.height = opts.height;
  return villain;
}

function createGlobalButtons(opts: Position & { onClose: () => void; onHelp: () => void }) {
  const container = new PIXI.Container();
  container.position.set(opts.x, opts.y);
  container.addChild(
    createButton({
      x: 0,
      y: 0,
      texture: PIXI.loader.resources.icoHelp.texture,
      onClick: opts.onHelp,
    })
  );
  container.addChild(
    createButton({
      x: 49,
      y: 0,
      texture: PIXI.loader.resources.icoClose.texture,
      onClick: opts.onClose,
    })
  );
  return container;
}

function drawRules(horizontal: number[], vertical: number[]) {
  const line = new PIXI.Graphics();
  line.lineStyle(1, 0x0000ff);

  vertical.forEach(x => {
    line.moveTo(x, 0).lineTo(x, Layout.screen.h);
  });
  horizontal.forEach(y => {
    line.moveTo(0, y).lineTo(Layout.screen.w, y);
  });
  return line;
}

function createBar(opts: { color: number } & Position & Dimension) {
  const bar = new PIXI.Container();
  bar.position.set(opts.x, opts.y);

  const bgBar = new PIXI.Graphics();
  bgBar.lineStyle(1, 0xffffff);
  bgBar.drawRect(0, 0, opts.width, opts.height);
  bar.addChild(bgBar);

  const outerBar = new PIXI.Graphics();
  outerBar.beginFill(opts.color);
  outerBar.drawRect(0, 0, opts.width, opts.height);
  outerBar.endFill();
  bar.addChild(outerBar);

  return {
    view: bar,
    outer: outerBar,
  };
}

export interface MetricBar {
  view: PIXI.Container;
  setFillPercentage: (x: number) => void;
}
function createEnergyBar(opts: { color: number } & Position & Dimension): MetricBar {
  const bar = createBar(opts);

  return {
    view: bar.view,
    setFillPercentage: (x: number) => {
      bar.outer.width = opts.width * x;
    },
  };
}

function createHPBar(opts: { color: number } & Position & Dimension): MetricBar {
  const bar = createBar(opts);
  return {
    view: bar.view,
    setFillPercentage: (x: number) => {
      bar.outer.width = opts.width * x;
    },
  };
}
