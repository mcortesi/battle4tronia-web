import { Container, Sprite, Graphics } from 'pixi.js';

export interface Position {
  x: number;
  y: number;
}

export interface Dimension {
  width: number;
  height: number;
}

export function createButton(opts: Position & { onClick: () => void; texture: PIXI.Texture }) {
  const btn = new Sprite(opts.texture);
  btn.position.set(opts.x, opts.y);
  btn.buttonMode = true;
  btn.interactive = true;
  btn.on('click', opts.onClick);
  return btn;
}

export function newContainer(x = 0, y = 0) {
  const container = new Container();
  container.position.set(x, y);
  return container;
}

export function drawBorder(container: Container) {
  const g = new Graphics();
  g.lineStyle(1, 0x00ff00);
  g.drawRect(0, 0, container.width, container.height);
  g.moveTo(container.width / 2, 0).lineTo(container.width / 2, container.height);
  container.addChild(g);
  console.log(container.width);
}
