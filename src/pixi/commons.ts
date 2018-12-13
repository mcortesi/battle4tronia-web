import { Container, Graphics, loader, Rectangle, Sprite, Texture } from 'pixi.js';

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
  texture?: Texture | string;
  sprite?: Sprite;
  hitArea?: Rectangle;
}
export class Button {
  readonly stage: Sprite;

  constructor(readonly opts: ButtonOpts) {
    if ((opts.texture && opts.sprite) || (opts.texture == null && opts.sprite == null)) {
      throw new Error('Button: define either texture or sprite');
    }

    this.stage = opts.texture ? newSprite(opts.texture) : opts.sprite!;
    this.stage.position.set(opts.x, opts.y);
    this.stage.buttonMode = true;
    this.stage.interactive = true;
    if (opts.hitArea) {
      this.stage.hitArea = opts.hitArea;
    }
    this.stage.on('click', opts.onClick);
  }

  addTo(container: Container) {
    container.addChild(this.stage);
    return this;
  }

  get disable() {
    return this.stage.buttonMode;
  }
  set disable(value: boolean) {
    this.stage.alpha = value ? 0.6 : 1;
    this.stage.buttonMode = !value;
    this.stage.interactive = !value;
  }
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
