import { Disposable, ScreenContext } from './MainUI';
import { Modal } from './Modal';
import { newText, newSprite } from './utils';
import { TextStyles } from './constants';
import { Button } from './utils/Button';
import { Player } from '../model/api';
import { Sprite } from 'pixi.js';
import { smallIcon } from './basic';

function centerX(parentWidth: number, sprite: Sprite) {
  sprite.x = (parentWidth - sprite.width) / 2;
}
function centerGroupX(parentWidth: number, separation: number, ...sprite: Sprite[]) {
  let groupWidth = -separation;
  for (const s of sprite) {
    groupWidth += separation + s.width;
  }

  sprite[0].x = (parentWidth - groupWidth) / 2;

  for (let i = 1; i < sprite.length; i++) {
    sprite[i].x = sprite[i - 1].x + sprite[i - 1].width + separation;
  }
}

function postionAfterY(before: Sprite, elem: Sprite, separtion: number = 0) {
  elem.y = before.y + before.height + separtion;
}

export function CashOutModal(opts: ScreenContext & { player: Player }): Disposable {
  const Width = 530;
  const Height = 410;
  const Padding = 30;

  const modal = Modal({
    screenSize: opts.size,
    screenStage: opts.parent,
    onClose: () => dispose(),
    size: {
      width: Width,
      height: Height,
    },
  });

  const TitleStyle = TextStyles.H2.clone();
  TitleStyle.fill = 'black';
  const BodyStyle = TextStyles.Body1.clone();
  BodyStyle.fill = 'black';

  const title = newText('CASHOUT', TitleStyle);
  title.position.set((Width - title.width) / 2, Padding);
  modal.body.addChild(title);

  const msg1 = newText('We  hope you enjoyed your  time at Tronia!', BodyStyle);
  const msg2 = newText('Come back any time soon!', BodyStyle);
  const msg3 = newText('Your earnings:', BodyStyle);
  const troniumIcon = smallIcon('IcoTronium');
  const msg4 = newText(`${opts.player.tronium} valued ${opts.player.tronium * 50} TRX`, TitleStyle);
  const msg5 = newText('Will be  transfered to your Tronlink Wallet', BodyStyle);
  const btnSellSprite = newSprite('btnBuy');

  centerX(Width, msg1);
  centerX(Width, msg2);
  centerX(Width, msg3);
  centerX(Width, msg5);
  centerGroupX(Width, 5, troniumIcon, msg4);
  centerX(Width, btnSellSprite);

  postionAfterY(title, msg1, Padding);
  postionAfterY(msg1, msg2);
  postionAfterY(msg2, msg3, Padding);
  postionAfterY(msg3, msg4, Padding / 2);
  troniumIcon.y = msg4.y + (msg4.height - troniumIcon.height) / 2;
  postionAfterY(msg4, msg5, Padding);
  postionAfterY(msg5, btnSellSprite, Padding / 3);

  modal.body.addChild(msg1, msg2, msg3, msg4, troniumIcon, msg5, btnSellSprite);

  Button.from(btnSellSprite, () => {
    opts.gd.requestSellTronium(10);
  });

  const unregister = opts.gd.registerForUIEvents({
    closeCashOutModal: () => dispose(),
  });

  const dispose = () => {
    unregister();
    modal.destroy();
  };

  return {
    dispose,
  };
}
