import { Tween } from '@tweenjs/tween.js';
import { Container, extras, loader, Point } from 'pixi.js';
import { Battle, BattleStatus, Player } from '../model/api';
import { BoostChoice, LineChoice } from '../model/base';
import { Lock, rndInt } from '../utils';
import { BattleBackground } from './backgrounds';
import { primaryBtn, smallIcon } from './basic';
import { Bar } from './battle/Bars';
import { BoostSelector, LinesSelector } from './battle/ChoiceSelector';
import { ReelsUI } from './battle/Reels';
import { ScoreBox } from './battle/ScoreBox';
import { Dimension, Position } from './commons';
import { Layout } from './constants';
import { GlobalDispatcher } from './GlobalDispatcher';
import { Disposable } from './MainUI';
import SoundManager from './SoundManager';
import { newContainer, newSprite, newText } from './utils';
import { Button } from './utils/Button';

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

  stage.addChild(Hero(opts.size));
  const villain = Villain(opts.size);
  stage.addChild(villain.stage);

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
      position: new Point(opts.size.width / 2, 436),
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
    villain,
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

  const spinLock = new Lock();
  const unregister2 = gd.registerForBattleScreen({
    startSpinning: async (tronium: number) => {
      isSpinning = true;
      handleSpinButton();
      updateTronium(tronium);
      ui.reelsUI.startAnimation();
    },
    endSpinning: async result => {
      await spinLock.acquire();
      try {
        await ui.reelsUI.stopAnimation(result.result);

        ui.scoresUI.setFame(result.player.fame);
        updateTronium(result.player.tronium);
        ui.hpBarUI.updateValue(result.currentBattle.villain.hp);

        if (result.currentBattle.status === BattleStatus.FINISHED) {
          await ui.villain.animateKill();
        }

        isSpinning = false;
        handleSpinButton();
      } finally {
        spinLock.release();
      }
    },
    resetBattle: async battle => {
      await spinLock.acquire();
      try {
        await ui.villain.createNew();
        ui.hpBarUI.reset(battle.villain.maxHp);
      } finally {
        spinLock.release();
      }
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

function Hero(parentSize: Dimension) {
  const hero = newSprite('Hero.png');
  hero.x = 0;
  hero.y = parentSize.height - hero.height;
  return hero;
}

function createVillainLayers() {
  const layer3 = newSprite(`z030${rndInt(1, 6)}.png`);
  const layer2 = newSprite(`z020${rndInt(1, 8)}.png`);
  const layer1 = newSprite(`z010${rndInt(1, 8)}.png`);
  return [layer3, layer2, layer1];
}
function Villain(parentSize: Dimension) {
  const baseLayer = newSprite('z04.png');

  const puff = new extras.AnimatedSprite(loader.resources.characters1.spritesheet!.animations.puff);
  puff.animationSpeed = 1 / 8;
  puff.loop = true;

  const villain = newContainer();
  const stage = newContainer(
    parentSize.width - baseLayer.width,
    parentSize.height - baseLayer.height
  );
  puff.visible = false;

  villain.addChild(baseLayer, ...createVillainLayers());
  stage.addChild(villain, puff);

  return {
    stage,
    animateKill: async () => {
      puff.visible = true;
      puff.play();
      const fadeAnim = new Promise(resolve => {
        new Tween(villain)
          .to({ alpha: 0 }, 1500)
          .onComplete(resolve)
          .start();
      });
      await Promise.all([SoundManager.playWin(), fadeAnim]);
      puff.visible = false;
      puff.gotoAndStop(0);
    },
    createNew: async () => {
      villain.removeChildren(1);
      villain.addChild(...createVillainLayers());
      villain.alpha = 1;
      villain.x = baseLayer.width; // out of the screen

      const t = new Tween(villain).to({ x: 0 }, 1500).start();
      await Promise.all([
        SoundManager.playTaunt(),
        new Promise(resolve => {
          t.onComplete(resolve);
        }),
      ]);
    },
  };
}

function GlobalButtons(opts: Position & { onClose: () => void; onHelp: () => void }) {
  const container = newContainer(opts.x, opts.y);
  Button.from(smallIcon('IcoHowtoPlay'), opts.onHelp).addTo(container);
  Button.from(smallIcon('IcoClose', { position: new Point(49, 0) }), opts.onClose, {
    soundId: 'btnNegative',
  }).addTo(container);
  return container;
}
