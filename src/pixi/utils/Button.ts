import { Rectangle, Sprite, Texture } from 'pixi.js';
import { newSprite } from '.';
import { UIComponent } from '../commons';
import SoundManager from '../SoundManager';

export interface ButtonOpts {
  onClick: () => void;
  texture?: Texture | string;
  sprite?: Sprite;
  hitArea?: Rectangle;
  soundId: 'btnPositive' | 'btnNegative';
}

export class Button extends UIComponent {
  static from(
    sprite: Sprite,
    onClick: () => void,
    other: { hitArea?: Rectangle; soundId?: 'btnPositive' | 'btnNegative' } = {}
  ) {
    return new Button({
      ...other,
      sprite,
      onClick,
      soundId: other.soundId || 'btnPositive',
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
    this.stage.on('click', () => {
      SoundManager.play(opts.soundId);
      opts.onClick();
    });
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
