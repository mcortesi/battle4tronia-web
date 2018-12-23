import { Container, Point } from 'pixi.js';
import { Battle, Player } from '../model/api';
import { BoostChoice, LineChoice } from '../model/base';
import { Bar } from './battle/Bars';
import { BoostSelector, LinesSelector } from './battle/ChoiceSelector';
import { ReelsUI } from './battle/Reels';
import { ScoreBox } from './battle/ScoreBox';
import { Dimension, Position } from './commons';
import { Layout } from './constants';
import { GlobalDispatcher } from './GlobalDispatcher';
import { Disposable } from './MainUI';
import { newContainer, newSprite, newText } from './utils';
import { Button } from './utils/Button';
import { smallIcon, primaryBtn } from './basic';
import { BattleBackground } from './backgrounds';

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

function createUI(opts: BattleScreenProps) {
  const stage = newContainer(0, 0);
  opts.parent.addChild(stage);

  stage.addChild(BattleBackground(opts.size));

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
    maxValue: 100,
    initValue: Math.min(100, opts.player.tronium),
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
      onClose: opts.gd.exitBattle.bind(opts.gd),
      onHelp: opts.gd.showHowToPlay.bind(opts.gd),
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

  stage.addChild(
    newSprite('UIShield.png', {
      anchor: new Point(0.5, 0),
      position: new Point(opts.size.width / 2, 418),
      scale: new Point(0.6, 0.6),
    })
  );

  const spinBtn = primaryBtn('fight', opts.gd.requestSpin.bind(opts.gd), stage);

  const lowBalanceText = newText('Need more tronium', 'Body2');
  stage.addChild(lowBalanceText);
  lowBalanceText.anchor.x = 0.5;
  lowBalanceText.x = opts.size.width / 2;
  lowBalanceText.y = 645;
  lowBalanceText.visible = false;

  return {
    dispose: () => {
      opts.parent.removeChild(stage);
      stage.destroy({ children: true });
    },
    spinBtn,
    linesSelectorUI,
    betSelectorUI,
    hpBarUI,
    energyBarUI,
    scoresUI,
    lowBalanceText,
    reelsUI,
  };
}

function attachController(ui: ReturnType<typeof createUI>, gd: GlobalDispatcher) {
  let isSpinning = false;
  let lowBalance = false;

  const updateTronium = (tronium: number) => {
    ui.scoresUI.setTronium(tronium);
    ui.energyBarUI.updateValue(Math.min(100, tronium));
  };

  const handleSpinButton = () => {
    ui.spinBtn.disable = isSpinning || lowBalance;
    ui.lowBalanceText.visible = lowBalance;
  };

  const unregister1 = gd.registerForBattleModel({
    setAttackChoice: (attack: LineChoice) => {
      ui.linesSelectorUI.update(LineChoice.indexOf(attack));
      ui.reelsUI.selectLines(attack);
    },
    setBoostChoice: (boost: BoostChoice) => {
      ui.betSelectorUI.update(BoostChoice.indexOf(boost));
    },
  });

  const unregister2 = gd.registerForBattleScreen({
    startSpinning: (tronium: number) => {
      isSpinning = true;
      handleSpinButton();
      updateTronium(tronium);
      ui.reelsUI.startAnimation();
    },
    endSpinning: async result => {
      await ui.reelsUI.stopAnimation(result.result);

      ui.scoresUI.setFame(result.player.fame);
      updateTronium(result.player.tronium);
      ui.hpBarUI.updateValue(result.currentBattle.villain.hp);
      isSpinning = false;
      handleSpinButton();
    },
    canBetWithCurrentBalance: isEnough => {
      lowBalance = !isEnough;
      handleSpinButton();
    },
  });

  return () => {
    unregister1();
    unregister2();
  };
}

export function BattleScreen(opts: BattleScreenProps): Disposable {
  const ui = createUI(opts);
  const detach = attachController(ui, opts.gd);
  return {
    dispose: () => {
      detach();
      ui.dispose();
    },
  };
  // stage.addChild(drawRules([643, 643 + 95], [305, 400]));
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
  Button.from(smallIcon('IcoHowtoPlay'), opts.onHelp).addTo(container);
  Button.from(smallIcon('IcoClose', { position: new Point(49, 0) }), opts.onClose).addTo(container);
  return container;
}
