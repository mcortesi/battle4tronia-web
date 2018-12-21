import { Container, loader, Point, Sprite, Text } from 'pixi.js';
import { BoostChoice, LineChoice } from '../../model/base';
import { bigIcon } from '../basic';
import { Position } from '../commons';
import SoundManager from '../SoundManager';
import { newContainer, newSprite, newText } from '../utils';
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

  constructor(readonly parent: Container) {
    const title = newText('Boost', 'Body1');
    this.label = newText('XXX', 'H2');
    this.desc = newText('XXX', 'H3');
    const troniumIcon = new Sprite(loader.resources.icoTronium.texture);
    troniumIcon.width = 24;
    troniumIcon.height = 24;

    title.anchor.set(0.5, 0);
    this.label.anchor.set(0.5, 0);
    this.desc.anchor.set(0.5, 0);
    troniumIcon.anchor.set(0.5, 0);
    title.x = this.label.x = parent.width / 2;
    this.label.y = 30;

    troniumIcon.position.set(-15 + parent.width / 2, 70);
    this.desc.position.set(12 + parent.width / 2, 73);

    parent.addChild(title);
    parent.addChild(this.label);
    parent.addChild(this.desc);
    parent.addChild(troniumIcon);
  }

  update(choice: BoostChoice) {
    this.label.text = choice.label;
    this.desc.text = choice.bet.toString();
  }
}

class LineChoiceRenderer implements Renderer<LineChoice> {
  label: Text;
  desc: Text;

  constructor(readonly parent: Container) {
    const title = newText('Attack', 'Body1');
    this.label = newText('XXX', 'H2');
    this.desc = newText('XXX', 'H3');

    title.anchor.set(0.5, 0);
    this.label.anchor.set(0.5, 0);
    this.desc.anchor.set(0.5, 0);
    title.x = this.label.x = this.desc.x = parent.width / 2;

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

    const leftArrowSprite = newSprite('icoArrow', {
      position: new Point(0, 20),
      scale: new Point(-1, 1),
    });
    (leftArrowSprite.x = leftArrowSprite.width), (leftArrowSprite.scale.x = -1);

    this.prevBtn = Button.from(leftArrowSprite, this.prev).addTo(this.view);

    this.nextBtn = Button.from(
      bigIcon('icoArrow', {
        position: new Point(this.prevBtn.stage.width + opts.textSpace, 20),
      }),
      this.next
    ).addTo(this.view);

    this.renderer = this.createRenderer(this.view);

    this.update(this.idx);
  }

  abstract createRenderer(parent: Container): Renderer<T>;

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
  createRenderer(view: Container) {
    return new BoostChoiceRenderer(this.view);
  }
}

export class LinesSelector extends ArrowSelector<LineChoice> {
  createRenderer(view: Container) {
    return new LineChoiceRenderer(this.view);
  }
}
