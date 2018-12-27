import { BoostChoice, LineChoice } from '../model/base';
import { ClientSpinResult } from '../model/game';
import { GlobalStats, PlayerStats, Player, Battle } from '../model/api';

export interface HowToPlayActions {
  showHowToPlay(): void;
  hideHowToPlay(): void;
  nextHowToPlaySlide(): void;
  prevHowToPlaySlide(): void;
}

export interface UIEvents {
  playerUpdated(player: Player): void;
  closeAddMoreModal(): void;
  closeCashOutModal(): void;
  setGlobalStats(stats: GlobalStats): void;
  setPlayerStats(stats: PlayerStats): void;
}

export interface BattleScreenActions {
  startSpinning(tronium: number): void;
  endSpinning(result: ClientSpinResult): void;
  resetBattle(battle: Battle): void;
  canBetWithCurrentBalance(isEnough: boolean): void;
}

export interface BattleModelActions {
  setBoostChoice(boostChoice: BoostChoice): void;
  setAttackChoice(attackChoice: LineChoice): void;
}

export interface ModelActions {
  requestConnect(): void;
  requestBattle(): void;
  requestSpin(): void;
  requestBuyTronium(amount: number): void;
  requestSellTronium(amount: number): void;
  exitBattle(): void;
  openAddMoreModal(): void;
  openCashOutModal(): void;
}

export interface LoadScreenActions {
  setLoadPercentage(x: number): void;
  bgLoaded(): void;
  fontsLoaded(): void;
}

type ArgumentsType<T> = T extends (...args: infer A) => any ? A : never;

type AllActions =
  | HowToPlayActions
  | BattleScreenActions
  | BattleModelActions
  | LoadScreenActions
  | ModelActions
  | UIEvents;

export class GlobalDispatcher
  implements
    HowToPlayActions,
    BattleModelActions,
    BattleScreenActions,
    LoadScreenActions,
    UIEvents,
    ModelActions {
  private howToPlayListeners: HowToPlayActions[] = [];
  private loadScreenListeners: LoadScreenActions[] = [];
  private battleScreenListeners: BattleScreenActions[] = [];
  private battleModelListeners: BattleModelActions[] = [];
  private modelListeners: ModelActions[] = [];
  private uiEventsListeners: Array<Partial<UIEvents>> = [];

  registerForUIEvents(listener: Partial<UIEvents>): () => void {
    this.uiEventsListeners.push(listener);
    return () => {
      this.uiEventsListeners = this.uiEventsListeners.filter(x => x !== listener);
    };
  }

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

  playerUpdated(player: Player): void {
    this.fireEvent(this.uiEventsListeners, 'playerUpdated', player);
  }

  closeAddMoreModal(): void {
    this.fireEvent(this.uiEventsListeners, 'closeAddMoreModal');
  }

  closeCashOutModal(): void {
    this.fireEvent(this.uiEventsListeners, 'closeCashOutModal');
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
  endSpinning(result: ClientSpinResult): void {
    this.fireEvent(this.battleScreenListeners, 'endSpinning', result);
  }
  resetBattle(battle: Battle): void {
    this.fireEvent(this.battleScreenListeners, 'resetBattle', battle);
  }
  canBetWithCurrentBalance(isEnough: boolean): void {
    this.fireEvent(this.battleScreenListeners, 'canBetWithCurrentBalance', isEnough);
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
  requestSpin(): void {
    this.fireEvent(this.modelListeners, 'requestSpin');
  }
  requestBuyTronium(amount: number): void {
    this.fireEvent(this.modelListeners, 'requestBuyTronium', amount);
  }
  requestSellTronium(amount: number): void {
    this.fireEvent(this.modelListeners, 'requestSellTronium', amount);
  }

  exitBattle(): void {
    this.fireEvent(this.modelListeners, 'exitBattle');
  }
  openAddMoreModal(): void {
    this.fireEvent(this.modelListeners, 'openAddMoreModal');
  }

  openCashOutModal(): void {
    this.fireEvent(this.modelListeners, 'openCashOutModal');
  }

  setPlayerStats(stats: PlayerStats): void {
    this.fireEvent(this.uiEventsListeners, 'setPlayerStats', stats);
  }

  setGlobalStats(stats: GlobalStats): void {
    this.fireEvent(this.uiEventsListeners, 'setGlobalStats', stats);
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
    listeners: Array<Partial<A>>,
    name: K,
    ...args: ArgumentsType<A[K]>
  ) {
    listeners.forEach(x => {
      if (name in x) {
        (x[name] as any).apply(x, args);
      }
    });
  }
}
