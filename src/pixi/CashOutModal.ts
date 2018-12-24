import { Disposable, ScreenContext } from './MainUI';
import { Modal } from './Modal';

export function CashOutModal(opts: ScreenContext): Disposable {
  const modal = Modal({
    screenSize: opts.size,
    screenStage: opts.parent,
    onClose: () => {
      console.log('nothing');
    },
    size: {
      width: opts.size.width * 0.8,
      height: opts.size.height * 0.8,
    },
  });

  return {
    dispose: () => {
      modal.destroy();
    },
  };
}
