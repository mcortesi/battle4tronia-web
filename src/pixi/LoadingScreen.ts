import { Container, Text, Sprite, Texture } from 'pixi.js';
import { newContainer, newSprite, getTexture } from './helpers';
import { Dimension } from './commons';
import { TextStyles } from './constants';
import { GlobalDispatcher } from './actions';
import { Unloadable } from './main';

export class LoadingScreen implements Unloadable {
  stage: Container;
  parent: Container;
  unregister: () => void;

  bgSprite: Sprite;
  loadText: Text;

  constructor(opts: { size: Dimension; gd: GlobalDispatcher; parent: Container }) {
    this.stage = newContainer(0, 0);
    this.parent = opts.parent;
    this.parent.addChild(this.stage);

    this.loadText = new Text('0%', TextStyles.H1);
    this.loadText.anchor.set(0.5, 0.5);
    this.loadText.position.set(opts.size.width / 2, opts.size.height / 2);

    this.bgSprite = newSprite(Texture.WHITE);
    this.bgSprite.width = opts.size.width;
    this.bgSprite.height = opts.size.height;

    this.stage.addChild(this.bgSprite, this.loadText);

    this.unregister = opts.gd.registerForLoadScreen(this);
  }

  unload(): void {
    this.parent.removeChild(this.stage);
    this.stage.destroy({ children: true });
  }

  setLoadPercentage = (x: number) => {
    this.loadText.text = `${x}%`;
  };

  fontsLoaded = () => {
    this.loadText.dirty = true;
  };

  bgLoaded = () => {
    this.bgSprite.texture = getTexture('bgHome');
  };
}
