import { Point, Rectangle, Container } from 'pixi.js';
import { Position, Dimension } from './commons';
import { Button } from './utils/Button';
import { newContainer, newSprite } from './utils';
import { Disposable } from './MainUI';
import { GlobalDispatcher } from './GlobalDispatcher';
import { Player } from '../model/api';
import { MainStatBox } from './StatBox';

export interface HomeScreenProps {
  size: Dimension;
  gd: GlobalDispatcher;
  parent: Container;
  player: Player;
}

export function HomeScreen(opts: HomeScreenProps): Disposable {
  const stage = newContainer();
  opts.parent.addChild(stage);
  const btn = ToBattleBtn({
    position: {
      x: opts.size.width / 2,
      y: 538,
    },
    anchor: new Point(0.5, 0),
    onClick: () => opts.gd.requestBattle(),
  });
  stage.addChild(btn.stage);

  const leftBox = MainStatBox({
    position: new Point(0, 230),
    header: 'YOUR BEST FIGHT',
    value: '3.588',
    footer: 'EPICNESS',
  });
  leftBox.x = opts.size.width / 2 - 250 - leftBox.width / 2;

  const centerBox = MainStatBox({
    position: new Point(0, 230),
    header: 'HIGHEST EARNINGS',
    value: '0.15 TRX',
    footer: 'IN ONE MATCH',
  });
  centerBox.x = (opts.size.width - centerBox.width) / 2;

  const rightBox = MainStatBox({
    position: new Point(0, 230),
    header: 'CALL TO ARMS',
    value: '35',
    footer: 'INVADERS DEFEATED',
  });
  rightBox.x = opts.size.width / 2 + 250 - rightBox.width / 2;

  stage.addChild(leftBox, centerBox, rightBox);

  return {
    dispose: () => {
      opts.parent.removeChild(stage);
      stage.destroy({ children: true });
    },
  };
}
function ToBattleBtn(opts: { position: Position; anchor: Point; onClick: () => void }) {
  const btnSprite = newSprite('btnToBattle');
  btnSprite.anchor.set(opts.anchor.x, opts.anchor.y);
  const btn = new Button({
    ...opts.position,
    hitArea: new Rectangle(-125, 0, 250, 106),
    sprite: btnSprite,
    onClick: opts.onClick,
  });
  return btn;
}
