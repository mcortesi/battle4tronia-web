import { extras, Rectangle, Sprite } from 'pixi.js';
import { UIComponent } from '../commons';
import SoundManager from '../SoundManager';

export interface ButtonOpts {
  onClick: () => void;
  sprite: Sprite | extras.AnimatedSprite;
  hitArea?: Rectangle;
  soundId: 'btnPositive' | 'btnNegative' | 'none';
}

export class Button extends UIComponent {
  static from(
    sprite: Sprite | extras.AnimatedSprite,
    onClick: () => void,
    other: { hitArea?: Rectangle; soundId?: 'btnPositive' | 'btnNegative' | 'none' } = {}
  ) {
    return new Button({
      ...other,
      sprite,
      onClick,
      soundId: other.soundId || 'btnPositive',
    });
  }

  readonly stage: Sprite | extras.AnimatedSprite;

  private constructor(readonly opts: ButtonOpts) {
    super();
    this.stage = opts.sprite;
    this.stage.buttonMode = true;
    this.stage.interactive = true;
    if (opts.hitArea) {
      this.stage.hitArea = opts.hitArea;
    }
    this.stage.on('click', () => {
      if (opts.soundId !== 'none') {
        SoundManager.play(opts.soundId);
      }
      opts.onClick();
    });
  }

  get disable() {
    return this.stage.buttonMode;
  }
  set disable(value: boolean) {
    if (this.stage instanceof extras.AnimatedSprite) {
      this.stage.gotoAndStop(value ? 1 : 0);
    } else {
      this.stage.alpha = value ? 0.6 : 1;
    }
    this.stage.buttonMode = !value;
    this.stage.interactive = !value;
  }
}

export interface ToggleButtonOpts {
  onClick: (value: boolean) => void;
  sprite: extras.AnimatedSprite;
  initialState: boolean;
}

export class ToggleButton extends UIComponent {
  static from(
    sprite: extras.AnimatedSprite,
    onClick: (value: boolean) => void,
    initialState: boolean
  ) {
    return new ToggleButton({
      onClick,
      sprite,
      initialState,
    });
  }

  readonly stage: extras.AnimatedSprite;
  private value: boolean;

  private constructor(readonly opts: ToggleButtonOpts) {
    super();
    this.stage = opts.sprite;
    this.stage.buttonMode = true;
    this.stage.interactive = true;

    this.value = opts.initialState;
    this.stage.gotoAndStop(this.value ? 0 : 1);

    this.stage.on('click', () => {
      this.value = !this.value;
      this.stage.gotoAndStop(this.value ? 0 : 1);
      SoundManager.play('btnPositive');
      opts.onClick(this.value);
    });
  }
}
