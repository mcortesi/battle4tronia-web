import { Container, Graphics, extras, filters, Texture } from 'pixi.js';
import { Position, newContainer, getTexture, rndInt, genArray, iter } from './commons';
import { LineChoice } from './model';
import * as Tween from '@tweenjs/tween.js';

const BG_SELECTED_COLOR = 0xd8d8d8;
const BG_COLOR = 0x979797;

const AnimatedSprite = extras.AnimatedSprite;

export interface ReelsOptions extends Position {
  rows: number;
  columns: number;
  colSeparation: number;
  cellWidth: number;
  cellHeight: number;
  symbolWidth: number;
  symbolHeight: number;
}

interface Reel {
  stage: Container;
  sprites: extras.AnimatedSprite[];
  blur: filters.BlurYFilter;
}

export class ReelsUI {
  stage: Container;
  rowGraphics: Graphics[];
  reels: Reel[];
  private symbolReg = new SymbolRegistry();
  private isSpinning = false;

  constructor(private readonly opts: ReelsOptions) {
    this.stage = newContainer(opts.x, opts.y);
    this.drawBackground();
    this.drawSymbols();
  }

  public selectLines(lineChoice: LineChoice) {
    switch (lineChoice.value) {
      case 1:
        this.rowGraphics[0].tint = BG_COLOR;
        this.rowGraphics[1].tint = BG_SELECTED_COLOR;
        this.rowGraphics[2].tint = BG_COLOR;
        break;
      case 2:
        this.rowGraphics[0].tint = BG_SELECTED_COLOR;
        this.rowGraphics[1].tint = BG_COLOR;
        this.rowGraphics[2].tint = BG_SELECTED_COLOR;
        break;
      case 3:
        this.rowGraphics[0].tint = BG_SELECTED_COLOR;
        this.rowGraphics[1].tint = BG_SELECTED_COLOR;
        this.rowGraphics[2].tint = BG_SELECTED_COLOR;
        break;
    }
  }

  public animateReels(onStop?: () => void) {
    if (this.isSpinning) {
      return;
    }

    const positionsToMove = rndInt(10, 20);
    const tweens = [
      this.createSingleReelAnimation(this.reels[0], positionsToMove, 2000),
      this.createSingleReelAnimation(this.reels[1], positionsToMove, 2200),
      this.createSingleReelAnimation(this.reels[2], positionsToMove, 2500),
      this.createSingleReelAnimation(this.reels[3], positionsToMove, 2700),
      this.createSingleReelAnimation(this.reels[4], positionsToMove, 2800),
    ];
    // const g = new Tween.Group();
    // tweens.forEach( t=> g.add(t));
    this.isSpinning = true;
    tweens[tweens.length - 1].onComplete(() => {
      this.isSpinning = false;
      if (onStop) {
        onStop();
      }
    });
    tweens.forEach(t => t.start());
  }

  private createSingleReelAnimation(reel: Reel, positionsToMove: number, time: number) {
    // const state = {
    //   const symbolQueue = genArray(positionsToMove, () => rndInt(0, 3));
    //   const MAX = (this.opts.rows + 1) * this.opts.cellHeight;
    //   const sprites = reel.sprites;
    //   const initialPositions = sprites.map(s => s.y);
    // }

    const symbolQueue = genArray(positionsToMove, () => rndInt(0, 3));
    const MAX = (this.opts.rows + 1) * this.opts.cellHeight;
    const sprites = reel.sprites;
    const initialPositions = sprites.map(s => s.y);

    let prev = 0;
    return new Tween.Tween({ pos: 0 })
      .to({ pos: positionsToMove * this.opts.cellHeight }, time)
      .onUpdate(({ pos }: { pos: number }) => {
        reel.blur.blur = (pos - prev) / 2;
        prev = pos;
        for (let i = 0; i < 4; i++) {
          const prevY = sprites[i].y;
          const newY = (initialPositions[i] + pos) % MAX;
          if (prevY > newY) {
            sprites[i].gotoAndStop(symbolQueue.pop()!);
            sprites[i].width = this.opts.symbolWidth;
            sprites[i].height = this.opts.symbolHeight;
          }
          sprites[i].y = newY;
        }
      })
      .easing(Tween.Easing.Cubic.Out);
  }

  private drawSymbols() {
    const { rows, columns, cellHeight, cellWidth, colSeparation } = this.opts;

    const leftMargin = (cellWidth - this.opts.symbolWidth) / 2;
    const topMargin = (cellHeight - this.opts.symbolHeight) / 2;

    this.reels = [];

    for (let col = 0; col < columns; col++) {
      // We create a container with (row+1) sprites
      // the extra sprite will be invisible and virtually positioned above the rest
      // that's why we have `-cellHeight` as position.y
      // and the mask is from 0 to visibleHeight
      const visibleHeight = rows * cellHeight;
      const stage = newContainer(leftMargin + col * (cellWidth + colSeparation), -cellHeight);
      const mask = new Graphics().drawRect(0, cellHeight, this.opts.symbolWidth, visibleHeight);
      stage.mask = mask;
      stage.addChild(mask);

      const blur = new filters.BlurYFilter();
      blur.blur = 0;

      const sprites = genArray(rows + 1, row => {
        // we use a sprite with all potential texture and then just change the frame to show with `gotoAndStop()`
        const s = new AnimatedSprite(this.symbolReg.allTextures());

        s.filters = [blur];

        s.gotoAndStop(this.symbolReg.randomIndex());
        // const s = new Sprite(nextSymbol());
        s.width = this.opts.symbolWidth;
        s.height = this.opts.symbolHeight;
        s.position.y = topMargin + row * cellHeight;
        return s;
      });

      this.stage.addChild(stage);
      stage.addChild(...sprites);

      this.reels.push({
        stage,
        sprites,
        blur,
      });
    }
  }

  private drawBackground() {
    const { rows, columns, cellHeight, cellWidth, colSeparation } = this.opts;

    this.rowGraphics = [];
    for (let row = 0; row < rows; row++) {
      const rowG = new Graphics();
      rowG.beginFill(0xffffff).lineStyle(1, 0x979797);
      this.rowGraphics.push(rowG);
      for (let col = 0; col < columns; col++) {
        rowG.drawRect(col * (cellWidth + colSeparation), row * cellHeight, cellWidth, cellHeight);
        // const color = (col + rows * row) % 2 === 0 ? 0xc7c7c7 : 0xd8d8d8;
        // const s = createSlotCell(cellWidth, cellHeight, color);
        // s.position.set(col * (cellWidth + rowSeparation), row * cellHeight);
        // slotGroup.addChild(s);
      }
    }

    this.stage.addChild(...this.rowGraphics);
  }
}

class SymbolRegistry {
  private SYMBOLS = ['symbol1', 'symbol2', 'symbol3'].map(getTexture);

  allTextures(): Texture[] {
    return this.SYMBOLS;
  }

  randomTexture(): Texture {
    return this.SYMBOLS[this.randomIndex()];
  }
  randomIndex(): number {
    return rndInt(0, this.SYMBOLS.length);
  }
  get(idx: number): Texture {
    return this.SYMBOLS[idx];
  }
}
