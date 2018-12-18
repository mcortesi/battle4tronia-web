// import * as React from 'react';
// import * as ReactDOM from 'react-dom';
// import { Provider } from 'react-redux';
// import App from './components/App';
// import { createAppStore } from './ducks/root';

import './styles.css';
import { GlobalDispatcher } from './pixi/actions';
import { MainManager } from './pixi/main';
import { ResourceManager } from './pixi/ResourceManager';

// const store = createAppStore();
// ReactDOM.render(
//   <Provider store={store}>
//     <App />
//   </Provider>,
//   document.getElementById('app')
// );

export async function startApp() {
  const gd = new GlobalDispatcher();
  // @ts-ignore
  const mainManager = new MainManager(gd);
  const rm = new ResourceManager(gd);

  gd.enterLoading();
  await rm.loadAll();
  gd.enterTitle();
}

startApp().catch(err => {
  console.error('booom', err);
});
