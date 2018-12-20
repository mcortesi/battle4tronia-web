import { Container, Point, Sprite, Text, Texture, utils } from 'pixi.js';
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

export function newSprite(
  texture: string | Texture,
  opts: { position?: Position | Point; size?: Dimension; anchor?: Point } = {}
): Sprite {
  const s = new Sprite(typeof texture === 'string' ? getTexture(texture) : texture);
  if (opts.position) {
    s.position.set(opts.position.x, opts.position.y);
  }
  if (opts.size) {
    s.width = opts.size.width;
    s.height = opts.size.height;
  }
  if (opts.anchor) {
    s.anchor.set(opts.anchor.x, opts.anchor.y);
  }
  return s;
}

export function newText(txt: string, style: keyof typeof TextStyles) {
  const text = new Text(txt, TextStyles[style]);
  if (window.devicePixelRatio === 2) {
    text.scale.set(0.5, 0.5);
  }
  return text;
}
