import { ReelSize } from '../model/reel';
import { TextStyle } from 'pixi.js';

export const Layout = {
  screen: { width: 1366, height: 688 },
  bgCoatofarms: {
    x: 579,
    y: 507,
  },
  scoreBox: {
    x: 28,
    y: 20,
    textX: 60,
    labelY: 35,
    fameY: 95 - 20,
  },
  icoTronium: { x: 28, y: 23 },
  counterTronium: { x: 87, y: 18 },
  labelTronium: { x: 87, y: 54 },
  icoFame: { x: 28, y: 95 },
  counterFame: { x: 87, y: 96 },
  labelFame: { x: 87, y: 132 },
  betLeftArrow: { x: 305, y: 643 },
  betRigthArrow: { x: 475, y: 643 },

  energyBar: {
    color: 0x05bcec,
    x: 305,
    y: 486,
    width: 285,
    height: 20,
  },
  hpBar: {
    color: 0xff3300,
    x: 1057 - 285,
    y: 486,
    width: 285,
    height: 20,
  },

  betSelector: {
    x: 305,
    y: 533,
    textSpace: 130,
  },
  linesSelector: {
    x: 1057 - 130 - 55 * 2,
    y: 533,
    textSpace: 130,
  },

  message: {
    x: 300,
    y: 30,
    width: 750,
    height: 35,
  },
  reels: {
    x: 305,
    y: 100,
    rows: ReelSize.rows,
    columns: ReelSize.columns,
    colSeparation: 13,
    cellWidth: 140,
    cellHeight: 125,
    symbolWidth: 109,
    symbolHeight: 109,
  },
  hero: {
    width: 300,
    height: 525,
    x: 0,
    y: 688 - 525,
  },
  villain: {
    width: 300,
    height: 525,
    x: 1366 - 300,
    y: 688 - 525,
  },
};

export const TextStyles = {
  H1: new TextStyle({
    fontFamily: 'Exo 2',
    fontSize: 40,
    fontWeight: '900',
    fill: 'white',
  }),
  H2: new TextStyle({
    fontFamily: 'Exo 2',
    fontSize: 30,
    fontWeight: '900',
    fill: 'white',
  }),
  H3: new TextStyle({
    fontFamily: 'Exo 2',
    fontSize: 24,
    fontWeight: '900',
    fill: 'white',
  }),
  Body1: new TextStyle({
    fontFamily: 'Exo 2',
    fontSize: 18,
    fontWeight: '400',
    fill: 'white',
  }),
  Body2: new TextStyle({
    fontFamily: 'Exo 2',
    fontSize: 18,
    fontWeight: '400',
    fill: 'white',
  }),
};
