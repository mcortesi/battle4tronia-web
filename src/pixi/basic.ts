import { Container, Point } from 'pixi.js';
import { Dimension } from './commons';
import { Layout } from './constants';
import SoundManager from './SoundManager';
import { centerX, LayoutOptions, newAnimatedSprite, newSprite, postionOnBottom } from './utils';
import { Button } from './utils/Button';
import { FightStatus } from './BattleScreen';
import { Tween } from '@tweenjs/tween.js';

export type IconName = 'IcoTronium' | 'IcoShield' | 'IcoClose' | 'IcoHowtoPlay' | 'IcoArrow';

const PrimeryButtons = {
  connect: {
    image: 'BtnConnect.png',
    size: {
      width: 250,
      height: 100,
    },
  },
};

function icon(name: IconName, opts: Pick<LayoutOptions, 'anchor' | 'position'> = {}) {
  return newSprite(name + '.png', {
    ...opts,
  });
}

export function smallIcon(name: IconName, opts: Pick<LayoutOptions, 'anchor' | 'position'> = {}) {
  const i = icon(name, opts);
  i.width = 24;
  i.height = 24;
  return i;
}

export function bigIcon(name: IconName, opts: Pick<LayoutOptions, 'anchor' | 'position'> = {}) {
  return icon(name, opts);
}

export function primaryBtn(
  name: keyof typeof PrimeryButtons,
  action: () => void,
  parent: Container
) {
  const BottomMargin = 50;
  const spec = PrimeryButtons[name];
  const btnSprite = newSprite(spec.image, {
    anchor: new Point(0.5, 0),
    position: new Point(
      Layout.screen.width / 2,
      Layout.screen.height - BottomMargin - spec.size.height
    ),
  });

  const btn = Button.from(btnSprite, action);
  parent.addChild(btn.stage);
  return btn;
}

export function FightBtn(
  parentSize: Dimension,
  spinAction: () => void,
  buyTroniumAction: () => void
) {
  const BottomMargin = 50;
  const btnSprite = newAnimatedSprite('BtnFight.png', 'BtnSpin.png', 'BtnGetTronium.png');

  centerX(parentSize.width, btnSprite);
  postionOnBottom(parentSize.height, BottomMargin, btnSprite);

  btnSprite.buttonMode = true;
  btnSprite.interactive = true;

  let btnStatus: FightStatus = FightStatus.Ready;

  btnSprite.on('click', () => {
    SoundManager.play('btnPositive');
    switch (btnStatus) {
      case FightStatus.Ready:
        spinAction();
        break;
      case FightStatus.NeedTronium:
        buyTroniumAction();
        break;
    }
  });

  return {
    stage: btnSprite,
    setStatus: (st: FightStatus) => {
      btnStatus = st;
      if (btnStatus === FightStatus.Spinning) {
        btnSprite.interactive = false;
        btnSprite.gotoAndStop(1);
      } else {
        btnSprite.interactive = true;
        btnSprite.gotoAndStop(btnStatus === FightStatus.NeedTronium ? 2 : 0);
      }
    },
  };
}

export function ToBattleBtn(
  parentSize: Dimension,
  actionBattle: () => void,
  actionNotBattle: () => void
) {
  const BottomMargin = 50;
  const btnSprite = newAnimatedSprite('BtnToBattle.png', 'BtnGetTronium.png');

  centerX(parentSize.width, btnSprite);
  postionOnBottom(parentSize.height, BottomMargin, btnSprite);

  btnSprite.buttonMode = true;
  btnSprite.interactive = true;

  let canGotoBattle = true;
  btnSprite.on('click', () => {
    SoundManager.play('btnPositive');
    if (canGotoBattle) {
      actionBattle();
    } else {
      actionNotBattle();
    }
  });

  return {
    stage: btnSprite,
    setCanGoToBattle: (val: boolean) => {
      canGotoBattle = val;
      btnSprite.gotoAndStop(canGotoBattle ? 0 : 1);
    },
  };
}

export function HowtoPlayBtn(onClick: () => void) {
  const btn = newSprite('BtnHowtoPlay.png', { position: new Point(1202, 412) });
  return Button.from(btn, onClick);
}

export function WatchStoryBtn(onClick: () => void) {
  const btn = newSprite('BtnStory.png', { position: new Point(1067, 412) });
  return Button.from(btn, onClick);
}

export function Spinner() {
  const s = newSprite('IcoSpinner.png');
  s.visible = false;
  s.scale.set(0.3, 0.3);
  s.anchor.set(0.5, 0.5);
  const MAX = Math.PI * 2;
  const t = new Tween({ x: 1 }).to({ x: 5000 }, 1000000).onUpdate(val => {
    s.rotation = val.x % MAX;
  });

  return {
    stage: s,
    show: () => {
      s.visible = true;
      t.start();
    },
    dispose: () => {
      t.stop();
    },
  };
}
