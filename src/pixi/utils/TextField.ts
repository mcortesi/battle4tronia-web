import { Container, Graphics, Text } from 'pixi.js';
import { newContainer, newText, centerY, centerX } from '.';
import { Dimension } from '../commons';
import { __values } from 'tslib';
import { TextStyles } from '../constants';

interface TextFieldOptions {
  size: Dimension;
  maxLength: number;
}

export class TextField {
  stage: Container;
  private bg: Graphics;
  private text: Text;
  private domField: HTMLInputElement;

  constructor(readonly opts: TextFieldOptions) {
    this.stage = newContainer();

    this.bg = new Graphics()
      .beginFill(0xffffff)
      .drawRoundedRect(0, 0, opts.size.width, opts.size.height, 10)
      .endFill();
    // this.bg.cacheAsBitmap = true;
    this.bg.interactive = true;
    this.bg.tint = 0xcccccc;

    const style = TextStyles.Body1.clone();
    style.fill = 0x000000;
    this.text = newText('XXX', style);

    this.domField = document.createElement('input');
    this.domField.type = 'text';
    this.domField.style.position = 'absolute';
    this.domField.style.top = '0';
    this.domField.style.left = '0';
    this.domField.style.zIndex = '-1';
    document.body.appendChild(this.domField);

    centerY(opts.size.height, this.text);
    centerX(opts.size.width, this.text);
    this.text.text = '';

    this.stage.addChild(this.bg);
    this.stage.addChild(this.text);

    this.bg.on('click', () => {
      this.domField.focus();
    });
    this.domField.addEventListener('keydown', () => {
      this.text.text = this.domField.value;
      centerX(opts.size.width, this.text);
    });
    this.domField.addEventListener('keyup', () => {
      this.text.text = this.domField.value;
      centerX(opts.size.width, this.text);
    });
    this.domField.addEventListener('focus', () => {
      this.bg.tint = 0xffffff;
    });
    this.domField.addEventListener('blur', () => {
      this.bg.tint = 0xcccccc;
    });

    this.stage.on('removed', () => {
      this.domField.remove();
    });
  }

  get value() {
    return this.domField.value;
  }
}
