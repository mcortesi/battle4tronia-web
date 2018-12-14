import { Container, Graphics } from 'pixi.js';
import { Layout } from './constants';

export function drawBorder(container: Container) {
  const g = new Graphics();
  g.lineStyle(1, 0x00ff00);
  g.drawRect(0, 0, container.width, container.height);
  // g.moveTo(container.width / 2, 0).lineTo(container.width / 2, container.height);
  container.addChild(g);
  console.log(container.width);
}

export function drawRules(horizontal: number[], vertical: number[]) {
  const line = new PIXI.Graphics();
  line.lineStyle(1, 0x0000ff);

  vertical.forEach(x => {
    line.moveTo(x, 0).lineTo(x, Layout.screen.h);
  });
  horizontal.forEach(y => {
    line.moveTo(0, y).lineTo(Layout.screen.w, y);
  });
  return line;
}
