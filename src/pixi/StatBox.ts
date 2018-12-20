import { Point } from 'pixi.js';
import { newContainer, newText } from './utils';

export function MainStatBox(opts: {
  position: Point;
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

  const maxWidth = Math.max(headerText.width, valueText.width, footerText.width);
  headerText.anchor.x = footerText.anchor.x = valueText.anchor.x = 0.5;
  headerText.position.x = footerText.position.x = valueText.position.x = maxWidth / 2;

  valueText.y = headerText.height + 3;
  footerText.y = valueText.y + valueText.height + 3;

  return stage;
}

export function SecondaryStatBox(opts: {
  position: Point;
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

  const maxWidth = Math.max(headerText.width, valueText.width, footerText.width);
  headerText.anchor.x = footerText.anchor.x = valueText.anchor.x = 0.5;
  headerText.position.x = footerText.position.x = valueText.position.x = maxWidth / 2;

  valueText.y = headerText.height + 3;
  footerText.y = valueText.y + valueText.height + 3;

  return stage;
}
