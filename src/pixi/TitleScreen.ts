import { Container, Graphics, Point } from 'pixi.js';
import { FightStats } from '../model/api';
import { HowtoPlayBtn, primaryBtn } from './basic';
import { Dimension } from './commons';
import { GlobalDispatcher } from './GlobalDispatcher';
import { Disposable } from './MainUI';
import { MainStatBox } from './StatBox';
import { newContainer, newText } from './utils';
import { Modal } from './Modal';

interface TitleScreenProps {
  size: Dimension;
  gd: GlobalDispatcher;
  parent: Container;
}

export function TitleScreen({ size, gd, parent }: TitleScreenProps): Disposable {
  const RanksWidth = 400;
  const BoxesTopMargin = 550;

  const stage = newContainer();
  parent.addChild(stage);

  primaryBtn('connect', gd.requestConnect.bind(gd), stage);

  stage.addChild(
    HowtoPlayBtn(() => {
      Modal({
        screenStage: parent,
        screenSize: size,
        onClose: () => {
          console.log('se cerro!');
        },
      });
    }).stage
  );

  const ranksBox = GeneralRanks({ position: new Point(100, 150), width: RanksWidth });
  stage.addChild(ranksBox.stage);

  const defeatedInvadersBox = MainStatBox({
    position: new Point(100, BoxesTopMargin),
    width: RanksWidth / 2,
    header: 'CALL TO ARMS',
    value: '--',
    footer: 'INVADERS DEFEATED',
  });
  stage.addChild(defeatedInvadersBox.stage);

  const weekHighestBox = MainStatBox({
    position: new Point(100 + RanksWidth / 2, BoxesTopMargin),
    width: RanksWidth / 2,
    header: 'HIGHEST THIS WEEK',
    value: '-- TRX',
    footer: 'IN 55 SECS',
  });
  stage.addChild(weekHighestBox.stage);

  const unregister = gd.registerForTitleScreen({
    setGlobalStats: stats => {
      weekHighestBox.setValue(`${stats.bestFightWeek.troniums} TRX`);
      defeatedInvadersBox.setValue(stats.villainsDefeated.toString());
      ranksBox.updateRanks(stats.allTime);
    },
  });

  return {
    dispose: () => {
      parent.removeChild(stage);
      stage.destroy({ children: true });
      unregister();
    },
  };
}

function GeneralRanks(opts: { position: Point; width: number }) {
  const FirstEntryTopMargin = 41;
  const EntryHeight = 65;

  const stage = newContainer(opts.position.x, opts.position.y);

  const title = newText('ALL TIME FIGHTS', 'H3');
  title.x = opts.width / 2;
  title.anchor.x = 0.5;
  stage.addChild(title);

  const ranksStage = newContainer(0, FirstEntryTopMargin);
  stage.addChild(ranksStage);

  const updateRanks = (fights: FightStats[]) => {
    ranksStage.removeChildren();
    fights.forEach((fight, i) => {
      const entry = RankEntry({
        idx: i,
        width: opts.width,
        epicness: fight.troniums,
        playerName: fight.playerName,
      });
      entry.y = i * EntryHeight;
      ranksStage.addChild(entry);
    });
  };

  return {
    stage,
    updateRanks,
  };
}

function RankEntry(opts: { idx: number; width: number; epicness: number; playerName: string }) {
  const stage = newContainer();

  const g = new Graphics()
    .lineStyle(1, 0xffffff)
    .moveTo(0, 0)
    .lineTo(opts.width, 0);
  stage.addChild(g);

  const idxText = newText(`${opts.idx + 1}`, 'Body1');
  const epicnessText = newText(`${opts.epicness.toFixed(0)} EPICNESS`, 'Body1');
  const playerText = newText(opts.playerName, 'Body2');

  idxText.y = epicnessText.y = 10;
  idxText.x = 10;
  epicnessText.x = playerText.x = 50;

  playerText.y = epicnessText.y + epicnessText.height + 3;
  stage.addChild(idxText, epicnessText, playerText);
  return stage;
}
