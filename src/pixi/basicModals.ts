import { Point } from 'pixi.js';
import { Disposable, ScreenContext } from './MainUI';
import { Modal } from './Modal';
import { centerX, newContainer, newText, centerY } from './utils';

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

export const WaitModal = (text: string, opts: ScreenContext): Disposable => {
  const Padding = 40;

  const modal = Modal({
    scale: new Point(1, 0.7),
    screenSize: opts.size,
    screenStage: opts.parent,
    closeable: false,
  });

  const titleText = newText('Working...', 'BlackH2');

  titleText.y = Padding;
  centerX(modal.bodySize.width, titleText);

  const p = centeredParagraph(modal.bodySize.width, text);
  centerY(modal.bodySize.height, p);
  p.y = titleText.y + titleText.height + Padding * 1.7;

  modal.body.addChild(titleText, p);

  return modal;
};

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
