import { Tween } from '@tweenjs/tween.js';
import { Container, extras, loader } from 'pixi.js';
import { Battle, BattleStatus, Player } from '../model/model';
import { BoostChoice, LineChoice } from '../model/base';
import { Lock, rndInt } from '../utils';
import { BattleBackground } from './backgrounds';
import { bigIcon, FightBtn } from './basic';
import { Bar } from './battle/Bars';
import { BoostSelector, LinesSelector } from './battle/ChoiceSelector';
import { ReelsUI } from './battle/Reels';
import { ScoreBox } from './battle/ScoreBox';
import { Dimension } from './commons';
import { Layout } from './constants';
import { GlobalDispatcher } from './GlobalDispatcher';
import { Disposable } from './MainUI';
import SoundManager from './SoundManager';
import {
  centerX,
  newAnimatedSprite,
  newContainer,
  newSprite,
  newText,
  postionAfterX,
  postionOnRight,
} from './utils';
import { Button, ToggleButton } from './utils/Button';

export interface UIState {
  boostIdx: number;
  linesIdx: number;
}

export const enum FightStatus {
  Ready,
  Spinning,
  NeedTronium,
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

  const boardBg = BattleBackground(opts.size);
  stage.addChild(boardBg.stage);
  boardBg.showLine(opts.attack.value);

  const scoresUI = new ScoreBox({
    ...Layout.scoreBox,
    initFame: opts.player.fame,
    initTronium: opts.player.tronium,
  }).addTo(stage);
  const reelsUI = new ReelsUI(Layout.reels).addTo(stage);

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
    unit: 'HP',
  }).addTo(stage);

  stage.addChild(Hero(opts.size));
  const villain = Villain(opts.size);
  stage.addChild(villain.stage);

  const btnBar = ButtonBar({
    onClose: opts.gd.exitBattle.bind(opts.gd),
    onHelp: opts.gd.showHowToPlay.bind(opts.gd),
  });

  btnBar.y = 10;
  postionOnRight(opts.size.width, 10, btnBar);

  stage.addChild(btnBar);

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

  const spinBtn = FightBtn(
    opts.size,
    opts.gd.requestSpin.bind(opts.gd),
    opts.gd.openAddMoreModal.bind(opts.gd)
  );
  const uiShield = newSprite('UIShield.png');
  const lowBalanceText = newText('Need more tronium', 'Body2');
  const winText = newText('', 'H3');
  const epicnessScore = newText('0', 'H3');

  centerX(opts.size.width, uiShield);
  centerX(opts.size.width, lowBalanceText);
  centerX(opts.size.width, winText);
  centerX(opts.size.width, epicnessScore);

  uiShield.y = 450;
  epicnessScore.y = 510;
  lowBalanceText.y = 645;
  winText.y = 35;

  stage.addChild(uiShield, spinBtn.stage, lowBalanceText, winText, epicnessScore);

  lowBalanceText.visible = false;
  winText.visible = false;

  return {
    dispose: () => {
      opts.parent.removeChild(stage);
      stage.destroy({ children: true });
    },
    villain,
    spinBtn,
    showWinText: (txt: string, duration: number) => {
      winText.visible = true;
      winText.text = txt;
      centerX(opts.size.width, winText);
      setTimeout(() => {
        winText.visible = false;
      }, duration);
    },
    setEpicness: (value: number) => {
      epicnessScore.text = value.toString();
      centerX(opts.size.width, epicnessScore);
    },
    linesSelectorUI,
    betSelectorUI,
    hpBarUI,
    energyBarUI,
    scoresUI,
    lowBalanceText,
    reelsUI,
    boardBg,
  };
}

function attachController(ui: ReturnType<typeof createUI>, gd: GlobalDispatcher) {
  let hasFunds: boolean = true;
  let isSpinning: boolean = false;

  const setSpinning = (value: boolean) => {
    isSpinning = value;
    if (isSpinning) {
      ui.spinBtn.setStatus(FightStatus.Spinning);
    } else {
      ui.spinBtn.setStatus(hasFunds ? FightStatus.Ready : FightStatus.NeedTronium);
    }
  };
  const setHasFunds = (value: boolean) => {
    hasFunds = value;
    if (isSpinning) {
      ui.spinBtn.setStatus(FightStatus.Spinning);
    } else {
      ui.spinBtn.setStatus(hasFunds ? FightStatus.Ready : FightStatus.NeedTronium);
    }
  };

  const updateTronium = (tronium: number) => {
    ui.scoresUI.setTronium(tronium);
    ui.energyBarUI.updateValue(Math.min(100, tronium));
  };

  const spinLock = new Lock();
  const unregister = gd.registerForUIEvents({
    playerUpdated: (player: Player) => {
      ui.scoresUI.setTronium(player.tronium);
    },
    setAttackChoice: (attack: LineChoice) => {
      ui.linesSelectorUI.update(LineChoice.indexOf(attack));
      ui.boardBg.showLine(attack.value);
    },
    setBoostChoice: (boost: BoostChoice) => {
      ui.betSelectorUI.update(BoostChoice.indexOf(boost));
    },
    startSpinning: async (tronium: number) => {
      setSpinning(true);
      updateTronium(tronium);
      ui.reelsUI.startAnimation();
    },
    endSpinning: async result => {
      await spinLock.acquire();
      try {
        await ui.reelsUI.stopAnimation(result.result);

        if (result.result.featuredMove.winMsg) {
          ui.showWinText(result.result.featuredMove.winMsg.toUpperCase(), 3000);
        }

        ui.scoresUI.setFame(result.player.fame);
        updateTronium(result.player.tronium);
        ui.hpBarUI.updateValue(result.currentBattle.villain.hp);
        ui.setEpicness(result.currentBattle.epicness);

        if (result.currentBattle.status === BattleStatus.FINISHED) {
          await ui.villain.animateKill();
        }

        setSpinning(false);
      } finally {
        spinLock.release();
      }
    },
    resetBattle: async battle => {
      await spinLock.acquire();
      try {
        setSpinning(true);
        await ui.villain.createNew();
        ui.hpBarUI.reset(battle.villain.maxHp);
        setSpinning(false);
      } finally {
        spinLock.release();
      }
    },
    canBetWithCurrentBalance: setHasFunds,
  });

  return () => {
    unregister();
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
          .to({ alpha: 0 }, 2000)
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
        SoundManager.playVillainEntry(),
        new Promise(resolve => {
          t.onComplete(resolve);
        }),
      ]);
    },
  };
}

function ButtonBar(opts: { onClose: () => void; onHelp: () => void }) {
  const container = newContainer();

  const musicSprite = newAnimatedSprite('IcoMusicOn.png', 'IcoMusicOff.png');
  const volumeSprite = newAnimatedSprite('IcoVolumeOn.png', 'IcoVolumeOff.png');
  const howtoPlaySprite = bigIcon('IcoHowtoPlay');
  const closeSprite = bigIcon('IcoClose');

  postionAfterX(musicSprite, volumeSprite, 10);
  postionAfterX(volumeSprite, howtoPlaySprite, 10);
  postionAfterX(howtoPlaySprite, closeSprite, 10);

  container.addChild(musicSprite, volumeSprite, howtoPlaySprite, closeSprite);

  Button.from(howtoPlaySprite, opts.onHelp);
  Button.from(closeSprite, opts.onClose, { soundId: 'btnNegative' });
  ToggleButton.from(
    musicSprite,
    () => {
      SoundManager.toggleMusic();
    },
    SoundManager.musicOn
  );
  ToggleButton.from(
    volumeSprite,
    () => {
      SoundManager.toggleVolume();
    },
    SoundManager.volumeOn
  );
  return container;
}
