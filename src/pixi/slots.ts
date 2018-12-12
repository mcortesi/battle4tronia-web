import { Container, Graphics } from 'pixi.js';
import { Position, newContainer } from './commons';
import { LineChoice } from './model';

export interface ReelsOptions extends Position {
  rows: number;
  columns: number;
  rowSeparation: number;
  cellWidth: number;
  cellHeight: number;
}

export class ReelsUI {
  stage: Container;
  rowGraphics: Graphics[];

  constructor(private readonly opts: ReelsOptions) {
    this.stage = newContainer(opts.x, opts.y);
    this.drawBackground();
  }

  public selectLines(lineChoice: LineChoice) {
    switch (lineChoice.value) {
      case 1:
        this.rowGraphics[0].tint = 0xffffff;
        this.rowGraphics[1].tint = 0xd8d8d8;
        this.rowGraphics[2].tint = 0xffffff;
        break;
      case 2:
        this.rowGraphics[0].tint = 0xd8d8d8;
        this.rowGraphics[1].tint = 0xffffff;
        this.rowGraphics[2].tint = 0xd8d8d8;
        break;
      case 3:
        this.rowGraphics[0].tint = 0xd8d8d8;
        this.rowGraphics[1].tint = 0xd8d8d8;
        this.rowGraphics[2].tint = 0xd8d8d8;
        break;
    }
  }

  private drawBackground() {
    const { rows, columns, cellHeight, cellWidth, rowSeparation } = this.opts;

    this.rowGraphics = [];
    for (let row = 0; row < rows; row++) {
      const rowG = new Graphics();
      rowG.beginFill(0xc7c7c7).lineStyle(1, 0x979797);
      this.rowGraphics.push(rowG);
      for (let col = 0; col < columns; col++) {
        rowG.drawRect(col * (cellWidth + rowSeparation), row * cellHeight, cellWidth, cellHeight);
        // const color = (col + rows * row) % 2 === 0 ? 0xc7c7c7 : 0xd8d8d8;
        // const s = createSlotCell(cellWidth, cellHeight, color);
        // s.position.set(col * (cellWidth + rowSeparation), row * cellHeight);
        // slotGroup.addChild(s);
      }
    }

    this.stage.addChild(...this.rowGraphics);
  }
}
export function createReels(opts: ReelsOptions) {
  const slotGroup = new Container();
  slotGroup.position.set(opts.x, opts.y);
  for (let row = 0; row < opts.rows; row++) {
    for (let col = 0; col < opts.columns; col++) {
      const color = (col + opts.rows * row) % 2 === 0 ? 0xc7c7c7 : 0xd8d8d8;
      const s = createSlotCell(opts.cellWidth, opts.cellHeight, color);
      s.position.set(col * (opts.cellWidth + opts.rowSeparation), row * opts.cellHeight);
      slotGroup.addChild(s);
    }
  }
  return slotGroup;
}

function createSlotCell(width: number, height: number, color: number) {
  // const filter = new PIXI.filters.BlurFilter();
  // filter.blur = 5;
  const bgRect = new PIXI.Graphics();
  bgRect
    .beginFill(color)
    .lineStyle(1, 0x979797)
    .drawRect(0, 0, width, height);
  // bgRect.alpha = 0.7;
  // bgRect.filters = [filter];
  return bgRect;
}
