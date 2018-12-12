import { Container, loader, Text, Texture, Sprite } from 'pixi.js';
import { createButton, newContainer, Position } from './commons';
import { ThickFont, ThinFont } from './constants';
import { BoostChoice, LineChoice } from './model';

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
    const title = new Text('Boost', ThinFont);
    this.label = new Text('XXX', ThickFont);
    this.desc = new Text('XXX', ThinFont);
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
    this.desc.text = choice.value.toString();
  }
}

class LineChoiceRenderer implements Renderer<BoostChoice> {
  label: Text;
  desc: Text;

  constructor(readonly parent: Container) {
    const title = new Text('Attack', ThinFont);
    this.label = new Text('XXX', ThickFont);
    this.desc = new Text('XXX', ThinFont);

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

  update(choice: BoostChoice) {
    this.label.text = choice.label;
    this.desc.text = 'x ' + choice.value.toString();
  }
}

abstract class ArrowSelector<T> implements SelectorUI<T> {
  readonly view: Container;
  idx: number;
  readonly choices: T[];
  private renderer: Renderer<T>;

  constructor(
    opts: Position & {
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

    const leftArrow = createButton({
      x: 0,
      y: 20,
      texture: this.getTexture(),
      onClick: this.valueUpdater(opts.setValue, -1),
    });
    leftArrow.scale.x = -1;
    leftArrow.x = leftArrow.width;
    this.view.addChild(leftArrow);

    this.view.addChild(
      createButton({
        x: leftArrow.width + opts.textSpace,
        y: 20,
        texture: this.getTexture(),
        onClick: this.valueUpdater(opts.setValue, 1),
      })
    );

    this.renderer = this.createRenderer(this.view);
    this.renderer.update(this.currentValue);
  }

  abstract createRenderer(parent: Container): Renderer<T>;
  abstract getTexture(): Texture;

  get currentValue() {
    return this.choices[this.idx];
  }

  update = (idx: number) => {
    this.idx = idx;
    this.renderer.update(this.currentValue);
  };

  private valueUpdater = (setValue: (x: number) => void, delta: number) => {
    return () => {
      if (this.isValidValue(this.idx + delta)) {
        setValue(this.idx + delta);
      }
    };
  };

  private isValidValue(x: number) {
    return x >= 0 && x < this.choices.length;
  }
}

export class BoostSelector extends ArrowSelector<BoostChoice> {
  getTexture() {
    return loader.resources.energyArrow.texture;
  }
  createRenderer(view: Container) {
    return new BoostChoiceRenderer(this.view);
  }
}

export class LinesSelector extends ArrowSelector<LineChoice> {
  createRenderer(view: Container) {
    return new LineChoiceRenderer(this.view);
  }
  getTexture() {
    return loader.resources.linesArrow.texture;
  }
}
