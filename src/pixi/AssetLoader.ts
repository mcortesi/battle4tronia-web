import { loader } from 'pixi.js';
import WebFont from 'webfontloader';
import { GlobalDispatcher } from './GlobalDispatcher';

const ResouceMap = {
  // backgrounds
  bgBattle: '/assets/bgBattle.jpg',
  bgCoatofarms: '/assets/bg-coatofarms.png',
  // icons
  icoArrow: '/assets/icoArrow.png',
  icoTronium: '/assets/icoTronium.png',
  icoFame: '/assets/icoFame.png',
  icoClose: '/assets/icoClose.png',
  icoHelp: '/assets/icoHelp.png',
  // buttons
  btnSpin: '/assets/btnSpin.png',
  btnConnect: '/assets/btnConnect.png',
  btnHowToPlay: '/assets/btnHowToPlay.png',
  btnToBattle: '/assets/btnToBattle.png',
  // characters
  hero: '/assets/hero_1.png',
  villain: '/assets/villain.png',
  // cards
  cardAttack1: '/assets/symbol-attack1.png',
  cardAttack2: '/assets/symbol-attack2.png',
  cardAttack3: '/assets/symbol-attack3.png',
  cardAttack4: '/assets/symbol-attack4.png',
  cardTrash1: '/assets/symbol-trash1.png',
  cardTrash2: '/assets/symbol-trash2.png',
  cardTrash3: '/assets/symbol-trash3.png',
  cardTrash4: '/assets/symbol-trash4.png',
  cardTrash5: '/assets/symbol-trash5.png',
  cardNegScatter: '/assets/symbol-negScatter.png',
  cardScatter: '/assets/symbol-scatter.png',
};

export class AssetLoader {
  private loadProgress = 0;
  private gd: GlobalDispatcher;

  constructor(gd: GlobalDispatcher) {
    this.gd = gd;
  }

  async loadAll() {
    await Promise.all([this.loadFonts(), this.loadLoadingStageResources()]);
    await this.loadOtherResources();
  }

  private loadFonts() {
    return new Promise((resolve, reject) => {
      WebFont.load({
        google: {
          families: ['Exo 2:400,900'],
        },
        active: () => {
          this.gd.fontsLoaded();
          this.progressDelta(5);
          resolve();
        },
        inactive: () => {
          reject(new Error('Font Loading Error'));
        },
      });
    });
  }

  private loadLoadingStageResources() {
    return new Promise((resolve, reject) => {
      loader.add('bgHome', '/assets/bgHome.jpg');
      loader.add('bgTitleText', '/assets/bgTitleText.png');
      loader.load(() => {
        this.progressDelta(5);
        this.gd.bgLoaded();
        resolve();
      });
    });
  }

  private loadOtherResources() {
    const resourceKeys = Object.keys(ResouceMap);
    const delta = Math.floor(90 / resourceKeys.length);
    // loader.reset();
    for (const key of resourceKeys) {
      loader.add(key, ResouceMap[key]);
    }
    loader.on('progress', () => {
      this.progressDelta(delta);
    });
    return new Promise(resolve => {
      loader.load(() => {
        this.progressDelta(100 - this.loadProgress);
        resolve();
      });
    });
  }

  private progressDelta(delta: number) {
    this.loadProgress += delta;
    this.gd.setLoadPercentage(this.loadProgress);
  }
}
