import { Graphics, Point } from 'pixi.js';
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
import { TextField } from './utils/TextField';

// screen: { width: 1366, height: 688 },

function centeredParagraph(width: number, msg: string) {
  const stage = newContainer();
  let nextY = 0;
  for (const line of msg.split('\n')) {
    const lineText = newText(line, 'BlackBody1');
    centerX(width, lineText);
    lineText.y = nextY;
    nextY += lineText.height;
    stage.addChild(lineText);
  }
  return stage;
}

const MessageModal = (title: string, msg: string) => (opts: ScreenContext): Disposable => {
  const Padding = 40;

  const modal = Modal({
    scale: new Point(1, 0.7),
    screenSize: opts.size,
    screenStage: opts.parent,
  });

  const titleText = newText(title, 'BlackH2');

  titleText.y = Padding;
  centerX(modal.bodySize.width, titleText);

  const p = centeredParagraph(modal.bodySize.width, msg);
  // centerY(modal.bodySize.height, p);
  p.y = titleText.y + titleText.height + Padding * 1.7;

  modal.body.addChild(titleText, p);

  return modal;
};

export const ErrorModal = MessageModal(
  'OOPS! WE FOUND AND ERROR',
  'There was an error with your game connection\nPlease reload game.'
);

export const GetTronlinkModal = MessageModal(
  'GET TRONLINK',
  'In order to play the game, you need to have\nTronLink Wallet installed'
);

export const TronlinkLoggedOutModal = MessageModal(
  'PLEASE LOGIN TRONLINK',
  'Your Tronlink wallet is not logged.\nPlease unlock'
);

export function ConnectModal(opts: ScreenContext & { troniumPrice: number }): Disposable {
  let currentValue: null | { tronium: number; trx: number } = null;
  const Padding = 25;

  const modal = Modal({
    scale: new Point(1.2, 1.2),
    screenSize: opts.size,
    screenStage: opts.parent,
  });

  const title1 = newText('YOUR JOURNEY STARTS', 'BlackH2');

  const msg0 = centeredParagraph(
    modal.bodySize.width,
    'How shall the bards sing your battles?\nChoose your name:'
  );
  const nameField = new TextField({ size: { width: 300, height: 40 }, maxLength: 26 });
  const msg = [
    "You won't get far without tronium",
    "A Hero's best friend!",
    'Choose your pack!',
  ].join('\n');
  const p = centeredParagraph(modal.bodySize.width, msg);

  const btnBuySprite = newSprite('BtnBuy.png');

  const btnBuy = Button.from(btnBuySprite, () => {
    if (nameField.value.trim().length > 0) {
      opts.gd.requestNameChange(nameField.value.trim());
    }
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
  centerX(modal.bodySize.width, btnBuySprite);

  centerX(modal.bodySize.width, nameField.stage);

  title1.y = Padding;
  postionAfterY(title1, msg0, Padding);
  postionAfterY(msg0, nameField.stage, Padding * 0.3);
  postionAfterY(nameField.stage, p, Padding);
  postionAfterY(p, optionBoxes, Padding * 0.5);

  postionOnBottom(modal.bodySize.height, Padding / 2, btnBuySprite);

  modal.body.addChild(title1, btnBuySprite, p, optionBoxes, msg0, nameField.stage);

  const unregister = opts.gd.registerForUIEvents({
    closeAddMoreModal: () => dispose(),
  });

  const dispose = () => {
    unregister();
    modal.dispose();
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
  const troniumText = newText(`x ${opts.tronium.toString()}`, 'BlackBody1');
  const trxText = newText(`${opts.trx} TRX`, 'BlackBody1');

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
