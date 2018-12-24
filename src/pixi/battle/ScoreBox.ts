import { Easing, Tween } from '@tweenjs/tween.js';
import { Container, Text } from 'pixi.js';
import { bigIcon, IconName } from '../basic';
import { Position, UIComponent } from '../commons';
import { newContainer, newText } from '../utils';
import { TextStyles } from '../constants';

export interface ScoresUI {
  view: Container;
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
    this.troniumText = this.createScoreRender('Tronium', opts.initTronium, 'IcoTronium', 0);
    this.fameText = this.createScoreRender('Fame', opts.initFame, 'IcoFame', this.opts.fameY);

    const st = TextStyles.H2.clone();
    st.dropShadow = true;
    this.troniumIncrease = newText('', st);

    this.troniumIncrease.x = this.troniumText.x + this.troniumText.width + 30;
    this.troniumIncrease.tint = 0x2fe43f;
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

  private createScoreRender(labelText: string, value: number, iconName: IconName, yPos: number) {
    const container = newContainer(0, yPos);
    const score = newText(value.toString(), 'H2');
    const label = newText(labelText, 'Body2');
    const icon = bigIcon(iconName);
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
