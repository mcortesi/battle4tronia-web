import { GlobalDispatcher } from './pixi/GlobalDispatcher';
import { Orchestrator } from './pixi/Orchestrator';
import { AssetLoader } from './pixi/AssetLoader';
import { API, GameApi } from './model/api';
import { FakeApi } from './model/FakeApi';
import { GameStatus } from './model/model';
import { GameClient } from './model/game';
import { Config } from './config';

export async function startApp() {
  let api: API;
  if (Config.fake && Config.logged) {
    api = new FakeApi();
  } else if (Config.fake) {
    api = new FakeApi(GameStatus.NO_CHANNEL_OPENED, true);
  } else {
    api = new GameApi();
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
