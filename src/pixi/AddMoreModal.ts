import { Graphics } from 'pixi.js';
import { Disposable, ScreenContext } from './MainUI';
import { Modal } from './Modal';
import {
  centerX,
  distributeEvenlyX,
  horizontalAlignCenter,
  newContainer,
  newSprite,
  newText,
  postionAfterY,
  postionOnBottom,
} from './utils';
import { Button } from './utils/Button';

// screen: { width: 1366, height: 688 },

export function AddMoreModal(opts: ScreenContext & { troniumPrice: number }): Disposable {
  let currentValue: null | { tronium: number; trx: number } = null;
  const Padding = 30;

  const modal = Modal({
    screenSize: opts.size,
    screenStage: opts.parent,
    onClose: () => dispose(),
  });

  const title1 = newText('GET SUPPLIES!', 'H2');
  const btnBuySprite = newSprite('BtnBuy.png');

  const btnBuy = Button.from(btnBuySprite, () => {
    if (currentValue) {
      opts.gd.requestBuyTronium(currentValue.tronium);
    }
  });
  btnBuy.disable = true;

  const optionBoxes = createOptionBoxes({
    troniumPrice: opts.troniumPrice,
    size: modal.bodySize,
    onSelect: value => {
      btnBuy.disable = false;
      currentValue = value;
    },
  });

  centerX(modal.bodySize.width, title1);
  title1.y = Padding;
  centerX(modal.bodySize.width, btnBuySprite);
  optionBoxes.y = 130;
  postionOnBottom(modal.bodySize.height, Padding / 2, btnBuySprite);

  modal.body.addChild(title1, btnBuySprite, optionBoxes);

  const unregister = opts.gd.registerForUIEvents({
    closeAddMoreModal: () => dispose(),
  });

  const dispose = () => {
    unregister();
    modal.destroy();
  };
  return {
    dispose,
  };
}

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
    .lineStyle(2, 0xffffff)
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
