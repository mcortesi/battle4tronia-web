// import * as React from 'react';
// import * as ReactDOM from 'react-dom';
// import { Provider } from 'react-redux';
// import App from './components/App';
// import { createAppStore } from './ducks/root';

import './styles.css';
import { BattleApp, loadAssets } from './pixi-app';

// const store = createAppStore();
// ReactDOM.render(
//   <Provider store={store}>
//     <App />
//   </Provider>,
//   document.getElementById('app')
// );

loadAssets(() => {
  const pixiApp = new BattleApp();
  pixiApp.start();
});
