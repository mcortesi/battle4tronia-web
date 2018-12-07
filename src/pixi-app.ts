import * as PIXI from 'pixi.js';

const Screen = {
  h: 768,
  w: 1366,
};

const ScoreBox = {
  h: 200,
  w: 200,
};
const HeroBox = {
  h: 500,
  w: 300,
};
const VillainBox = {
  h: 500,
  w: 300,
};

const Slot = {
  h: 120,
  w: 120,
};

const MessageBox = {
  h: 30,
  w: (Screen.w * 2) / 4,
};

const SlotRows = 3;
const SlotColums = 5;
const SlotsBox = {
  h: SlotRows * Slot.h + (SlotRows - 1) * 10,
  w: SlotColums * Slot.w + (SlotColums - 1) * 10,
};

export class BattleGround {
  private app: PIXI.Application;
  constructor() {
    this.app = new PIXI.Application({
      height: Screen.h,
      width: Screen.w,
      antialias: true,
      // transparent: true,
      // resolution: window.devicePixelRatio,
    });
    this.layoutScreen();
  }

  public start() {
    document.body.appendChild(this.app.view);
    this.app.start();
  }

  private layoutScreen() {
    // ScoreBox
    createBox(this.app.stage, {
      x: 0,
      y: 0,
      width: ScoreBox.w,
      height: ScoreBox.h,
    });

    // MessageBox
    createBox(this.app.stage, {
      x: Screen.w / 4,
      y: 20,
      width: MessageBox.w,
      height: MessageBox.h,
    });

    // SlotBox
    const slotGroup = drawSlots();
    slotGroup.x = (Screen.w - SlotsBox.w) / 2;
    slotGroup.y = Screen.h / 4;
    this.app.stage.addChild(slotGroup);
    // createBox(this.app.stage, {
    //   x: (Screen.w - SlotsBox.w) / 2,
    //   y: Screen.h / 4,
    //   width: SlotsBox.w,
    //   height: SlotsBox.h,
    // });

    // HeroBox
    createBox(this.app.stage, {
      x: 0,
      y: Screen.h - HeroBox.h,
      width: HeroBox.w,
      height: HeroBox.h,
    });

    // VillainBox
    createBox(this.app.stage, {
      x: Screen.w - VillainBox.w,
      y: Screen.h - VillainBox.h,
      width: VillainBox.w,
      height: VillainBox.h,
    });
  }
}

// @ts-ignore
function createBox(
  parent: PIXI.Container,
  opts: { x: number; y: number; width: number; height: number }
) {
  const box = new PIXI.Container();
  parent.addChild(box);

  box.x = opts.x;
  box.y = opts.y;

  const bg = bgRetangle(opts.width, opts.height);
  box.addChild(bg);
  return box;
}
function bgRetangle(width: number, height: number) {
  const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
  bg.width = width;
  bg.height = height;
  bg.alpha = 0.2;
  bg.tint = rndColor();
  return bg;
}

const rndColor = () => Math.floor(Math.random() * 0xffffff);

function drawSlots() {
  const slotGroup = new PIXI.Container();
  for (let row = 0; row < SlotRows; row++) {
    for (let col = 0; col < SlotColums; col++) {
      const s = drawSlot();
      s.x = col * (Slot.w + 10);
      s.y = row * (Slot.h + 10);
      slotGroup.addChild(s);
    }
  }
  return slotGroup;
}

function drawSlot() {
  const bgRect = new PIXI.Graphics();
  bgRect.beginFill(0xffffff);
  bgRect.drawRoundedRect(0, 0, Slot.w, Slot.h, 15);
  bgRect.alpha = 0.6;
  return bgRect;
  // stage.addChild(bgRect);
}
