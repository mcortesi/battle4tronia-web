import * as Tween from '@tweenjs/tween.js';
import { Container, extras, filters, Graphics } from 'pixi.js';
import { LineChoice } from '../../model/base';
import { BetResult, Card } from '../../model/reel';
import { genArray } from '../../utils';
import { Position, UIComponent } from '../commons';
import { getTexture, newContainer } from '../utils';

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

export class ReelsUI extends UIComponent {
  stage: Container;
  rowGraphics: Graphics[];
  reels: Reel[];
  private currAnimation: Tween.Tween | null = null;

  constructor(private readonly opts: ReelsOptions) {
    super();
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

  animeWin(betResult: BetResult) {
    const blur = new filters.BlurFilter();
    blur.blur = 8;

    const g = new Graphics();
    g.lineStyle(10, 0xff0000);
    for (let r = 0; r < betResult.rowWinStatus.length; r++) {
      if (betResult.rowWinStatus[r]) {
        g.drawRect(
          0,
          r * this.opts.cellHeight,
          this.opts.columns * (this.opts.cellWidth + this.opts.colSeparation) -
            this.opts.colSeparation,
          this.opts.cellHeight
        );
      }
    }
    g.filters = [blur];

    return new Tween.Tween(g)
      .to({ alpha: 0 }, 600)
      .yoyo(true)
      .repeat(3)
      .onStart(() => {
        this.stage.addChild(g);
      })
      .onComplete(() => {
        this.stage.removeChild(g);
      });
  }

  public startAnimation() {
    const MAX = (this.opts.rows + 1) * this.opts.cellHeight;

    const animData = {
      y: 0,
      prev: 0,
      blurs: this.reels.map(r => r.blur),
      sprites: this.reels.map(r => r.sprites).reduce((acc, ss) => acc.concat(ss), []),
    };
    this.currAnimation = new Tween.Tween(animData)
      .to({ y: this.opts.cellHeight * 60 }, 5000)
      .onUpdate((curr: typeof animData) => {
        const delta = curr.y - curr.prev;
        for (const blur of curr.blurs) {
          blur.blur = delta / 2;
        }
        for (const o of curr.sprites) {
          o.y += delta;
          if (o.y >= MAX) {
            o.gotoAndStop(Card.rnd().idx);
            o.width = this.opts.symbolWidth;
            o.height = this.opts.symbolHeight;
            o.y = o.y % MAX;
          }
        }
        curr.prev = curr.y;
      })
      .start();
  }

  public async stopAnimation(result: BetResult) {
    const lastColSymbols = result.reels;

    const positionsToMove = 5;
    const baseTime = 800;
    const tweens = [
      this.createSingleReelAnimation(this.reels[0], lastColSymbols[0], positionsToMove, baseTime),
      this.createSingleReelAnimation(
        this.reels[1],
        lastColSymbols[1],
        positionsToMove,
        baseTime + 200
      ),
      this.createSingleReelAnimation(
        this.reels[2],
        lastColSymbols[2],
        positionsToMove,
        baseTime + 400
      ),
      this.createSingleReelAnimation(
        this.reels[3],
        lastColSymbols[3],
        positionsToMove,
        baseTime + 600
      ),
      this.createSingleReelAnimation(
        this.reels[4],
        lastColSymbols[4],
        positionsToMove,
        baseTime + 700
      ),
    ];
    // const g = new Tween.Group();
    // tweens.forEach( t=> g.add(t));

    if (result.rowWinStatus.some(x => x)) {
      tweens[tweens.length - 1].chain(this.animeWin(result));
    }

    return new Promise(resolve => {
      tweens[tweens.length - 1].onComplete(() => {
        resolve();
      });
      this.currAnimation!.stop();
      tweens.forEach(t => t.start());
    });
  }

  private createSingleReelAnimation(
    reel: Reel,
    endPositions: Card[],
    positionsToMove: number,
    time: number
  ) {
    // const state = {
    //   const symbolQueue = genArray(positionsToMove, () => rndInt(0, 3));
    //   const MAX = (this.opts.rows + 1) * this.opts.cellHeight;
    //   const sprites = reel.sprites;
    //   const initialPositions = sprites.map(s => s.y);
    // }

    const topMargin = (this.opts.cellHeight - this.opts.symbolHeight) / 2;
    const sprites = reel.sprites;
    // the position within a "cell" the sprites are. If it's different than topMargin, it means we are in the 'middle' of a move.
    const currentDisplacement = sprites[0].y % this.opts.cellHeight;
    const ytoMove =
      currentDisplacement < topMargin
        ? topMargin - currentDisplacement + (positionsToMove - 1) * this.opts.cellHeight
        : topMargin - currentDisplacement + positionsToMove * this.opts.cellHeight;

    const symbolQueue = [Card.rnd()].concat(
      endPositions,
      genArray(positionsToMove - endPositions.length - 1, () => Card.rnd())
    );
    const MAX = (this.opts.rows + 1) * this.opts.cellHeight;
    const initialPositions = sprites.map(s => s.y);

    let prev = 0;
    return new Tween.Tween({ pos: 0 })
      .to({ pos: ytoMove }, time)
      .onUpdate(({ pos }: { pos: number }) => {
        reel.blur.blur = (pos - prev) / 2;
        prev = pos;
        for (let i = 0; i < 4; i++) {
          const prevY = sprites[i].y;
          const newY = (initialPositions[i] + pos) % MAX;
          if (prevY > newY) {
            sprites[i].gotoAndStop(symbolQueue.pop()!.idx);
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
        const s = new AnimatedSprite(Card.ALL.map(ss => getTexture(ss.id)));

        s.filters = [blur];

        s.gotoAndStop(Card.rnd().idx);
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
