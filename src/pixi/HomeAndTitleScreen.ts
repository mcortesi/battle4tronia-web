import { Container, filters, Point, Rectangle } from 'pixi.js';
import { GlobalDispatcher } from './GlobalDispatcher';
import { Dimension, Position } from './commons';
import { Button } from './utils/Button';
import { newContainer, newSprite } from './utils';
import { Disposable } from './MainUI';
import { Player } from '../model/api';

interface TitleScreenProps {
  size: Dimension;
  gd: GlobalDispatcher;
  parent: Container;
}

export function TitleScreen(opts: TitleScreenProps): Disposable {
  const stage = newContainer();

  const btn = ConnectBtn({
    position: {
      x: opts.size.width / 2,
      y: opts.size.height - 50,
    },
    anchor: new Point(0.5, 0),
    onClick: () => opts.gd.requestConnect(),
  });
  stage.addChild(btn.stage);

  opts.parent.addChild(stage);

  return {
    dispose: () => {
      opts.parent.removeChild(stage);
      stage.destroy({ children: true });
    },
  };
}

interface HomeScreenProps {
  size: Dimension;
  gd: GlobalDispatcher;
  parent: Container;
  player: Player;
}

export function HomeScreen(opts: HomeScreenProps): Disposable {
  const stage = newContainer();

  const btn = ToBattleBtn({
    position: {
      x: opts.size.width / 2,
      y: opts.size.height - 50,
    },
    anchor: new Point(0.5, 0),
    onClick: () => opts.gd.requestBattle(),
  });
  stage.addChild(btn.stage);

  opts.parent.addChild(stage);

  return {
    dispose: () => {
      opts.parent.removeChild(stage);
      stage.destroy({ children: true });
    },
  };
}

export function MainBackground(size: Dimension) {
  const s = newSprite('bgHome', { size });
  const blurFilter = new filters.BlurFilter();
  s.tint = 0xcccccc;
  blurFilter.blur = 3;
  return s;
}

function ConnectBtn(opts: { position: Position; anchor: Point; onClick: () => void }) {
  const btnSprite = newSprite('btnConnect');
  btnSprite.anchor.set(opts.anchor.x, opts.anchor.y);
  const btn = new Button({
    ...opts.position,
    hitArea: new Rectangle(-103, 7, 207, 115),
    sprite: btnSprite,
    onClick: opts.onClick,
  });

  return btn;
}

function ToBattleBtn(opts: { position: Position; anchor: Point; onClick: () => void }) {
  const btnSprite = newSprite('btnToBattle');
  btnSprite.anchor.set(opts.anchor.x, opts.anchor.y);
  const btn = new Button({
    ...opts.position,
    hitArea: new Rectangle(-103, 7, 207, 115),
    sprite: btnSprite,
    onClick: opts.onClick,
  });

  return btn;
}
