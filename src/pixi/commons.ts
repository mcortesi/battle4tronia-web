import { Container, Sprite, Graphics, loader, Texture } from 'pixi.js';
import { openSync } from 'fs';

export interface Position {
  x: number;
  y: number;
}

export interface Dimension {
  width: number;
  height: number;
}

export interface ButtonOpts extends Position {
  onClick: () => void;
  texture?: Texture;
  sprite?: Sprite;
}
export class Button {
  readonly stage: Sprite;

  constructor(readonly opts: ButtonOpts) {
    if ((opts.texture && opts.sprite) || (opts.texture == null && opts.sprite == null)) {
      throw new Error('Button: define either texture or sprite');
    }

    this.stage = opts.texture ? new Sprite(opts.texture) : opts.sprite!;
    this.stage.position.set(opts.x, opts.y);
    this.stage.buttonMode = true;
    this.stage.interactive = true;
    this.stage.on('click', opts.onClick);
  }

  addTo(container: Container) {
    container.addChild(this.stage);
  }

  get disable() {
    return this.stage.buttonMode;
  }
  set disable(value: boolean) {
    console.log('setting disabled to ', value);
    this.stage.alpha = value ? 0.6 : 1;
    this.stage.buttonMode = !value;
    this.stage.interactive = !value;
  }
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
  // g.moveTo(container.width / 2, 0).lineTo(container.width / 2, container.height);
  container.addChild(g);
  console.log(container.width);
}

export function getTexture(name: string): Texture {
  if (loader.resources[name] == null) {
    throw new Error(`Texture with name ${name} is not loaded`);
  }
  return loader.resources[name].texture;
}

export function newSprite(texture: string | Texture): Sprite {
  return new Sprite(typeof texture === 'string' ? getTexture(texture) : texture);
}

/**
 * Random integer in interval [from,to] (inclusives)
 */
export function rndInt(from: number, to: number) {
  return from + Math.floor(Math.random() * (to - from));
}

export function genArray<A>(n: number, f: (i: number) => A): A[] {
  const res: A[] = [];
  for (let i = 0; i < n; i++) {
    res.push(f(i));
  }
  return res;
}

export function iter(n: number, f: (i: number) => void) {
  for (let i = 0; i < n; i++) {
    f(i);
  }
}
