import { Container, Graphics, Point, Rectangle } from 'pixi.js';
import { iter } from '../utils';
import { Dimension } from './commons';
import { GlobalDispatcher } from './GlobalDispatcher';
import { Disposable } from './MainUI';
import { MainStatBox } from './StatBox';
import { newContainer, newSprite, newText } from './utils';
import { Button } from './utils/Button';

interface TitleScreenProps {
  size: Dimension;
  gd: GlobalDispatcher;
  parent: Container;
}

export function TitleScreen({ size, gd, parent }: TitleScreenProps): Disposable {
  const stage = newContainer();
  parent.addChild(stage);

  const btn = ConnectBtn({
    position: new Point(size.width / 2, 538),
    anchor: new Point(0.5, 0),
    onClick: gd.requestConnect.bind(gd),
  });
  stage.addChild(btn.stage);

  stage.addChild(GeneralRanks({ position: new Point(100, 150) }));
  stage.addChild(
    MainStatBox({
      position: new Point(100, 550),
      header: 'CALL TO ARMS',
      value: '3.588',
      footer: 'INVADERS DEFEATED',
    })
  );

  stage.addChild(
    MainStatBox({
      position: new Point(315, 550),
      header: 'HIGHEST THIS WEEK',
      value: '0.15 TRX',
      footer: 'IN 55 SECS',
    })
  );

  return {
    dispose: () => {
      parent.removeChild(stage);
      stage.destroy({ children: true });
    },
  };
}

function ConnectBtn(opts: { position: Point; anchor: Point; onClick: () => void }) {
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

function GeneralRanks(opts: { position: Point }) {
  const Width = 300;
  const FirstEntryTopMargin = 41;
  const EntryHeight = 65;

  const stage = newContainer(opts.position.x, opts.position.y);

  const title = newText('ALL TIME FIGHTS', 'H3');
  title.x = Width / 2;
  title.anchor.x = 0.5;
  stage.addChild(title);

  iter(5, i => {
    const entry = RankEntry({ idx: i, epicness: 3581, playerName: 'User Lorem Ipsum' });
    entry.y = FirstEntryTopMargin + i * EntryHeight;
    stage.addChild(entry);
  });

  return stage;
}

function RankEntry(opts: { idx: number; epicness: number; playerName: string }) {
  const stage = newContainer();

  const g = new Graphics()
    .lineStyle(1, 0xffffff)
    .moveTo(0, 0)
    .lineTo(300, 0);
  stage.addChild(g);

  const idxText = newText(`${opts.idx + 1}`, 'Body1');
  const epicnessText = newText(`${opts.epicness} EPICNESS`, 'Body1');
  const playerText = newText(opts.playerName, 'Body2');

  idxText.y = epicnessText.y = 10;
  epicnessText.x = playerText.x = 24;

  playerText.y = epicnessText.y + epicnessText.height + 3;
  stage.addChild(idxText, epicnessText, playerText);
  return stage;
}
