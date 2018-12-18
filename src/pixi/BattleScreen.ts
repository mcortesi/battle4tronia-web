import { Container } from 'pixi.js';
import { Battle, Player } from '../model/api';
import { GlobalDispatcher } from './GlobalDispatcher';
import { Dimension, Position } from './commons';
import { Button } from './utils/Button';
import { Layout } from './constants';
import { newContainer, newSprite } from './utils';
import { Disposable } from './MainUI';
import { BoostChoice, LineChoice } from '../model/base';
import { ReelsUI } from './battle/Reels';
import { Bar } from './battle/Bars';
import { ScoreBox } from './battle/ScoreBox';
import { BoostSelector, LinesSelector } from './battle/ChoiceSelector';
import { SpinBtn } from './battle/SpinBtn';

export interface UIState {
  boostIdx: number;

  linesIdx: number;
}

export interface BattleScreenProps {
  player: Player;
  battle: Battle;
  size: Dimension;
  parent: Container;
  gd: GlobalDispatcher;
  attack: LineChoice;
  boost: BoostChoice;
}

export function BattleScreen(opts: BattleScreenProps): Disposable {
  const stage = newContainer(0, 0);
  opts.parent.addChild(stage);
  stage.addChild(Background(opts.size));

  const scoresUI = new ScoreBox({
    ...Layout.scoreBox,
    initFame: opts.player.fame,
    initTronium: opts.player.tronium,
  }).addTo(stage);
  const reelsUI = new ReelsUI(Layout.reels).addTo(stage);
  reelsUI.selectLines(opts.attack);

  stage.addChild(Hero(Layout.hero));
  stage.addChild(Villain(Layout.villain));

  const energyBarUI = new Bar({
    ...Layout.energyBar,
    maxValue: 1000,
    initValue: Math.min(1000, opts.player.tronium),
    leftToRight: true,
  }).addTo(stage);

  const hpBarUI = new Bar({
    ...Layout.hpBar,
    maxValue: opts.battle.villain.maxHp,
    initValue: opts.battle.villain.hp,
  }).addTo(stage);

  stage.addChild(
    GlobalButtons({
      x: 1260,
      y: 27,
      onClose: () => {
        opts.gd.exitBattle();
      },
      onHelp: () => {
        opts.gd.showHowToPlay();
      },
    })
  );

  // Bet Controls
  const betSelectorUI = new BoostSelector({
    ...Layout.betSelector,
    parent: stage,
    initValue: BoostChoice.indexOf(opts.boost),
    choices: BoostChoice.ALL,
    setValue: b => {
      opts.gd.setBoostChoice(BoostChoice.fromIdx(b));
    },
  });

  // Lines Controls
  const linesSelectorUI = new LinesSelector({
    ...Layout.linesSelector,
    parent: stage,
    initValue: LineChoice.indexOf(opts.attack),
    choices: LineChoice.ALL,
    setValue: idx => {
      opts.gd.setAttackChoice(LineChoice.fromIdx(idx));
    },
  });

  const spinBtn = SpinBtn({
    parent: stage,
    onClick: () => {
      opts.gd.requestSpin();
    },
  });

  const unregister1 = opts.gd.registerForBattleModel({
    setAttackChoice: (attack: LineChoice) => {
      linesSelectorUI.update(LineChoice.indexOf(attack));
      reelsUI.selectLines(attack);
    },
    setBoostChoice: (boost: BoostChoice) => {
      betSelectorUI.update(BoostChoice.indexOf(boost));
    },
  });

  const unregister2 = opts.gd.registerForBattleScreen({
    startSpinning: (tronium: number) => {
      scoresUI.setTronium(tronium);
      energyBarUI.updateValue(Math.min(1000, tronium));
      reelsUI.startAnimation();
    },
    endSpinning: async result => {
      await reelsUI.stopAnimation(result);

      scoresUI.setFame(result.player.fame);
      scoresUI.setTronium(result.player.tronium);
      energyBarUI.updateValue(Math.min(1000, result.player.tronium));
      hpBarUI.updateValue(result.currentBattle.villain.hp);
      spinBtn.disable = false;
    },
  });

  return {
    dispose: () => {
      unregister1();
      unregister2();
      opts.parent.removeChild(stage);
      stage.destroy({ children: true });
    },
  };
  // stage.addChild(drawRules([643, 643 + 95], [305, 400]));
}

function Background(opts: Dimension) {
  const bg = newSprite('battleground');
  bg.width = opts.width;
  bg.height = opts.height;
  bg.tint = 0x999999;
  return bg;
}

function Hero(opts: Position & Dimension) {
  const hero = newSprite('hero');
  hero.position.set(opts.x, opts.y);
  hero.width = opts.width;
  hero.height = opts.height;
  return hero;
}

function Villain(opts: Position & Dimension) {
  const villain = newSprite('villain');
  villain.position.set(opts.x, opts.y);
  villain.width = opts.width;
  villain.height = opts.height;
  return villain;
}

function GlobalButtons(opts: Position & { onClose: () => void; onHelp: () => void }) {
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
