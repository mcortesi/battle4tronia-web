export const Layout = {
  screen: { w: 1366, h: 688 },
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
    x: 305,
    y: 486,
    w: 285,
    h: 20,
  },
  hpBar: {
    x: 1057 - 285,
    y: 486,
    w: 285,
    h: 20,
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
    rows: 3,
    columns: 5,
    rowSeparation: 13,
    cellWidth: 140,
    cellHeight: 125,
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

export const ThickFont = new PIXI.TextStyle({
  fontFamily: 'Helvetica',
  fontSize: 30,
  fill: 'white',
  fontWeight: 'bold',
  // stroke: 'white',
  // stroke: '#ff3300',
  // strokeThickness: 1,
  // dropShadow: true,
  // dropShadowColor: '#000000',
  // dropShadowBlur: 4,
  // dropShadowAngle: Math.PI / 6,
  // dropShadowDistance: 6,
});

export const ThinFont = new PIXI.TextStyle({
  fontFamily: 'Helvetica',
  fontSize: 14,
  fill: 'white',
  // fontWeight: 'bold'
  // stroke: 'white',
  // stroke: '#ff3300',
  // strokeThickness: 1,
  // dropShadow: true,
  // dropShadowColor: '#000000',
  // dropShadowBlur: 4,
  // dropShadowAngle: Math.PI / 6,
  // dropShadowDistance: 6,
});
