import { Tween } from '@tweenjs/tween.js';
import { Container, Graphics, Text } from 'pixi.js';
import { Dimension, Position, UIComponent } from '../commons';
import { centerX, newContainer, newText, centerY } from '../utils';

export interface BarOpts extends Position, Dimension {
  color: number;
  initValue: number;
  maxValue: number;
  leftToRight?: boolean;
}

export class Bar extends UIComponent {
  readonly stage: Container;
  outerBar: Graphics;
  maxValue: number;
  label: Text;

  constructor(private readonly opts: BarOpts) {
    super();
    this.maxValue = opts.maxValue;
    this.stage = newContainer(opts.x, opts.y);

    // if (opts.leftToRight) {
    //   this.stage.scale.x = -1;
    //   this.stage.x += opts.width;
    // }

    const bgBar = new Graphics();
    bgBar.lineStyle(1, 0xffffff, 0.6);
    bgBar.drawRect(0, 0, opts.width, opts.height);

    const outerStage = newContainer();
    this.stage.addChild(outerStage);

    if (opts.leftToRight) {
      outerStage.scale.x = -1;
      outerStage.x += opts.width;
    }

    this.outerBar = new Graphics();
    this.outerBar.beginFill(opts.color);
    this.outerBar.drawRect(0, 0, opts.width, opts.height);
    this.outerBar.endFill();
    outerStage.addChild(this.outerBar);

    this.label = newText(opts.initValue.toString(), 'Body1');

    centerX(this.opts.width, this.label);
    centerY(this.opts.height, this.label);

    this.stage.addChild(bgBar, outerStage);
    this.stage.addChild(this.label);

    this.updateValue(opts.initValue);
  }

  updateValue(newValue: number) {
    const newWidth = (this.opts.width * newValue) / this.maxValue;
    this.label.text = newValue.toString();
    centerX(this.opts.width, this.label);
    new Tween(this.outerBar).to({ width: newWidth }, 300).start();
  }

  reset(max: number) {
    this.maxValue = max;
    this.outerBar.width = this.opts.width;
    this.label.text = max.toString();
    centerX(this.opts.width, this.label);
  }
}
