import { Container, Graphics, Point } from 'pixi.js';
import { smallIcon } from './basic';
import { Dimension } from './commons';
import { Disposable, ScreenContext } from './MainUI';
import { Modal } from './Modal';
import { newContainer, newSprite, newText } from './utils';
import { Button } from './utils/Button';
import { TextStyles } from './constants';

// screen: { width: 1366, height: 688 },

export function AddMoreModal(opts: ScreenContext): Disposable {
  const Width = 530;
  const Height = 450;
  const Padding = 30;
  const BoxD = {
    width: 120,
    height: 100,
  };

  const modal = Modal({
    screenSize: opts.size,
    screenStage: opts.parent,
    onClose: () => {
      console.log('nothing');
    },
    size: {
      width: Width,
      height: Height,
    },
  });

  addTitle(Padding, modal);

  let currentValue: null | { tronium: number; trx: number } = null;

  const btnBuySprite = newSprite('btnBuy');
  btnBuySprite.y = 330;
  btnBuySprite.x = (Width - btnBuySprite.width) / 2;
  const btnBuy = Button.from(btnBuySprite, () => {
    if (currentValue) {
      opts.gd.requestBuyTronium(currentValue.tronium);
    }
  }).addTo(modal.body);
  btnBuy.disable = true;

  addOptionBoxes({
    size: BoxD,
    position: new Point((Width - (BoxD.width * 3 + Padding * 2)) / 2, 150),
    boxSeparation: Padding,
    parent: modal.body,
    onSelect: value => {
      btnBuy.disable = false;
      currentValue = value;
    },
  });

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

function addOptionBoxes({
  size,
  position,
  boxSeparation,
  parent,
  onSelect,
}: {
  size: { width: number; height: number };
  position: Point;
  boxSeparation: number;
  parent: Container;
  onSelect: (value: { tronium: number; trx: number }) => void;
}) {
  const stage = newContainer(position.x, position.y);
  parent.addChild(stage);

  const select = (i: number) => {
    boxes.forEach(b => b.unselect());
    boxes[i].select();
    onSelect(boxes[i].value);
  };

  const boxes = [
    SelectBox({
      size,
      tronium: 100,
      trx: 50,
      position: new Point(0, 0),
      onClick: () => select(0),
    }),
    SelectBox({
      size,
      tronium: 500,
      trx: 50 * 5,
      position: new Point(boxSeparation + size.width, 0),
      onClick: () => select(1),
    }),
    SelectBox({
      size,
      tronium: 1000,
      trx: 50 * 10,
      position: new Point(2 * (boxSeparation + size.width), 0),
      onClick: () => select(2),
    }),
  ];
  boxes.forEach(b => {
    stage.addChild(b.stage);
  });
}

function addTitle(
  Padding: number,
  modal: { stage: PIXI.Container; body: PIXI.Container; destroy(): void }
) {
  const titleStyle = TextStyles.H2.clone();
  titleStyle.fill = 'black';
  const title1 = newText('GET SOME SUPPLIES FOR BATTLE!', titleStyle);
  title1.position.set(Padding, Padding);
  modal.body.addChild(title1);
}

function SelectBox(opts: {
  size: Dimension;
  position: Point;
  tronium: number;
  trx: number;
  onClick: () => void;
}) {
  const stage = newContainer(opts.position.x, opts.position.y);

  const borderG = new Graphics()
    .lineStyle(2, 0x000000)
    .drawRoundedRect(0, 0, opts.size.width, opts.size.height, 10);
  borderG.visible = false;

  stage.addChild(
    new Graphics()
      .beginFill(0xcccccc)
      .drawRoundedRect(0, 0, opts.size.width, opts.size.height, 10)
      .endFill()
  );
  stage.addChild(borderG);

  const troniumText = newText(opts.tronium.toString(), 'H2');
  const troniumIcon = smallIcon('IcoTronium');
  troniumText.y = 20;
  troniumIcon.y = 25;
  const totalWidth = troniumText.width + 5 + troniumIcon.width;
  troniumText.x = (opts.size.width - totalWidth) / 2;
  troniumIcon.x = troniumText.x + troniumText.width + 5;

  stage.addChild(troniumText, troniumIcon);

  stage.addChild(
    newText(`${opts.trx} TRX`, 'Body1', {
      anchor: new Point(0.5, 0),
      position: new Point(opts.size.width / 2, 60),
    })
  );

  stage.buttonMode = true;
  stage.interactive = true;

  stage.on('click', opts.onClick);
  return {
    stage,
    select: () => {
      borderG.visible = true;
    },
    unselect: () => {
      borderG.visible = false;
    },
    value: {
      tronium: opts.tronium,
      trx: opts.trx,
    },
  };
}
