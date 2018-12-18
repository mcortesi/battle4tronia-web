import { Button } from '../utils/Button';
import { Container, Rectangle } from 'pixi.js';
import SoundManager from '../SoundManager';
import { newSprite } from '../utils';

export function SpinBtn(opts: { parent: Container; onClick: () => void }) {
  const spinSprite = newSprite('btnSpin');
  spinSprite.anchor.set(0.5, 0);
  const btn = new Button({
    x: opts.parent.width / 2,
    y: 520,
    hitArea: new Rectangle(-103, 7, 207, 115),
    sprite: spinSprite,
    onClick: () => {
      SoundManager.playSpin();
      opts.onClick();
    },
  });
  opts.parent.addChild(btn.stage);
  return btn;
}
