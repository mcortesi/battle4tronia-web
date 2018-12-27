import { Container, Texture } from 'pixi.js';
import { Dimension } from './commons';
import { centerX, centerY, newContainer, newSprite } from './utils';

interface ModalOpts {
  screenStage: Container;
  screenSize: Dimension;

  onClose: () => void;
}

export function Modal({ screenSize, screenStage, onClose }: ModalOpts) {
  const bodySize = {
    width: 512,
    height: 420,
  };
  const stage = newContainer();
  screenStage.addChild(stage);

  const darkShadow = newSprite(Texture.WHITE, { size: screenSize });
  darkShadow.name = 'Modal.BackShadow';
  darkShadow.tint = 0x000000;
  darkShadow.alpha = 0.5;
  darkShadow.interactive = true;
  darkShadow.defaultCursor = 'default';

  darkShadow.on('click', () => {
    screenStage.removeChild(stage);
    stage.destroy();
    onClose();
  });

  const bodyFrame = newSprite('UIModal.png');
  centerX(screenSize.width, bodyFrame);
  centerY(screenSize.height, bodyFrame);

  const body = newContainer(bodyFrame.x + 54, bodyFrame.y + 58);
  body.interactive = true;
  body.defaultCursor = 'default';

  stage.addChild(darkShadow, bodyFrame, body);
  return {
    stage,
    body,
    bodySize,

    destroy() {
      screenStage.removeChild(stage);
      stage.destroy();
    },
  };
}
