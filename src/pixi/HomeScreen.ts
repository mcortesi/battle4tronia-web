import { Container, Point } from 'pixi.js';
import { Player } from '../model/api';
import { primaryBtn, smallIcon } from './basic';
import { Dimension } from './commons';
import { GlobalDispatcher } from './GlobalDispatcher';
import { Disposable } from './MainUI';
import { MainStatBox, SecondaryStatBox } from './StatBox';
import { newContainer, newText } from './utils';

export interface HomeScreenProps {
  size: Dimension;
  gd: GlobalDispatcher;
  parent: Container;
  player: Player;
}

export function HomeScreen({ size, gd, parent, player }: HomeScreenProps): Disposable {
  const stage = newContainer();
  parent.addChild(stage);

  primaryBtn('toBattle', () => gd.requestBattle(), stage);
  // const btn = ToBattleBtn({
  //   position: {
  //     x: size.width / 2,
  //     y: 538,
  //   },
  // });
  // stage.addChild(btn.stage);

  stage.addChild(
    newText(player.name, 'H1', {
      position: new Point(size.width / 2, 200),
      anchor: new Point(0.5, 0),
    })
  );

  stage.addChild(
    smallIcon('IcoFame', {
      position: new Point(size.width / 2 - 24 - 38, 250 + 6),
    })
  );

  stage.addChild(
    newText(player.fame.toString(), 'H2', {
      position: new Point(size.width / 2 - 30, 250),
    })
  );

  const ColWidth = size.width / 5;
  const TableLayout = {
    x: [ColWidth * 1, ColWidth * 2, ColWidth * 3],
    y: [310, 420],
  };

  // stage.addChild(
  //   new Graphics()
  //     .lineStyle(1, 0xffff00)
  //     .drawRect(TableLayout.x[0], TableLayout.y[0], ColWidth, TableLayout.y[1] - TableLayout.y[0])
  //     .drawRect(TableLayout.x[1], TableLayout.y[0], ColWidth, TableLayout.y[1] - TableLayout.y[0])
  //     .drawRect(TableLayout.x[2], TableLayout.y[0], ColWidth, TableLayout.y[1] - TableLayout.y[0])
  //     .drawRect(TableLayout.x[0], TableLayout.y[1], ColWidth, TableLayout.y[1] - TableLayout.y[0])
  //     .drawRect(TableLayout.x[1], TableLayout.y[1], ColWidth, TableLayout.y[1] - TableLayout.y[0])
  //     .drawRect(TableLayout.x[2], TableLayout.y[1], ColWidth, TableLayout.y[1] - TableLayout.y[0])
  // );

  const playerBestFightBox = MainStatBox({
    position: new Point(TableLayout.x[0], TableLayout.y[0]),
    width: ColWidth,
    header: 'YOUR BEST FIGHT',
    value: '3.588',
    footer: 'EPICNESS',
  });

  const bestFightBox = SecondaryStatBox({
    position: new Point(TableLayout.x[0], TableLayout.y[1]),
    width: ColWidth,
    header: 'BEST IN TRONIA',
    value: '55555',
  });

  const playerBestMatchBox = MainStatBox({
    position: new Point(TableLayout.x[1], TableLayout.y[0]),
    width: ColWidth,
    header: 'HIGHEST EARNINGS',
    value: '0.15 TRX',
    footer: 'IN ONE MATCH',
  });

  const bestMatchBox = SecondaryStatBox({
    position: new Point(TableLayout.x[1], TableLayout.y[1]),
    width: ColWidth,
    header: 'BEST IN TRONIA',
    value: '0.15 TRX',
  });

  const playerKillsBox = MainStatBox({
    position: new Point(TableLayout.x[2], TableLayout.y[0]),
    width: ColWidth,
    header: 'CALL TO ARMS',
    value: '35',
    footer: 'INVADERS DEFEATED',
  });

  const totalKillsBox = SecondaryStatBox({
    position: new Point(TableLayout.x[2], TableLayout.y[1]),
    width: ColWidth,
    header: 'EVERYWHERE',
    value: '1000',
  });

  stage.addChild(
    playerBestFightBox.stage,
    playerBestMatchBox.stage,
    playerKillsBox.stage,
    bestFightBox.stage,
    bestMatchBox.stage,
    totalKillsBox.stage
  );

  // const unregister = gd.registerForHomeScreen({
  //   setPlayerStats: (playerStats: PlayerStats) => {},
  // });

  return {
    dispose: () => {
      parent.removeChild(stage);
      stage.destroy({ children: true });
    },
  };
}
