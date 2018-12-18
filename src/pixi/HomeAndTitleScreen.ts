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
  opts.parent.addChild(stage);

  const btn = ConnectBtn({
    position: {
      x: opts.size.width / 2,
      y: 538,
    },
    anchor: new Point(0.5, 0),
    onClick: () => opts.gd.requestConnect(),
  });
  stage.addChild(btn.stage);

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

  return {
    dispose: () => {
      opts.parent.removeChild(stage);
      stage.destroy({ children: true });
    },
  };
}

export function MainBackground(size: Dimension) {
  const container = newContainer();

  const bg = newSprite('bgHome', { size });
  const blurFilter = new filters.BlurFilter();
  blurFilter.blur = 3;
  bg.filters = [blurFilter];
  bg.tint = 0xcccccc;
  container.addChild(bg);

  const titleLabel = newSprite('imgTitle', {
    position: {
      x: size.width / 2,
      y: 50,
    },
    anchor: new Point(0.5, 0),
  });
  container.addChild(titleLabel);

  return container;
}

function ConnectBtn(opts: { position: Position; anchor: Point; onClick: () => void }) {
  const btnSprite = newSprite('btnConnect');
  btnSprite.anchor.set(opts.anchor.x, opts.anchor.y);
  const btn = new Button({
    ...opts.position,
    hitArea: new Rectangle(-125, 0, 250, 106),
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
    hitArea: new Rectangle(-125, 0, 250, 106),
    sprite: btnSprite,
    onClick: opts.onClick,
  });

  return btn;
}
