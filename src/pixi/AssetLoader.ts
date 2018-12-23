import { loader } from 'pixi.js';
import WebFont from 'webfontloader';
import { GlobalDispatcher } from './GlobalDispatcher';

const ResouceMap = {
  // backgrounds
  bgBattle: '/assets/bgBattle.jpg',
  bgCoatofarms: '/assets/bg-coatofarms.png',

  // sprites
  ui: '/assets/spriteUI.json',
  cards: '/assets/spriteCards.json',

  // characters
  hero: '/assets/hero_1.png',
  villain: '/assets/villain.png',
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
