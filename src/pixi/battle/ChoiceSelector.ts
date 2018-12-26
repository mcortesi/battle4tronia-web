import { Container, Point, Text, Sprite } from 'pixi.js';
import { BoostChoice, LineChoice } from '../../model/base';
import { bigIcon, smallIcon } from '../basic';
import { Position } from '../commons';
import SoundManager from '../SoundManager';
import { newContainer, newSprite, newText, centerX, centerGroupX } from '../utils';
import { Button } from '../utils/Button';

export interface SelectorUI<T> {
  readonly choices: T[];
  readonly currentValue: T;
  view: Container;
  update: (x: number) => void;
}

interface Renderer<T> {
  update(value: T): void;
}

class BoostChoiceRenderer implements Renderer<BoostChoice> {
  label: Text;
  desc: Text;
  troniumIcon: Sprite;

  constructor(readonly parent: Container, readonly width: number) {
    const title = newText('Boost', 'Body1');
    this.label = newText('XXX', 'H2');
    this.desc = newText('XXX', 'H3');
    this.troniumIcon = smallIcon('IcoTronium');

    centerX(width, title);
    centerX(width, this.label);
    centerGroupX(width, 5, this.troniumIcon, this.desc);

    this.label.y = 30;
    this.desc.y = 70;
    this.troniumIcon.y = this.desc.y + (this.desc.height - this.troniumIcon.height) / 2;

    parent.addChild(title, this.label, this.desc, this.troniumIcon);
  }

  update(choice: BoostChoice) {
    this.label.text = choice.label;
    this.desc.text = choice.bet.toString();
    centerX(this.width, this.label);
    centerGroupX(this.width, 5, this.troniumIcon, this.desc);
  }
}

class LineChoiceRenderer implements Renderer<LineChoice> {
  label: Text;
  desc: Text;

  constructor(readonly parent: Container, width: number) {
    const title = newText('Attack', 'Body1');
    this.label = newText('XXX', 'H2');
    this.desc = newText('XXX', 'H3');

    title.anchor.set(0.5, 0);
    this.label.anchor.set(0.5, 0);
    this.desc.anchor.set(0.5, 0);
    title.x = this.label.x = this.desc.x = width / 2;

    this.label.y = 30;
    this.desc.position.y = 70;

    parent.addChild(title);
    parent.addChild(this.label);
    parent.addChild(this.desc);
  }

  update(choice: LineChoice) {
    this.label.text = choice.label;
    this.desc.text = 'x ' + choice.value.toString();
  }
}

abstract class ArrowSelector<T> implements SelectorUI<T> {
  readonly view: Container;
  idx: number;
  readonly choices: T[];
  private renderer: Renderer<T>;
  private prevBtn: Button;
  private nextBtn: Button;

  constructor(
    private readonly opts: Position & {
      parent: Container;
      textSpace: number;
      choices: T[];
      initValue: number;
      setValue: (x: number) => void;
    }
  ) {
    this.view = newContainer(opts.x, opts.y);
    opts.parent.addChild(this.view);

    this.idx = opts.initValue;
    this.choices = opts.choices;

    const leftArrowSprite = newSprite('IcoArrow.png', {
      position: new Point(0, 20),
      scale: new Point(-1, 1),
    });
    leftArrowSprite.x = leftArrowSprite.width;
    leftArrowSprite.scale.x = -1;

    this.prevBtn = Button.from(leftArrowSprite, this.prev);

    this.nextBtn = Button.from(
      bigIcon('IcoArrow', {
        position: new Point(this.prevBtn.stage.width + opts.textSpace, 20),
      }),
      this.next
    );

    const textContainer = newContainer(leftArrowSprite.x, 0);
    this.view.addChild(leftArrowSprite, textContainer, this.nextBtn.stage);

    this.renderer = this.createRenderer(textContainer, opts.textSpace);

    this.update(this.idx);
  }

  abstract createRenderer(parent: Container, width: number): Renderer<T>;

  get currentValue() {
    return this.choices[this.idx];
  }

  update = (idx: number) => {
    this.idx = idx;
    this.renderer.update(this.currentValue);
    this.prevBtn.disable = !this.hasPrev();
    this.nextBtn.disable = !this.hasNext();
  };

  next = () => {
    if (this.hasNext()) {
      SoundManager.playBet();
      this.opts.setValue(this.idx + 1);
    }
  };

  prev = () => {
    if (this.hasPrev()) {
      SoundManager.playBet();
      this.opts.setValue(this.idx - 1);
    }
  };

  private hasNext() {
    return this.idx + 1 < this.choices.length;
  }
  private hasPrev() {
    return this.idx - 1 >= 0;
  }
}

export class BoostSelector extends ArrowSelector<BoostChoice> {
  createRenderer(view: Container, width: number) {
    return new BoostChoiceRenderer(view, width);
  }
}

export class LinesSelector extends ArrowSelector<LineChoice> {
  createRenderer(view: Container, width: number) {
    return new LineChoiceRenderer(view, width);
  }
}
