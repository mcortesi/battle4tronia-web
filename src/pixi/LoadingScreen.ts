import { Container, Point, Text, Texture } from 'pixi.js';
import { Dimension } from './commons';
import { TextStyles } from './constants';
import { GlobalDispatcher } from './GlobalDispatcher';
import { Disposable } from './MainUI';
import { getTexture, newContainer, newSprite } from './utils';

export interface LoadingScreenProps {
  size: Dimension;
  gd: GlobalDispatcher;
  parent: Container;
}

export function LoadingScreen({ size, parent, gd }: LoadingScreenProps): Disposable {
  const stage = newContainer(0, 0);
  parent.addChild(stage);

  const loadText = new Text('0%', TextStyles.H1);
  loadText.anchor.set(0.5, 0.5);
  loadText.position.set(size.width / 2, size.height / 2);

  const bgSprite = newSprite(Texture.EMPTY, { size });

  stage.addChild(bgSprite, loadText);

  const unregister = gd.registerForLoadScreen({
    setLoadPercentage: (x: number) => {
      loadText.text = `${x}%`;
    },

    fontsLoaded: () => {
      loadText.dirty = true;
    },

    bgLoaded: () => {
      bgSprite.texture = getTexture('bgHome');
      stage.addChild(
        newSprite('imgTitle', {
          position: new Point(size.width / 2, 50),
          anchor: new Point(0.5, 0),
        })
      );
    },
  });

  return {
    dispose: () => {
      unregister();
      parent.removeChild(stage);
      stage.destroy({ children: true });
    },
  };
}
