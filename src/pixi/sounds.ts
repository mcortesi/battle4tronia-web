import { Howl } from 'howler';

export class SoundManager {
  private howl: Howl;

  constructor() {
    this.howl = new Howl({
      src: ['/assets/sounds.mp3'], // 'assets/sounds.ogg'],
      sprite: {
        bet: [0, 370],
        spin: [370, 220],
        win_s1: [3940, 1200],
        win_s2: [590, 1400],
        win_s3: [5980, 1060],
        win_s4: [2110, 1630],
        win_royal: [7040, 720],
      },
    });
  }

  playBet() {
    this.howl.play('bet');
  }
  playSpin() {
    this.howl.play('spin');
  }
  playWin_s1() {
    this.howl.play('win_s1');
  }
  playWin_s2() {
    this.howl.play('win_s2');
  }
  playWin_s3() {
    this.howl.play('win_s3');
  }
  playWin_s4() {
    this.howl.play('win_s4');
  }
  playWin_royal() {
    this.howl.play('win_royal');
  }
}

export default new SoundManager();
