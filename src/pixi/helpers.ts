import { Container, Texture, Sprite, loader } from 'pixi.js';

export function newContainer(x = 0, y = 0) {
  const container = new Container();
  container.position.set(x, y);
  return container;
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
