import { Howl } from 'howler';
import { rndElem, wait } from '../utils';

const Spec = {
  src: ['/assets/sounds.ogg', '/assets/sounds.m4a', '/assets/sounds.mp3', '/assets/sounds.ac3'],
  sprite: {
    battleEndA: [0, 6612.086167800453],
    battleEndB: [8000, 6806.575963718821],
    battleEndC: [16000, 6417.64172335601],
    'bg-battle2': [24000, 5511.0657596371875, true],
    btnNegative: [31000, 127.6190476190493],
    btnPositive: [33000, 234.64852607709474],
    'card-boomerang': [35000, 1944.7165532879822],
    'card-punch': [38000, 1555.804988662132],
    'card-scatter': [41000, 4472.902494331066],
    'card-scatterneg': [47000, 3500.521541950114],
    'card-sword': [52000, 3306.0544217687066],
    'card-trashA': [57000, 1750.2721088435394],
    'card-trashB': [60000, 1166.8480725623594],
    'card-trashC': [63000, 972.3809523809521],
    'card-trashD': [65000, 972.3582766439876],
    'card-trashE': [67000, 1361.3151927437598],
    'card-tronium': [70000, 3889.501133786851],
    taunt1: [75000, 1166.8480725623594],
    taunt10: [78000, 2722.630385487534],
    taunt11: [82000, 2333.6734693877615],
    taunt12: [86000, 2333.6734693877615],
    taunt13: [90000, 1750.2721088435324],
    taunt14: [93000, 1944.716553287975],
    taunt15: [96000, 2917.120181405892],
    taunt16: [100000, 3306.0544217687066],
    taunt17: [105000, 2139.206349206347],
    taunt18: [109000, 1750.2721088435324],
    taunt19: [112000, 2722.630385487534],
    taunt2: [116000, 2333.6734693877615],
    taunt3: [120000, 2333.6734693877615],
    taunt4: [124000, 1944.716553287975],
    taunt5: [127000, 2722.6303854875196],
    taunt6: [131000, 3111.564625850349],
    taunt7: [136000, 1166.8480725623454],
    taunt8: [139000, 2333.6734693877474],
    taunt9: [143000, 1555.8049886621177],
    villainEntry: [146000, 2528.1632653061197],
    'bg-battle': [150000, 57260.40816326531, true],
    'bg-home': [209000, 54595.91836734694, true],
    spin: [265000, 5250.6122448979795, true],
  },
};

export type SoundId = keyof typeof Spec['sprite'];

const Taunts: SoundId[] = [
  'taunt1',
  'taunt10',
  'taunt11',
  'taunt12',
  'taunt13',
  'taunt14',
  'taunt15',
  'taunt16',
  'taunt17',
  'taunt18',
  'taunt19',
  'taunt2',
  'taunt3',
  'taunt4',
  'taunt5',
  'taunt6',
  'taunt7',
  'taunt8',
  'taunt9',
];

export class SoundManager {
  private howl: Howl;
  private currentSpin: null | number = null;
  private homeSound: null | number = null;
  private battleSounds: null | number[] = null;
  private toStopOnFade: Set<number> = new Set();
  private endListeners: Map<number, () => void> = new Map();

  constructor() {
    this.howl = new Howl(Spec as any);
    this.howl.on('fade', id => {
      if (this.toStopOnFade.has(id)) {
        this.howl.stop(id);
        this.toStopOnFade.delete(id);
      }
    });

    this.howl.on('end', id => {
      if (this.endListeners.has(id)) {
        this.endListeners.get(id)!();
        this.endListeners.delete(id);
      }
    });
  }

  enterHome() {
    if (this.battleSounds) {
      this.battleSounds.forEach(s => this.howl.stop(s));
      this.battleSounds = null;
    }
    if (!this.homeSound) {
      this.homeSound = this.play('bg-home');
      this.howl.volume(0.1, this.homeSound);
    }
  }

  load() {
    return new Promise(resolve => {
      if (this.howl.state() === 'loaded') {
        resolve();
      } else {
        this.howl.once('load', resolve);
      }
    });
  }

  enterBattle() {
    if (this.homeSound) {
      this.howl.stop(this.homeSound);
      this.homeSound = null;
    }
    this.battleSounds = [this.play('bg-battle'), this.play('bg-battle2')];
    this.battleSounds.forEach(s => this.howl.volume(0.1, s));
  }

  startSpin() {
    this.currentSpin = this.play('spin');
  }

  stopSpin(duration: number) {
    if (this.currentSpin) {
      this.fadeAndStop(this.currentSpin, duration);
      this.currentSpin = null;
    }
  }
  // playSpin() {
  //   this.play('spin');
  // }

  playWin() {
    const winSounds: SoundId[] = ['battleEndA', 'battleEndB', 'battleEndC'];
    return this.playAndWait(rndElem(winSounds));
  }

  playTaunt() {
    return this.playAndWait(rndElem(Taunts));
  }

  play(id: SoundId) {
    return this.howl.play(id);
  }

  async playAndWait(id: SoundId) {
    const num = this.play(id);
    return new Promise(resolve => {
      this.endListeners.set(num, resolve);
    });
  }

  fadeAndStop(id: number, duration: number) {
    this.howl.fade(1, 0, duration, id);
    this.toStopOnFade.add(id);
  }
}

export default new SoundManager();
