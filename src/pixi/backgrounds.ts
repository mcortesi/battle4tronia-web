import { Dimension } from './commons';
import { newContainer, newSprite, newAnimatedSprite } from './utils';
import { Point, filters } from 'pixi.js';

export function MainBackground(size: Dimension) {
  const container = newContainer();

  const bg = newSprite('bgHome', { size });
  bg.name = 'background';

  const blurFilter = new filters.BlurFilter();
  blurFilter.blur = 3;
  bg.filters = [blurFilter];
  bg.tint = 0xcccccc;
  container.addChild(bg);

  const titleLabel = newSprite('UILogo.png', {
    position: {
      x: size.width / 2,
      y: 50,
    },
    anchor: new Point(0.5, 0),
  });
  container.addChild(titleLabel);

  return container;
}

export function BattleBackground(size: Dimension) {
  const container = newContainer();

  const bg = newSprite('bgBattle', { size });
  bg.name = 'background';
  bg.tint = 0x999999;

  const board = newSprite('UIBoard.png', {
    position: new Point(243, 11),
  });

  const selectedLine = newAnimatedSprite(
    'UIBoardLine1.png',
    'UIBoardLine2.png',
    'IcoBoardLine3.png'
  );
  selectedLine.position.set(243, 11);

  container.addChild(bg, board, selectedLine);

  return {
    stage: container,
    showLine: (x: 1 | 2 | 3) => {
      selectedLine.gotoAndStop(x - 1);
    },
  };
}
