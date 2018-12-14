import { Position, Dimension, UIComponent } from './commons';
import { Container, Graphics } from 'pixi.js';
import { newContainer } from './helpers';
import { Tween } from '@tweenjs/tween.js';

export interface BarOpts extends Position, Dimension {
  color: number;
  initValue: number;
  maxValue: number;
  leftToRight?: boolean;
}

export class Bar extends UIComponent {
  readonly stage: Container;
  outerBar: Graphics;
  readonly maxValue: number;

  constructor(private readonly opts: BarOpts) {
    super();
    this.maxValue = opts.maxValue;
    this.stage = newContainer(opts.x, opts.y);

    if (opts.leftToRight) {
      this.stage.scale.x = -1;
      this.stage.x += opts.width;
    }

    const bgBar = new Graphics();
    bgBar.lineStyle(1, 0xffffff);
    bgBar.drawRect(0, 0, opts.width, opts.height);

    this.outerBar = new Graphics();
    this.outerBar.beginFill(opts.color);
    this.outerBar.drawRect(0, 0, opts.width, opts.height);
    this.outerBar.endFill();

    this.stage.addChild(bgBar, this.outerBar);
    this.updateValue(opts.initValue);
  }

  updateValue(newValue: number) {
    const newWidth = (this.opts.width * newValue) / this.maxValue;
    new Tween(this.outerBar).to({ width: newWidth }, 300).start();
  }
}
