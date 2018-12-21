import { Point } from 'pixi.js';
import { newContainer, newText } from './utils';

export function MainStatBox(opts: {
  position: Point;
  width?: number;
  header: string;
  value: string;
  footer: string;
}) {
  const stage = newContainer(opts.position.x, opts.position.y);
  stage.name = 'MainStatBox';
  const headerText = newText(opts.header, 'Body2');
  const footerText = newText(opts.footer, 'Body2');
  const valueText = newText(opts.value, 'H1');
  stage.addChild(headerText, footerText, valueText);

  valueText.y = headerText.height + 3;
  footerText.y = valueText.y + valueText.height + 3;
  headerText.anchor.x = footerText.anchor.x = valueText.anchor.x = 0.5;

  const centerX = () => {
    const maxWidth = Math.max(headerText.width, valueText.width, footerText.width);
    headerText.position.x = footerText.position.x = valueText.position.x =
      (opts.width || maxWidth) / 2;
  };
  centerX();

  const setValue = (txt: string) => {
    valueText.text = txt;
    centerX();
  };

  return {
    stage,
    setValue,
  };
}

export function SecondaryStatBox(opts: {
  position: Point;
  width?: number;
  header: string;
  value: string;
}) {
  const stage = newContainer(opts.position.x, opts.position.y);
  stage.name = 'SecondaryStatBox';

  const headerText = newText(opts.header, 'Body2');

  const valueText = newText(opts.value, 'H1');
  stage.addChild(headerText, valueText);
  valueText.y = headerText.height + 3;
  headerText.anchor.x = valueText.anchor.x = 0.5;

  const centerX = () => {
    const maxWidth = Math.max(headerText.width, valueText.width);
    headerText.position.x = valueText.position.x = (opts.width || maxWidth) / 2;
  };
  centerX();

  const setValue = (txt: string) => {
    valueText.text = txt;
    centerX();
  };

  return {
    stage,
    setValue,
  };
}
