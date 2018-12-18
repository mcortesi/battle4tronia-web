import { TextStyles } from './constants';
import { UIComponent, Position } from './commons';
import { newContainer, newSprite } from './helpers';
import { Container, Text } from 'pixi.js';
import { Tween, Easing } from '@tweenjs/tween.js';

export interface ScoresUI {
  view: PIXI.Container;
  setFame: (x: number) => void;
  setTronium: (x: number) => void;
}

export interface ScoreBoxOpts extends Position {
  textX: number;
  labelY: number;
  fameY: number;
  initFame: number;
  initTronium: number;
}
export class ScoreBox extends UIComponent {
  readonly stage: Container;
  private troniumText: Text;
  private fameText: Text;

  constructor(private readonly opts: ScoreBoxOpts) {
    super();
    this.stage = newContainer(opts.x, opts.y);

    this.troniumText = this.renderScore('Tronium', opts.initTronium, 'icoTronium', 0);
    this.fameText = this.renderScore('Fame', opts.initFame, 'icoFame', this.opts.fameY);
  }

  setFame(newFame: number) {
    new Tween({ val: parseInt(this.fameText.text, 10) })
      .to({ val: newFame }, 300)
      .onUpdate(x => {
        this.fameText.text = Math.floor(x.val).toString();
      })
      .easing(Easing.Cubic.InOut)
      .start();
  }

  setTronium(newTronium: number) {
    new Tween({ val: parseInt(this.troniumText.text, 10) })
      .to({ val: newTronium }, 300)
      .onUpdate(x => {
        this.troniumText.text = Math.floor(x.val).toString();
      })
      .easing(Easing.Cubic.InOut)
      .start();
  }

  private renderScore(labelText: string, value: number, texture: string, yPos: number) {
    const container = newContainer(0, yPos);
    const score = new PIXI.Text(value.toString(), TextStyles.H2);
    const label = new PIXI.Text(labelText, TextStyles.Body2);
    const icon = newSprite(texture);
    container.addChild(icon);
    container.addChild(score);
    container.addChild(label);

    // icon.scale.set(0.75, 0.75);
    score.position.set(this.opts.textX, 0);
    label.position.set(this.opts.textX, this.opts.labelY);

    this.stage.addChild(container);
    return score;
  }
}
