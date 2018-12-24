import { Disposable, ScreenContext } from './MainUI';
import { Modal } from './Modal';
import { newText, newContainer, newSprite } from './utils';
import { Graphics, Point } from 'pixi.js';
import { bigIcon, smallIcon } from './basic';
import { Dimension } from './commons';

// screen: { width: 1366, height: 688 },

export function AddMoreModal(opts: ScreenContext): Disposable {
  const Width = 800;
  const Height = 450;
  const Padding = 30;
  const DividerX = Width / 3;
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

  const title1 = newText('GET SOME SUPPLIES FOR BATTLE!', 'H2');
  title1.style.fill = 'black';
  title1.position.set(DividerX + Padding, Padding);

  const title2 = newText('CONNECTED TO', 'H2');
  title2.style.fill = 'black';
  title2.position.set(Padding, Padding);

  const dividerLine = new Graphics()
    .lineStyle(1, 0x000000)
    .moveTo(DividerX, 0)
    .lineTo(DividerX, Height);

  modal.body.addChild(title1, title2);
  modal.body.addChild(dividerLine);

  const boxpadding = (Width - DividerX - (BoxD.width * 3 + Padding * 2)) / 2;
  modal.body.addChild(
    SelectBox({
      size: BoxD,
      tronium: 100,
      trx: 50,
      position: new Point(DividerX + boxpadding, 150),
    }),
    SelectBox({
      size: BoxD,
      tronium: 500,
      trx: 50 * 5,
      position: new Point(DividerX + boxpadding + Padding + BoxD.width, 150),
    }),
    SelectBox({
      size: BoxD,
      tronium: 1000,
      trx: 50 * 10,
      position: new Point(DividerX + boxpadding + 2 * Padding + 2 * BoxD.width, 150),
    })
  );

  const btnBuy = newSprite('btnBuy');
  btnBuy.y = 330;
  btnBuy.x = DividerX + (Width - DividerX - btnBuy.width) / 2;
  modal.body.addChild(btnBuy);
  return {
    dispose: () => {
      modal.destroy();
    },
  };
}

function SelectBox(opts: { size: Dimension; position: Point; tronium: number; trx: number }) {
  const stage = newContainer(opts.position.x, opts.position.y);

  stage.addChild(
    new Graphics()
      .beginFill(0xd8d8d8)
      .drawRoundedRect(0, 0, opts.size.width, opts.size.height, 5)
      .endFill()
  );

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

  return stage;
}
