import { Rectangle, Sprite, Texture } from 'pixi.js';
import { newSprite } from '.';
import { UIComponent } from '../commons';

export interface ButtonOpts {
  onClick: () => void;
  texture?: Texture | string;
  sprite?: Sprite;
  hitArea?: Rectangle;
}
export class Button extends UIComponent {
  static from(sprite: Sprite, onClick: () => void, other: { hitArea?: Rectangle } = {}) {
    return new Button({
      ...other,
      sprite,
      onClick,
    });
  }

  readonly stage: Sprite;

  private constructor(readonly opts: ButtonOpts) {
    super();
    if ((opts.texture && opts.sprite) || (opts.texture == null && opts.sprite == null)) {
      throw new Error('Button: define either texture or sprite');
    }
    this.stage = opts.texture ? newSprite(opts.texture) : opts.sprite!;
    this.stage.buttonMode = true;
    this.stage.interactive = true;
    if (opts.hitArea) {
      this.stage.hitArea = opts.hitArea;
    }
    this.stage.on('click', opts.onClick);
  }
  get disable() {
    return this.stage.buttonMode;
  }
  set disable(value: boolean) {
    this.stage.alpha = value ? 0.6 : 1;
    this.stage.buttonMode = !value;
    this.stage.interactive = !value;
  }
}
