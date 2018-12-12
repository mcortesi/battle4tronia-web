import { Layout, ThinFont, ThickFont } from './constants';

export interface ScoresUI {
  view: PIXI.Container;
  setFame: (x: number) => void;
  setTronium: (x: number) => void;
}
export function createScoreBox(initState: { fame: number; tronium: number }): ScoresUI {
  const container = new PIXI.Container();
  container.position.set(Layout.scoreBox.x, Layout.scoreBox.y);
  const trScore = createTroniumScore(initState.tronium);
  const fScore = createFameScore(initState.fame);
  container.addChild(trScore.view);
  container.addChild(fScore.view);

  fScore.view.y = Layout.scoreBox.fameY;

  return {
    view: container,
    setFame: fScore.setScore,
    setTronium: trScore.setScore,
  };
}

function createTroniumScore(value: number) {
  const container = new PIXI.Container();
  const score = new PIXI.Text(value.toString(), ThickFont);
  const label = new PIXI.Text('Tronium', ThinFont);
  const icon = new PIXI.Sprite(PIXI.loader.resources.icoTronium.texture);
  container.addChild(icon);
  container.addChild(score);
  container.addChild(label);

  // icon.scale.set(0.75, 0.75);
  score.position.set(Layout.scoreBox.textX, 0);
  label.position.set(Layout.scoreBox.textX, Layout.scoreBox.labelY);

  return {
    view: container,
    setScore: (x: number) => {
      score.text = x.toString();
    },
  };
}

function createFameScore(value: number) {
  const container = new PIXI.Container();
  const score = new PIXI.Text(value.toString(), ThickFont);
  const label = new PIXI.Text('Fame', ThinFont);
  const icon = new PIXI.Sprite(PIXI.loader.resources.icoFame.texture);
  container.addChild(icon);
  container.addChild(score);
  container.addChild(label);

  // icon.scale.set(0.75, 0.75);
  score.position.set(Layout.scoreBox.textX, 0);
  label.position.set(Layout.scoreBox.textX, Layout.scoreBox.labelY);

  return {
    view: container,
    setScore: (x: number) => {
      score.text = x.toString();
    },
  };
}
