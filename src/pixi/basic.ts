import { newSprite, LayoutOptions } from './utils';
import { Container, Point, Rectangle } from 'pixi.js';
import SoundManager from './SoundManager';
import { Button } from './utils/Button';
import { Layout } from './constants';

export type IconName = 'icoTronium' | 'icoFame' | 'icoClose' | 'icoHelp';

const PrimeryButtons = {
  fight: {
    image: 'btnSpin',
    shadowLength: 20,
    size: {
      width: 240,
      height: 140,
    },
    // width & height - shadow * 2.
    // x starts in -100 since anchor is 0.5
    hitArea: new Rectangle(-100, 20, 200, 100),
  },
  toBattle: {
    image: 'btnToBattle',
    shadowLength: 0,
    size: {
      width: 250,
      height: 100,
    },
    hitArea: new Rectangle(-125, 0, 250, 100),
  },
  connect: {
    image: 'btnConnect',
    shadowLength: 0,
    size: {
      width: 240,
      height: 100,
    },
    hitArea: new Rectangle(-125, 0, 250, 100),
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
  return newSprite(name, {
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
      Layout.screen.height - BottomMargin - spec.size.height + spec.shadowLength
    ),
  });

  const onClick = () => {
    SoundManager.playSpin();
    action();
  };

  const btn = Button.from(btnSprite, onClick, { hitArea: spec.hitArea });
  parent.addChild(btn.stage);
  return btn;
}
