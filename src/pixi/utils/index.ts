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

export function centerX(parentWidth: number, sprite: Sprite) {
  sprite.x = (parentWidth - sprite.width) / 2;
}
export function centerGroupX(parentWidth: number, separation: number, ...sprite: Sprite[]) {
  let groupWidth = -separation;
  for (const s of sprite) {
    groupWidth += separation + s.width;
  }

  sprite[0].x = (parentWidth - groupWidth) / 2;

  for (let i = 1; i < sprite.length; i++) {
    sprite[i].x = sprite[i - 1].x + sprite[i - 1].width + separation;
  }
}

export function postionAfterY(before: Sprite, elem: Sprite, separtion: number = 0) {
  elem.y = before.y + before.height + separtion;
}
