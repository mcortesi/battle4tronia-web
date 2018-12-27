import * as Tween from '@tweenjs/tween.js';
import { Container, extras, filters, Graphics, loader } from 'pixi.js';
import { LineChoice } from '../../model/base';
import { BetResult, Card } from '../../model/reel';
import { genArray, transpose } from '../../utils';
import { Position, UIComponent } from '../commons';
import { newContainer } from '../utils';
import SoundManager from '../SoundManager';

const BG_SELECTED_COLOR = 0xd8d8d8;

const AnimatedSprite = extras.AnimatedSprite;

export interface ReelsOptions extends Position {
  rows: number;
  columns: number;
  colSeparation: number;
  cellWidth: number;
  cellHeight: number;
  cardWidth: number;
  cardHeight: number;
}

interface Reel {
  stage: Container;
  blur: filters.BlurYFilter;
  sprites: extras.AnimatedSprite[];
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
        this.rowGraphics[0].visible = false;
        this.rowGraphics[1].visible = true;
        this.rowGraphics[2].visible = false;
        break;
      case 2:
        this.rowGraphics[0].visible = true;
        this.rowGraphics[1].visible = false;
        this.rowGraphics[2].visible = true;
        break;
      case 3:
        this.rowGraphics[0].visible = true;
        this.rowGraphics[1].visible = true;
        this.rowGraphics[2].visible = true;
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
        for (let r = 0; r < betResult.reels.length; r++) {
          for (let c = 0; c < betResult.reels[r].length; c++) {
            const res = betResult.reels[r][c];
            const sp = this.reels[r].sprites[c + 1];
            if (res.active && sp.totalFrames > 1) {
              sp.play();
            }
          }
        }
      })
      .onComplete(() => {
        this.stage.removeChild(g);
        for (let r = 0; r < betResult.reels.length; r++) {
          for (let c = 0; c < betResult.reels[r].length; c++) {
            const sp = this.reels[r].sprites[c + 1];
            if (sp.totalFrames > 1) {
              sp.gotoAndStop(0);
            }
          }
        }
      });
  }

  public startAnimation() {
    const MAX = (this.opts.rows + 1) * this.opts.cellHeight;

    const animData = {
      y: 0,
      prev: 0,
      blurs: this.reels.map(r => r.blur),
    };
    this.currAnimation = new Tween.Tween(animData)
      .to({ y: this.opts.cellHeight * 60 }, 5000)
      .onStart(() => {
        SoundManager.startSpin();
      })
      .onUpdate((curr: typeof animData) => {
        const delta = curr.y - curr.prev;

        for (const reel of this.reels) {
          reel.blur.blur = delta / 2;
          for (let i = 0; i < reel.sprites.length; i++) {
            const o = reel.sprites[i];
            o.y += delta;
            if (o.y >= MAX) {
              this.replaceSprite(reel, i, Card.rnd());
              reel.sprites[i].y = reel.sprites[i].y % MAX;
            }
          }
        }
        curr.prev = curr.y;
      })
      .start();
  }

  public async stopAnimation(result: BetResult) {
    const lastColSymbols = result.reels.map(cps => cps.map(cp => cp.card));

    console.log(result.winnings);
    console.log(
      transpose(lastColSymbols)
        .map(cs => cs.map(c => c.id.replace('card', '')).join(' '))
        .join('\n')
    );

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

    if (result.reels.some(cps => cps.find(cp => cp.active) != null)) {
      tweens[tweens.length - 1].chain(this.animeWin(result));
    }

    tweens[0].onComplete(() => {
      SoundManager.stopSpin(700);
    });

    return new Promise(resolve => {
      tweens[tweens.length - 1].onComplete(() => {
        this.reels.forEach(r => {
          r.sprites.sort((a, b) => a.y - b.y);
        });
        SoundManager.play(result.sound);
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

    // space between the start of a cell and the start of a symbol
    const topMargin = (this.opts.cellHeight - this.opts.cardHeight) / 2;
    const sprites = reel.sprites;
    // the position within a "cell" the sprites are. If it's different than topMargin, it means we are in the 'middle' of a move.
    const currentDisplacement = sprites[0].y % this.opts.cellHeight;
    const delta = topMargin - currentDisplacement;
    // console.log(delta < 0 ? 'ANTES' : 'DESPUES', delta);
    const ytoMove = delta + this.opts.cellHeight * positionsToMove;

    const symbolQueue = [Card.rnd()].concat(
      endPositions,
      genArray(positionsToMove - endPositions.length - 1, () => Card.rnd())
    );
    const MAX = (this.opts.rows + 1) * this.opts.cellHeight;
    const initialPositions = sprites.map(s => s.y);

    let prev = 0;
    return (
      new Tween.Tween({ pos: 0 })
        .to({ pos: ytoMove }, time)
        .onUpdate(({ pos }: { pos: number }) => {
          reel.blur.blur = (pos - prev) / 2;
          prev = pos;
          for (let i = 0; i < 4; i++) {
            const prevY = sprites[i].y;
            const newY = (initialPositions[i] + pos) % MAX;
            if (prevY > newY) {
              this.replaceSprite(reel, i, symbolQueue.pop()!);
            }
            sprites[i].y = newY;
          }
        })
        // .onComplete(() => {
        //   console.log(symbolQueue);
        // })
        .easing(Tween.Easing.Cubic.Out)
    );
  }

  private drawSymbols() {
    const { rows, columns, cellHeight, cellWidth, colSeparation } = this.opts;

    const leftMargin = (cellWidth - this.opts.cardWidth) / 2;
    const topMargin = (cellHeight - this.opts.cardHeight) / 2;

    this.reels = [];

    for (let col = 0; col < columns; col++) {
      // We create a container with (row+1) sprites
      // the extra sprite will be invisible and virtually positioned above the rest
      // that's why we have `-cellHeight` as position.y
      // and the mask is from 0 to visibleHeight
      const visibleHeight = rows * cellHeight;
      const reelStage = newContainer(leftMargin + col * (cellWidth + colSeparation), -cellHeight);
      const mask = new Graphics().drawRect(0, cellHeight, this.opts.cardWidth, visibleHeight);
      reelStage.mask = mask;
      reelStage.addChild(mask);

      const blur = new filters.BlurYFilter();
      blur.blur = 0;

      const sprites = genArray(rows + 1, row => {
        // we use a sprite with all potential texture and then just change the frame to show with `gotoAndStop()`
        const s = getSpriteFor(Card.rnd());
        s.width = this.opts.cardWidth;
        s.height = this.opts.cardHeight;
        s.position.y = topMargin + row * cellHeight;
        s.filters = [blur];
        return s;
      });

      this.stage.addChild(reelStage);
      reelStage.addChild(...sprites);

      this.reels.push({
        stage: reelStage,
        sprites,
        blur,
      });
    }
  }

  private replaceSprite(reel: Reel, idx: number, card: Card) {
    const s = getSpriteFor(card);
    s.width = this.opts.cardWidth;
    s.height = this.opts.cardHeight;
    s.position.y = reel.sprites[idx].y;
    s.filters = [reel.blur];
    reel.stage.removeChild(reel.sprites[idx]);
    reel.sprites[idx] = s;
    reel.stage.addChild(reel.sprites[idx]);
  }

  private drawBackground() {
    const { rows, columns, cellHeight, cellWidth, colSeparation } = this.opts;

    this.rowGraphics = [];
    for (let row = 0; row < rows; row++) {
      const rowG = new Graphics();
      rowG.alpha = 0.1;
      rowG.beginFill(BG_SELECTED_COLOR);
      // rowG.beginFill(0xffffff).lineStyle(1, 0x979797);
      this.rowGraphics.push(rowG);
      for (let col = 0; col < columns; col++) {
        rowG.drawRect(
          col * (cellWidth + colSeparation),
          row * cellHeight,
          cellWidth + colSeparation,
          cellHeight
        );
        // const color = (col + rows * row) % 2 === 0 ? 0xc7c7c7 : 0xd8d8d8;
        // const s = createSlotCell(cellWidth, cellHeight, color);
        // s.position.set(col * (cellWidth + rowSeparation), row * cellHeight);
        // slotGroup.addChild(s);
      }
    }

    this.stage.addChild(...this.rowGraphics);
  }
}

function getSpriteFor(card: Card) {
  const spritesheet = loader.resources.cards.spritesheet!;
  if (card.canAnimate) {
    const textures = spritesheet.animations[`ico${card.id}`];
    if (textures == null || textures.length === 0) {
      throw new Error(`missing textures for ${card.idx}`);
    }
    const s = new AnimatedSprite(textures);
    s.animationSpeed = 1 / 6;
    return s;
  } else {
    const texture = spritesheet.textures[`ico${card.id}.png`];
    if (texture == null) {
      throw new Error(`missing textures for ${card.idx}`);
    }
    return new AnimatedSprite([texture]);
  }
}
