import { Container } from 'pixi.js';

export interface Position {
  x: number;
  y: number;
}

export interface Dimension {
  width: number;
  height: number;
}

export abstract class UIComponent {
  abstract readonly stage: Container;

  addTo(parent: Container) {
    parent.addChild(this.stage);
    return this;
  }
}
