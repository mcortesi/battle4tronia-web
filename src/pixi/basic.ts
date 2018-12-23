import { Container, Point } from 'pixi.js';
import { Layout } from './constants';
import SoundManager from './SoundManager';
import { LayoutOptions, newSprite } from './utils';
import { Button } from './utils/Button';

export type IconName = 'IcoTronium' | 'IcoFame' | 'IcoClose' | 'IcoHowtoPlay' | 'IcoArrow';

const PrimeryButtons = {
  fight: {
    image: 'BtnFight.png',
    size: {
      width: 200,
      height: 100,
    },
    // width & height - shadow * 2.
    // x starts in -100 since anchor is 0.5
    // hitArea: new Rectangle(-100, 20, 200, 100),
  },
  toBattle: {
    image: 'BtnToBattle.png',
    shadowLength: 0,
    size: {
      width: 250,
      height: 100,
    },
    // hitArea: new Rectangle(-125, 0, 250, 100),
  },
  connect: {
    image: 'BtnConnect.png',
    shadowLength: 0,
    size: {
      width: 250,
      height: 100,
    },
    // hitArea: new Rectangle(-125, 0, 250, 100),
  },
};

const IconType = {
  small: { width: 24, height: 24 },
  big: { width: 55, height: 55 },
};

function icon(
  name: IconName,
  type: keyof typeof IconType,
  opts: Pick<LayoutOptions, 'anchor' | 'position'> = {}
) {
  return newSprite(name + '.png', {
    ...opts,
    size: IconType[type],
  });
}

export function smallIcon(name: IconName, opts: Pick<LayoutOptions, 'anchor' | 'position'> = {}) {
  return icon(name, 'small', opts);
}

export function bigIcon(name: IconName, opts: Pick<LayoutOptions, 'anchor' | 'position'> = {}) {
  return icon(name, 'big', opts);
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

  const onClick = () => {
    SoundManager.playSpin();
    action();
  };

  const btn = Button.from(btnSprite, onClick);
  parent.addChild(btn.stage);
  return btn;
}
