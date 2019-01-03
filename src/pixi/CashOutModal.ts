import { Player } from '../model/model';
import { smallIcon } from './basic';
import { Disposable, ScreenContext } from './MainUI';
import { Modal } from './Modal';
import {
  centerGroupX,
  centerX,
  newAnimatedSprite,
  newText,
  postionAfterY,
  postionBeforeY,
  postionOnBottom,
  verticalAlignCenter,
} from './utils';
import { Button } from './utils/Button';

export function CashOutModal(
  opts: ScreenContext & { player: Player; troniumPrice: number }
): Disposable {
  const Padding = 20;

  const modal = Modal({
    screenSize: opts.size,
    screenStage: opts.parent,
  });
  const Width = modal.bodySize.width;

  const title = newText('CASHOUT', 'BlackH2');
  title.position.set((Width - title.width) / 2, Padding);
  modal.body.addChild(title);

  const msg1 = newText('We  hope you enjoyed your  time at Tronia!', 'BlackBody1');
  const msg2 = newText('Come back any time soon!', 'BlackBody1');
  const msg3 = newText('You have:', 'BlackBody1');
  const troniumIcon = smallIcon('IcoTronium');
  const msg4 = newText(`${opts.player.tronium}`, 'BlackH2');
  const msg5 = newText('You get:', 'BlackBody1');
  const msg6 = newText(`${opts.player.tronium * opts.troniumPrice} TRX`, 'BlackH2');

  const bottomMsg = newText('Will be  transfered to your Tronlink Wallet', 'BlackBody1');
  const btnSellSprite = newAnimatedSprite('BtnCashout.png', 'BtnCashoutDisabled.png');

  centerX(Width, msg1);
  centerX(Width, msg2);
  centerX(Width, msg3);
  centerGroupX(Width, 5, troniumIcon, msg4);
  centerX(Width, msg5);
  centerX(Width, msg6);
  centerX(Width, bottomMsg);
  centerX(Width, btnSellSprite);

  postionAfterY(title, msg1, Padding);
  postionAfterY(msg1, msg2);
  postionAfterY(msg2, msg3, Padding);

  postionAfterY(msg3, msg4, Padding / 2);
  verticalAlignCenter(msg4.y, msg4, troniumIcon);
  postionAfterY(msg4, msg5, Padding / 2);
  postionAfterY(msg5, msg6, Padding / 2);

  postionOnBottom(modal.bodySize.height, Padding / 2, btnSellSprite);
  postionBeforeY(btnSellSprite, bottomMsg, Padding / 2);

  modal.body.addChild(msg1, msg2, msg3, msg4, msg5, msg6, troniumIcon, bottomMsg, btnSellSprite);

  const sellBtn = Button.from(btnSellSprite, () => {
    opts.gd.requestSellTronium(10);
  });

  const unregister = opts.gd.registerForUIEvents({
    closeCashOutModal: () => dispose(),
  });

  if (opts.player.tronium === 0) {
    sellBtn.disable = true;
  }

  const dispose = () => {
    unregister();
    modal.dispose();
  };

  return {
    dispose,
  };
}
