import { SpinResult } from '../model/api';
import { BoostChoice, LineChoice } from '../model/base';

export interface HowToPlayActions {
  showHowToPlay(): void;
  hideHowToPlay(): void;
  nextHowToPlaySlide(): void;
  prevHowToPlaySlide(): void;
}

export interface TitleScreenActions {
  setGeneralStats(): void;
}

export interface HomeScreenActions {
  setPlayerStats(): void;
}

export interface BattleScreenActions {
  startSpinning(tronium: number): void;
  endSpinning(result: SpinResult): void;
}

export interface BattleModelActions {
  setBoostChoice(boostChoice: BoostChoice): void;
  setAttackChoice(attackChoice: LineChoice): void;
}

export interface ModelActions {
  requestConnect(): void;
  requestBattle(): void;
  requestGeneralStats(): void;
  requestPlayerStats(): void;
  requestSpin(): void;
  exitBattle(): void;
}

export interface LoadScreenActions {
  setLoadPercentage(x: number): void;
  bgLoaded(): void;
  fontsLoaded(): void;
}

export interface SpinResult {
  newFame: number;
  newTronium: number;
  newScore: number;
  newVillainHP: number;
  moveResult: SpinResult;
}

type ArgumentsType<T> = T extends (...args: infer A) => any ? A : never;

type AllActions =
  | HowToPlayActions
  | TitleScreenActions
  | HomeScreenActions
  | BattleScreenActions
  | BattleModelActions
  | LoadScreenActions
  | ModelActions;

export class GlobalDispatcher
  implements
    HowToPlayActions,
    TitleScreenActions,
    HomeScreenActions,
    BattleModelActions,
    BattleScreenActions,
    LoadScreenActions,
    ModelActions {
  private howToPlayListeners: HowToPlayActions[] = [];
  private titleScreenListeners: TitleScreenActions[] = [];
  private loadScreenListeners: LoadScreenActions[] = [];
  private homeScreenListeners: HomeScreenActions[] = [];
  private battleScreenListeners: BattleScreenActions[] = [];
  private battleModelListeners: BattleModelActions[] = [];
  private modelListeners: ModelActions[] = [];

  registerForHowToPlay(listener: HowToPlayActions): () => void {
    this.howToPlayListeners.push(listener);
    return () => {
      this.howToPlayListeners = this.howToPlayListeners.filter(x => x !== listener);
    };
  }
  registerForLoadScreen(listener: LoadScreenActions): () => void {
    this.loadScreenListeners.push(listener);
    return () => {
      this.loadScreenListeners = this.loadScreenListeners.filter(x => x !== listener);
    };
  }
  registerForTitleScreen(listener: TitleScreenActions): () => void {
    this.titleScreenListeners.push(listener);
    return () => {
      this.titleScreenListeners = this.titleScreenListeners.filter(x => x !== listener);
    };
  }
  registerForHomeScreen(listener: HomeScreenActions): () => void {
    this.homeScreenListeners.push(listener);
    return () => {
      this.homeScreenListeners = this.homeScreenListeners.filter(x => x !== listener);
    };
  }
  registerForBattleScreen(listener: BattleScreenActions): () => void {
    this.battleScreenListeners.push(listener);
    return () => {
      this.battleScreenListeners = this.battleScreenListeners.filter(x => x !== listener);
    };
  }

  registerForBattleModel(listener: BattleModelActions): () => void {
    this.battleModelListeners.push(listener);
    return () => {
      this.battleModelListeners = this.battleModelListeners.filter(x => x !== listener);
    };
  }
  registerForModel(listener: ModelActions): () => void {
    this.modelListeners.push(listener);
    return () => {
      this.modelListeners = this.modelListeners.filter(x => x !== listener);
    };
  }

  showHowToPlay(): void {
    this.fireEvent(this.howToPlayListeners, 'showHowToPlay');
  }
  hideHowToPlay(): void {
    this.fireEvent(this.howToPlayListeners, 'hideHowToPlay');
  }
  nextHowToPlaySlide(): void {
    this.fireEvent(this.howToPlayListeners, 'nextHowToPlaySlide');
  }
  prevHowToPlaySlide(): void {
    this.fireEvent(this.howToPlayListeners, 'prevHowToPlaySlide');
  }

  startSpinning(tronium: number): void {
    this.fireEvent(this.battleScreenListeners, 'startSpinning', tronium);
  }
  endSpinning(result: SpinResult): void {
    this.fireEvent(this.battleScreenListeners, 'endSpinning', result);
  }
  setBoostChoice(boostChoice: BoostChoice): void {
    this.fireEvent(this.battleModelListeners, 'setBoostChoice', boostChoice);
  }
  setAttackChoice(attackChoice: LineChoice): void {
    this.fireEvent(this.battleModelListeners, 'setAttackChoice', attackChoice);
  }

  requestConnect(): void {
    this.fireEvent(this.modelListeners, 'requestConnect');
  }
  requestBattle(): void {
    this.fireEvent(this.modelListeners, 'requestBattle');
  }
  requestGeneralStats(): void {
    this.fireEvent(this.modelListeners, 'requestGeneralStats');
  }
  requestPlayerStats(): void {
    this.fireEvent(this.modelListeners, 'requestPlayerStats');
  }
  requestSpin(): void {
    this.fireEvent(this.modelListeners, 'requestSpin');
  }

  exitBattle(): void {
    this.fireEvent(this.modelListeners, 'exitBattle');
  }

  setPlayerStats(): void {
    this.fireEvent(this.homeScreenListeners, 'setPlayerStats');
  }

  setGeneralStats(): void {
    this.fireEvent(this.titleScreenListeners, 'setGeneralStats');
  }

  setLoadPercentage(x: number): void {
    this.fireEvent(this.loadScreenListeners, 'setLoadPercentage', x);
  }
  bgLoaded(): void {
    this.fireEvent(this.loadScreenListeners, 'bgLoaded');
  }
  fontsLoaded(): void {
    this.fireEvent(this.loadScreenListeners, 'fontsLoaded');
  }

  private fireEvent<A extends AllActions, K extends keyof A>(
    listeners: A[],
    name: K,
    ...args: ArgumentsType<A[K]>
  ) {
    listeners.forEach(x => {
      (x[name] as any).apply(x, args);
    });
  }
}
