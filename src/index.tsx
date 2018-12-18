// import * as React from 'react';
// import * as ReactDOM from 'react-dom';
// import { Provider } from 'react-redux';
// import App from './components/App';
// import { createAppStore } from './ducks/root';

import './styles.css';
import { GlobalDispatcher } from './pixi/GlobalDispatcher';
import { Orchestrator } from './pixi/Orchestrator';
import { AssetLoader } from './pixi/AssetLoader';
import { FakeApi } from './model/api';
import { GameClient } from './model/game';

// const store = createAppStore();
// ReactDOM.render(
//   <Provider store={store}>
//     <App />
//   </Provider>,
//   document.getElementById('app')
// );

export async function startApp() {
  const gameClient = new GameClient(new FakeApi());
  const gd = new GlobalDispatcher();
  const rm = new AssetLoader(gd);
  const orchestrator = new Orchestrator(gd, gameClient, rm);
  await orchestrator.start();
}

startApp().catch(err => {
  console.error('booom', err);
});
