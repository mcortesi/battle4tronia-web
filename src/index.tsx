import { GlobalDispatcher } from './pixi/GlobalDispatcher';
import { Orchestrator } from './pixi/Orchestrator';
import { AssetLoader } from './pixi/AssetLoader';
import { FakeApi, API, GameStatus } from './model/api';
import { GameClient } from './model/game';

export async function startApp() {
  let api: API;
  if (window.location.hash === '#papu') {
    api = new FakeApi();
  } else if (window.location.hash === '#notpapu') {
    api = new FakeApi(GameStatus.NO_CHANNEL_OPENED, true);
  } else {
    api = new FakeApi();
  }

  const gameClient = new GameClient(api);
  const gd = new GlobalDispatcher();
  const rm = new AssetLoader(gd);
  const orchestrator = new Orchestrator(gd, gameClient, rm);
  await orchestrator.start();
}

startApp().catch(err => {
  console.error('booom', err);
});
