import { TextStyles } from '../constants';
import { UIComponent, Position } from '../commons';
import { newContainer, newSprite } from '../utils';
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
  private troniumIncrease: Text;
  private currentFame: number;
  private currentTronium: number;

  constructor(private readonly opts: ScoreBoxOpts) {
    super();
    this.stage = newContainer(opts.x, opts.y);

    this.currentFame = opts.initFame;
    this.currentTronium = opts.initTronium;
    this.troniumText = this.createScoreRender('Tronium', opts.initTronium, 'icoTronium', 0);
    this.fameText = this.createScoreRender('Fame', opts.initFame, 'icoFame', this.opts.fameY);

    this.troniumIncrease = new PIXI.Text('', TextStyles.H2);
    this.troniumIncrease.x = this.troniumText.x + this.troniumText.width + 30;
    this.troniumIncrease.tint = 0x00c03b;
    this.troniumIncrease.visible = false;
    this.stage.addChild(this.troniumIncrease);
  }

  setFame(newFame: number) {
    animateText(this.fameText, this.currentFame, newFame);

    this.currentFame = newFame;
  }

  setTronium(newTronium: number) {
    animateText(this.troniumText, this.currentTronium, newTronium);
    if (newTronium > this.currentTronium) {
      this.troniumIncrease.text = `+${newTronium - this.currentTronium}`;
      this.troniumIncrease.x = this.troniumText.x + this.troniumText.width + 30;
      animateIncrease(this.troniumIncrease);
    }

    this.currentTronium = newTronium;
  }

  private createScoreRender(labelText: string, value: number, texture: string, yPos: number) {
    const container = newContainer(0, yPos);
    const score = new PIXI.Text(value.toString(), TextStyles.H2);
    const label = new PIXI.Text(labelText, TextStyles.Body2);
    const icon = newSprite(texture);
    container.addChild(icon, score, label);

    score.position.set(this.opts.textX, 0);
    label.position.set(this.opts.textX, this.opts.labelY);

    this.stage.addChild(container);
    return score;
  }
}

function animateIncrease(label: Text) {
  label.alpha = 0;
  label.visible = true;
  const showAnimation = new Tween(label).to({ alpha: 1 }, 400);
  const hideAnimation = new Tween(label)
    .to({ alpha: 0 }, 400)
    .delay(800)
    .onComplete(() => {
      label.visible = false;
    });

  return showAnimation.chain(hideAnimation).start();
}
function animateText(label: Text, from: number, to: number) {
  return new Tween({ val: from })
    .to({ val: to }, 300)
    .onUpdate(x => {
      label.text = Math.floor(x.val).toString();
    })
    .easing(Easing.Cubic.InOut)
    .start();
}
