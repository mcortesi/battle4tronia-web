import { Container, Graphics } from 'pixi.js';
import { Dimension } from './commons';
import { GlobalDispatcher } from './GlobalDispatcher';
import { BackShadow } from './Modal';
import {
  centerX,
  centerY,
  distributeEvenlyX,
  horizontalAlignCenter,
  newAnimatedSprite,
  newContainer,
  newSprite,
  newText,
  postionAfterY,
  postionOnBottom,
} from './utils';
import { Button } from './utils/Button';
import { TextField } from './utils/TextField';

export function StoryModal({
  screenSize,
  screenStage,
  gd,
  troniumPrice,
}: {
  screenSize: Dimension;
  screenStage: Container;
  gd: GlobalDispatcher;
  troniumPrice: number;
}) {
  const stage = newContainer();
  screenStage.addChild(stage);

  const darkShadow = BackShadow(screenSize);

  const bodyFrame = newSprite('UIModalLarge.png');
  bodyFrame.interactive = true;
  bodyFrame.defaultCursor = 'default';

  const storySprite = newAnimatedSprite(
    'UIStoryTroy1.png',
    'UIStoryTroy2.png',
    'UIStoryTroy3.png',
    'UIStoryTroy4.png',
    'UIStoryTroy5.png',
    'UIStoryTroy6.png',
    'UIStoryTroy7.png',
    'UIStoryTroy8.png',
    'UIStoryTroy9.png',
    'UITroyStory10.png',
    'UITroyStory11.png'
  );
  const nextBtnSprite = newSprite('BtnStoryNext.png');
  const resetBtnSprite = newSprite('BtnStoryRepeat.png');
  const prevBtnSprite = newSprite('BtnStoryBack.png');

  centerX(screenSize.width, bodyFrame);
  centerY(screenSize.height, bodyFrame);
  centerX(screenSize.width, storySprite);
  centerY(screenSize.height, storySprite);

  nextBtnSprite.x = bodyFrame.x + bodyFrame.width - nextBtnSprite.width / 2;
  resetBtnSprite.x = bodyFrame.x + bodyFrame.width - resetBtnSprite.width / 2;
  prevBtnSprite.x = bodyFrame.x + bodyFrame.width - prevBtnSprite.width / 2;

  nextBtnSprite.y = bodyFrame.y + (bodyFrame.height - nextBtnSprite.height) / 2;
  resetBtnSprite.y = bodyFrame.y + (bodyFrame.height - resetBtnSprite.height) / 2;
  postionAfterY(nextBtnSprite, prevBtnSprite, 0);

  resetBtnSprite.visible = false;

  let currentValue: null | { tronium: number; trx: number } = null;

  const BuyContainerSize = { width: 420, height: 320 };
  const buyContainer = newContainer();
  buyContainer.visible = false;
  buyContainer.position.set(243, 306);
  const optionBoxes = createOptionBoxes({
    troniumPrice,
    size: BuyContainerSize,
    onSelect: value => {
      btnBuy.disable = false;
      currentValue = value;
    },
  });

  const btnBuySprite = newAnimatedSprite('BtnBuy.png', 'BtnBuyDisabled.png');

  centerX(BuyContainerSize.width, btnBuySprite);
  postionOnBottom(BuyContainerSize.height, 10, btnBuySprite);
  buyContainer.addChild(optionBoxes, btnBuySprite);

  const btnBuy = Button.from(btnBuySprite, () => {
    if (currentValue) {
      gd.requestBuyTroniumFromStory(currentValue.tronium);
    }
  });
  btnBuy.disable = true;

  const NameContainerSize = { width: 320, height: 190 };
  const nameContainer = newContainer();
  nameContainer.position.set(760, 435);
  nameContainer.visible = false;

  const nameField = new TextField({ size: { width: 300, height: 40 }, maxLength: 26 });
  const btnSetNameSprite = newSprite('BtnToBattle.png');
  Button.from(btnSetNameSprite, () => {
    gd.requestNameChange(nameField.value);
    dispose();
  });

  centerX(NameContainerSize.width, btnSetNameSprite);
  postionOnBottom(NameContainerSize.height, 10, btnSetNameSprite);

  nameContainer.addChild(nameField.stage, btnSetNameSprite);

  stage.addChild(
    darkShadow,
    bodyFrame,
    storySprite,
    buyContainer,
    nameContainer,
    nextBtnSprite,
    resetBtnSprite,
    prevBtnSprite
  );

  const dispose = () => {
    unregister();
    screenStage.removeChild(stage);
    stage.destroy();
    document.body.removeEventListener('keypress', dispose);
  };

  let storyIndex = 0;

  const goNext = () => {
    storyIndex++;
    updateStory();
  };
  const goPrev = () => {
    storyIndex--;
    updateStory();
  };
  const resetStory = () => {
    storyIndex = 0;
    updateStory();
  };

  const unregister = gd.registerForUIEvents({
    storyBuySucceed: () => {
      storyIndex = 10;
      updateStory();
    },
  });

  const updateStory = () => {
    prevBtnSprite.visible = storyIndex > 0 && storyIndex <= 9;
    nextBtnSprite.visible = storyIndex < 9;
    resetBtnSprite.visible = storyIndex === 9;
    buyContainer.visible = storyIndex === 9;
    nameContainer.visible = storyIndex === 10;
    if (storyIndex !== 9) {
      currentValue = null;
      btnBuy.disable = true;
    }
    storySprite.gotoAndStop(storyIndex);
  };

  Button.from(nextBtnSprite, goNext);
  Button.from(prevBtnSprite, goPrev, { soundId: 'btnNegative' });
  Button.from(resetBtnSprite, resetStory, { soundId: 'btnNegative' });

  const escListener = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      dispose();
    }
  };

  document.body.addEventListener('keydown', escListener);
  darkShadow.on('click', dispose);

  return {
    stage,
    dispose,
  };
}

// @ts-ignore
function createOptionBoxes({
  troniumPrice,
  size,
  onSelect,
}: {
  troniumPrice: number;
  size: { width: number; height: number };
  onSelect: (value: { tronium: number; trx: number }) => void;
}) {
  const stage = newContainer();

  const select = (i: number) => {
    boxes.forEach(b => b.unselect());
    boxes[i].select();
    onSelect(boxes[i].value);
  };

  const boxes = [
    SelectBox({
      tronium: 100,
      trx: troniumPrice * 100,
      icon: 'IcoPack1.png',
      onClick: () => select(0),
    }),
    SelectBox({
      tronium: 500,
      trx: troniumPrice * 500,
      icon: 'IcoPack2.png',
      onClick: () => select(1),
    }),
    SelectBox({
      tronium: 1000,
      trx: troniumPrice * 1000,
      icon: 'IcoPack3.png',
      onClick: () => select(2),
    }),
  ];

  distributeEvenlyX(size.width, ...boxes.map(b => b.stage));

  boxes.forEach(b => {
    stage.addChild(b.stage);
  });

  return stage;
}

function SelectBox(opts: { tronium: number; icon: string; trx: number; onClick: () => void }) {
  const stage = newContainer();

  const icon = newSprite(opts.icon);
  const troniumText = newText(`x ${opts.tronium.toString()}`, 'Body1');
  const trxText = newText(`${opts.trx} TRX`, 'Body1');

  horizontalAlignCenter(0, icon, troniumText, trxText);
  postionAfterY(icon, troniumText, 10);
  postionAfterY(troniumText, trxText, 0);

  stage.addChild(icon, troniumText, trxText);

  const iconBorder = new Graphics()
    .lineStyle(2, 0x000000)
    .drawRoundedRect(icon.x, icon.y, icon.width, icon.height, 5);
  iconBorder.visible = false;
  stage.addChild(iconBorder);

  icon.buttonMode = true;
  icon.interactive = true;

  icon.on('click', opts.onClick);
  return {
    stage,
    select: () => {
      iconBorder.visible = true;
    },
    unselect: () => {
      iconBorder.visible = false;
    },
    value: {
      tronium: opts.tronium,
      trx: opts.trx,
    },
  };
}
