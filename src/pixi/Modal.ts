import { Container, Graphics, Texture } from 'pixi.js';
import { Dimension } from './commons';
import { newContainer, newSprite } from './utils';

interface ModalOpts {
  screenStage: Container;
  screenSize: Dimension;
  size: Dimension;
  onClose: () => void;
}

export function Modal({ screenSize, size, screenStage, onClose }: ModalOpts) {
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
  stage.addChild(darkShadow);

  const body = newContainer(
    (screenSize.width - size.width) / 2,
    (screenSize.height - size.height) / 2
  );
  body.interactive = true;
  body.defaultCursor = 'default';

  const bodyBG = new Graphics()
    .beginFill(0xf3f3f3)
    .drawRoundedRect(0, 0, size.width, size.height, 5)
    .endFill();
  // body.tint = 0x00000;

  body.addChild(bodyBG);

  // const body = newSprite(Texture.WHITE, {
  //   anchor: new Point(0.5, 0.5),
  //   position: new Point(screenSize.width / 2, screenSize.height / 2),
  //   size,
  // });

  stage.addChild(body);

  return {
    stage,
    body,

    destroy() {
      screenStage.removeChild(stage);
      stage.destroy();
    },
  };
}
