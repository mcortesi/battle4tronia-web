import { Container, Texture, Point } from 'pixi.js';
import { Dimension } from './commons';
import { centerX, centerY, newContainer, newSprite } from './utils';

interface ModalOpts {
  screenStage: Container;
  screenSize: Dimension;
  scale?: Point;
}

export function Modal({ scale, screenSize, screenStage }: ModalOpts) {
  const bodySize = {
    width: 512 * (scale ? scale.x : 1),
    height: 420 * (scale ? scale.y : 1),
  };
  const padding = new Point(54 * (scale ? scale.x : 1), 58 * (scale ? scale.y : 1));

  const stage = newContainer();
  screenStage.addChild(stage);

  const darkShadow = newSprite(Texture.WHITE, { size: screenSize });
  darkShadow.name = 'Modal.BackShadow';
  darkShadow.tint = 0x000000;
  darkShadow.alpha = 0.5;
  darkShadow.interactive = true;
  darkShadow.defaultCursor = 'default';

  const bodyFrame = newSprite('UIModal.png');
  if (scale) {
    bodyFrame.scale.set(scale.x, scale.y);
  }

  centerX(screenSize.width, bodyFrame);
  centerY(screenSize.height, bodyFrame);

  const body = newContainer(bodyFrame.x + padding.x, bodyFrame.y + padding.y);
  body.interactive = true;
  body.defaultCursor = 'default';

  stage.addChild(darkShadow, bodyFrame, body);

  const dispose = () => {
    body.removeChildren();
    screenStage.removeChild(stage);
    stage.destroy();
    document.body.removeEventListener('keypress', dispose);
  };
  const escListener = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      console.log('ESC LOCO ');
      dispose();
    }
  };

  document.body.addEventListener('keydown', escListener);
  darkShadow.on('click', dispose);

  return {
    stage,
    body,
    bodySize,

    dispose,
  };
}
