import { Easing, Tween } from '@tweenjs/tween.js';
import { Container, Text } from 'pixi.js';
import { bigIcon, IconName } from '../basic';
import { Position, UIComponent } from '../commons';
import { TextStyles } from '../constants';
import { newContainer, newText, postionAfterX, postionAfterY } from '../utils';

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

  constructor(opts: ScoreBoxOpts) {
    super();
    this.stage = newContainer(opts.x, opts.y);

    this.currentFame = opts.initFame;
    this.currentTronium = opts.initTronium;

    const troniumScore = createScoreRender('Tronium', opts.initTronium, 'IcoTronium');
    const fameScore = createScoreRender('Fame', opts.initFame, 'IcoShield');

    postionAfterY(troniumScore.stage, fameScore.stage, 10);

    const st = TextStyles.H2.clone();
    st.dropShadow = true;
    this.troniumIncrease = newText('', st);

    this.troniumIncrease.tint = 0x2fe43f;
    this.troniumIncrease.visible = false;

    postionAfterX(troniumScore.stage, this.troniumIncrease, 20);

    this.troniumText = troniumScore.score;
    this.fameText = fameScore.score;
    this.stage.addChild(troniumScore.stage, fameScore.stage, this.troniumIncrease);
  }

  setFame(newFame: number) {
    animateText(this.fameText, this.currentFame, newFame);

    this.currentFame = newFame;
  }

  setTronium(newTronium: number) {
    animateText(this.troniumText, this.currentTronium, newTronium);
    if (newTronium > this.currentTronium) {
      this.troniumIncrease.text = `+${newTronium - this.currentTronium}`;
      const digitsDiff = newTronium.toString().length - this.currentTronium.toString().length;
      postionAfterX(this.troniumText, this.troniumIncrease, 20 + 8 * digitsDiff);
      animateIncrease(this.troniumIncrease);
    }

    this.currentTronium = newTronium;
  }
}

function createScoreRender(labelText: string, value: number, iconName: IconName) {
  const container = newContainer();
  const score = newText(value.toString(), 'H2');
  const label = newText(labelText, 'Body2');
  const icon = bigIcon(iconName);
  container.addChild(icon, score, label);

  postionAfterX(icon, score, 10);
  postionAfterX(icon, label, 10);
  postionAfterY(score, label, 5);

  return {
    score,
    stage: container,
  };
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
