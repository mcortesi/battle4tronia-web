import { Container, Point } from 'pixi.js';
import { Player, PlayerStats } from '../model/model';
import { bigIcon, smallIcon, ToBattleBtn, HowtoPlayBtn, WatchStoryBtn } from './basic';
import { Dimension } from './commons';
import { GlobalDispatcher } from './GlobalDispatcher';
import { Disposable } from './MainUI';
import { MainStatBox, SecondaryStatBox } from './StatBox';
import {
  newContainer,
  newSprite,
  newText,
  postionAfterX,
  verticalAlignCenter,
  newAnimatedSprite,
  postionOnRight,
} from './utils';
import { Button, ToggleButton } from './utils/Button';
import SoundManager from './SoundManager';

export interface HomeScreenProps {
  size: Dimension;
  gd: GlobalDispatcher;
  parent: Container;
  player: Player;
}

export function HomeScreen({ size, gd, parent, player }: HomeScreenProps): Disposable {
  const stage = newContainer();
  parent.addChild(stage);

  stage.addChild(Hero(size));

  const btnBar = ButtonBar();

  const btnToBattle = ToBattleBtn(size, gd.requestBattle.bind(gd), gd.openAddMoreModal.bind(gd));

  postionOnRight(size.width, 10, btnBar);
  btnBar.y = 10;

  stage.addChild(btnToBattle.stage);
  stage.addChild(btnBar);

  const balanceBox = BalanceBox({
    position: new Point(10, 10),
    value: player.tronium,
    addMore: gd.openAddMoreModal.bind(gd),
    cashOut: gd.openCashOutModal.bind(gd),
  });
  stage.addChild(balanceBox.stage);

  stage.addChild(HowtoPlayBtn(gd.showHowToPlay.bind(gd)).stage);
  stage.addChild(WatchStoryBtn(gd.showHowToPlay.bind(gd)).stage);

  stage.addChild(
    newText(player.name, 'H1', {
      position: new Point(size.width / 2, 200),
      anchor: new Point(0.5, 0),
    })
  );

  const fameIco = smallIcon('IcoShield', {
    position: new Point(0, 250 + 6),
  });
  const fameText = newText(player.fame.toString(), 'H2', {
    position: new Point(0, 250),
  });
  const fameWidth = fameIco.width + fameText.width + 5;
  fameIco.x = (size.width - fameWidth) / 2;
  fameText.x = fameIco.x + fameIco.width + 5;

  stage.addChild(fameIco, fameText);

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
    value: '--',
    footer: 'FAME',
  });

  const bestFightBox = SecondaryStatBox({
    position: new Point(TableLayout.x[0], TableLayout.y[1]),
    width: ColWidth,
    header: 'BEST IN TRONIA',
    value: '--',
  });

  const playerBestMatchBox = MainStatBox({
    position: new Point(TableLayout.x[1], TableLayout.y[0]),
    width: ColWidth,
    header: 'HIGHEST EARNINGS',
    value: '--',
    footer: 'IN ONE MATCH',
  });

  const bestMatchBox = SecondaryStatBox({
    position: new Point(TableLayout.x[1], TableLayout.y[1]),
    width: ColWidth,
    header: 'BEST IN TRONIA',
    value: '--',
  });

  const playerKillsBox = MainStatBox({
    position: new Point(TableLayout.x[2], TableLayout.y[0]),
    width: ColWidth,
    header: 'CALL TO ARMS',
    value: '--',
    footer: 'INVADERS DEFEATED',
  });

  const totalKillsBox = SecondaryStatBox({
    position: new Point(TableLayout.x[2], TableLayout.y[1]),
    width: ColWidth,
    header: 'EVERYWHERE',
    value: '--',
  });

  stage.addChild(
    playerBestFightBox.stage,
    playerBestMatchBox.stage,
    playerKillsBox.stage,
    bestFightBox.stage,
    bestMatchBox.stage,
    totalKillsBox.stage
  );

  const updateBalanceStatus = (p: Player) => {
    const enabled = p.tronium > 0;
    btnToBattle.setCanGoToBattle(enabled);
  };

  updateBalanceStatus(player);

  const unregister = gd.registerForUIEvents({
    playerUpdated: (p: Player) => {
      balanceBox.setBalance(p.tronium);
      updateBalanceStatus(p);
    },
    setPlayerStats: (playerStats: PlayerStats) => {
      playerBestFightBox.setValue(playerStats.bestFightByEpicness.epicness.toString());
      playerKillsBox.setValue(playerStats.villainsDefeated.toString());
      playerBestMatchBox.setValue(`${playerStats.bestFightByTroniums.troniums}`);
    },

    setGlobalStats: globalStats => {
      bestFightBox.setValue(globalStats.allTimeByEpicness[0].epicness.toString());
      bestMatchBox.setValue(`${globalStats.allTimeByTroniunm[0].troniums}`);
      totalKillsBox.setValue(globalStats.villainsDefeated.toString());
    },
  });

  return {
    dispose: () => {
      unregister();
      parent.removeChild(stage);
      stage.destroy({ children: true });
    },
  };
}

function BalanceBox(opts: {
  position: Point;
  value: number;
  addMore: () => void;
  cashOut: () => void;
}) {
  const container = newContainer(opts.position.x, opts.position.y);

  const icon = bigIcon('IcoTronium');
  const score = newText(opts.value.toString(), 'H2');
  const addMoreSprite = newSprite('BtnAddMore.png');
  const cashoutSprite = newSprite('BtnCashoutSmall.png');

  postionAfterX(icon, score, 10);
  postionAfterX(score, addMoreSprite, 10);
  postionAfterX(addMoreSprite, cashoutSprite, 10);

  verticalAlignCenter(0, icon, score, addMoreSprite, cashoutSprite);
  container.addChild(icon, score, addMoreSprite, cashoutSprite);

  Button.from(addMoreSprite, opts.addMore);
  Button.from(cashoutSprite, opts.cashOut);

  return {
    stage: container,
    setBalance: (newVal: number) => {
      score.text = newVal.toString();
      postionAfterX(score, addMoreSprite, 10);
      postionAfterX(addMoreSprite, cashoutSprite, 10);
    },
  };
}

// function GraphicBtn(opts: {
//   text: string;
//   position: Point;
//   fill: boolean;
//   color: number;
//   onClick: () => void;
// }) {
//   const margin = 4;
//   const labelText = newText(opts.text, 'Body2', {
//     position: new Point(margin, margin),
//   });

//   const g = new Graphics();

//   if (opts.fill) {
//     g.beginFill(opts.color);
//   } else {
//     g.lineStyle(1, opts.color);
//   }
//   g.drawRoundedRect(0, 0, labelText.width + margin * 2, labelText.height + margin * 2, 5);

//   if (opts.fill) {
//     g.endFill();
//   }

//   g.addChild(labelText);

//   g.position.set(opts.position.x, opts.position.y);

//   g.interactive = true;
//   g.buttonMode = true;
//   g.on('click', () => {
//     SoundManager.playBtn();
//     opts.onClick();
//   });
//   return g;
// }

function Hero(parentSize: Dimension) {
  const hero = newSprite('Hero.png');
  hero.x = 0;
  hero.y = parentSize.height - hero.height;
  return hero;
}

function ButtonBar() {
  const container = newContainer();

  const musicSprite = newAnimatedSprite('IcoMusicOn.png', 'IcoMusicOff.png');
  const volumeSprite = newAnimatedSprite('IcoVolumeOn.png', 'IcoVolumeOff.png');

  postionAfterX(musicSprite, volumeSprite, 10);

  container.addChild(musicSprite, volumeSprite);

  ToggleButton.from(
    musicSprite,
    () => {
      SoundManager.toggleMusic();
    },
    SoundManager.musicOn
  );
  ToggleButton.from(
    volumeSprite,
    () => {
      SoundManager.toggleVolume();
    },
    SoundManager.volumeOn
  );
  return container;
}
