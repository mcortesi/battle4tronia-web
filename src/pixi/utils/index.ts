import { Container, Point, Sprite, Text, Texture, utils, TextStyle } from 'pixi.js';
import { Dimension, Position } from '../commons';
import { TextStyles } from '../constants';

export function newContainer(x = 0, y = 0) {
  const container = new Container();
  container.position.set(x, y);
  return container;
}

export function getTexture(name: string): Texture {
  if (utils.TextureCache[name] == null) {
    throw new Error(`Texture with name ${name} is not loaded`);
  }
  return utils.TextureCache[name];
}

export interface LayoutOptions {
  position?: Position | Point;
  size?: Dimension;
  anchor?: Point;
  scale?: Point;
}

function applyLayoutOptions(
  obj: Text | Sprite,
  opts: { position?: Position | Point; size?: Dimension; anchor?: Point; scale?: Point } = {}
) {
  if (opts.position) {
    obj.position.set(opts.position.x, opts.position.y);
  }
  if (opts.size) {
    obj.width = opts.size.width;
    obj.height = opts.size.height;
  }
  if (opts.anchor) {
    obj.anchor.set(opts.anchor.x, opts.anchor.y);
  }
  if (opts.scale) {
    obj.scale.set(opts.scale.x, opts.scale.y);
  }
}

export function newSprite(
  texture: string | Texture,
  opts: { position?: Position | Point; size?: Dimension; anchor?: Point; scale?: Point } = {}
): Sprite {
  const s = new Sprite(typeof texture === 'string' ? getTexture(texture) : texture);
  applyLayoutOptions(s, opts);
  return s;
}

export function newText(
  txt: string,
  style: keyof typeof TextStyles | TextStyle,
  opts: { position?: Position | Point; anchor?: Point } = {}
) {
  const realStyle = typeof style === 'string' ? TextStyles[style] : style;
  const text = new Text(txt, realStyle);
  applyLayoutOptions(text, opts);
  if (window.devicePixelRatio === 2) {
    text.scale.set(0.5, 0.5);
  }

  return text;
}

export function centerX(parentWidth: number, sprite: Container) {
  sprite.x = (parentWidth - sprite.width) / 2;
}

export function centerY(parentHeight: number, sprite: Container) {
  sprite.y = (parentHeight - sprite.height) / 2;
}

export function centerGroupX(parentWidth: number, separation: number, ...sprite: Container[]) {
  let groupWidth = -separation;
  for (const s of sprite) {
    groupWidth += separation + s.width;
  }

  sprite[0].x = (parentWidth - groupWidth) / 2;

  for (let i = 1; i < sprite.length; i++) {
    sprite[i].x = sprite[i - 1].x + sprite[i - 1].width + separation;
  }
}

export function postionBeforeY(reference: Container, elem: Container, separation: number = 0) {
  elem.y = reference.y - elem.height - separation;
}

export function postionAfterY(before: Container, elem: Container, separation: number = 0) {
  elem.y = before.y + before.height + separation;
}
export function postionAfterX(before: Container, elem: Container, separation: number = 0) {
  elem.x = before.x + before.width + separation;
}

export function postionOnBottom(parentHeight: number, delta: number, elem: Container) {
  elem.y = parentHeight - delta - elem.height;
}

export function verticalAlignCenter(baseY: number, ...sprites: Container[]) {
  const maxHeight = Math.max(...sprites.map(s => s.height));

  for (const s of sprites) {
    s.y = baseY + (maxHeight - s.height) / 2;
  }
}
export function horizontalAlignCenter(baseX: number, ...sprites: Container[]) {
  const maxWidth = Math.max(...sprites.map(s => s.width));

  for (const s of sprites) {
    s.x = baseX + (maxWidth - s.width) / 2;
  }
}

export function distributeEvenlyX(parentWidth: number, ...sprites: Container[]) {
  const totalWidth = sprites.reduce((a, s) => a + s.width, 0);
  const separation = (parentWidth - totalWidth) / (sprites.length + 1);

  sprites[0].x = separation;

  for (let i = 1; i < sprites.length; i++) {
    sprites[i].x = sprites[i - 1].x + sprites[i - 1].width + separation;
  }
}
