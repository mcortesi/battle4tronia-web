import { loader } from 'pixi.js';
import WebFont from 'webfontloader';
import { GlobalDispatcher } from './GlobalDispatcher';
import SoundManager from './SoundManager';

const ResouceMap = {
  // backgrounds
  bgBattle: '/assets/bgBattle.jpg',

  // sprites
  ui: '/assets/spriteUI.json',
  cards: '/assets/spriteCards.json',
  characters1: '/assets/characters1.json',
  characters2: '/assets/characters2.json',

  btnBuy: '/assets/btnBuy.png',
};

export class AssetLoader {
  private loadProgress = 0;
  private gd: GlobalDispatcher;

  constructor(gd: GlobalDispatcher) {
    this.gd = gd;
  }

  async loadAll() {
    await Promise.all([this.loadSounds(), this.loadFonts(), this.loadLoadingStageResources()]);
    await this.loadOtherResources();
  }

  private async loadSounds() {
    await SoundManager.load();
    this.progressDelta(30);
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
      loader.load(() => {
        this.progressDelta(5);
        this.gd.bgLoaded();
        resolve();
      });
    });
  }

  private loadOtherResources() {
    const resourceKeys = Object.keys(ResouceMap);
    const delta = Math.floor(60 / resourceKeys.length);
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
