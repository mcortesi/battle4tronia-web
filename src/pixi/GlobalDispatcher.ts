import { BoostChoice, LineChoice } from '../model/base';
import { ClientSpinResult } from '../model/game';
import { GlobalStats, PlayerStats, Player, Battle } from '../model/api';

export interface HowToPlayActions {
  nextHowToPlaySlide(): void;
  prevHowToPlaySlide(): void;
}

export interface UIEvents {
  playerUpdated(player: Player): void;
  closeAddMoreModal(): void;
  closeCashOutModal(): void;
  setGlobalStats(stats: GlobalStats): void;
  setPlayerStats(stats: PlayerStats): void;
  startSpinning(tronium: number): void;
  endSpinning(result: ClientSpinResult): void;
  resetBattle(battle: Battle): void;
  canBetWithCurrentBalance(isEnough: boolean): void;
  setBoostChoice(boostChoice: BoostChoice): void;
  setAttackChoice(attackChoice: LineChoice): void;
}

export interface ModelActions {
  requestConnect(): void;
  requestBattle(): void;
  requestSpin(): void;
  requestNameChange(name: string): void;
  requestBuyTronium(amount: number): void;
  requestSellTronium(amount: number): void;
  exitBattle(): void;
  openAddMoreModal(): void;
  openCashOutModal(): void;
  showHowToPlay(): void;
}

export interface LoadScreenActions {
  setLoadPercentage(x: number): void;
  bgLoaded(): void;
  fontsLoaded(): void;
}

type ArgumentsType<T> = T extends (...args: infer A) => any ? A : never;

type AllActions = HowToPlayActions | LoadScreenActions | ModelActions | UIEvents;

export class GlobalDispatcher
  implements HowToPlayActions, LoadScreenActions, UIEvents, ModelActions {
  private howToPlayListeners: HowToPlayActions[] = [];
  private loadScreenListeners: LoadScreenActions[] = [];
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
    this.fireEvent(this.modelListeners, 'showHowToPlay');
  }

  nextHowToPlaySlide(): void {
    this.fireEvent(this.howToPlayListeners, 'nextHowToPlaySlide');
  }
  prevHowToPlaySlide(): void {
    this.fireEvent(this.howToPlayListeners, 'prevHowToPlaySlide');
  }

  startSpinning(tronium: number): void {
    this.fireEvent(this.uiEventsListeners, 'startSpinning', tronium);
  }
  endSpinning(result: ClientSpinResult): void {
    this.fireEvent(this.uiEventsListeners, 'endSpinning', result);
  }
  resetBattle(battle: Battle): void {
    this.fireEvent(this.uiEventsListeners, 'resetBattle', battle);
  }
  canBetWithCurrentBalance(isEnough: boolean): void {
    this.fireEvent(this.uiEventsListeners, 'canBetWithCurrentBalance', isEnough);
  }

  setBoostChoice(boostChoice: BoostChoice): void {
    this.fireEvent(this.uiEventsListeners, 'setBoostChoice', boostChoice);
  }

  setAttackChoice(attackChoice: LineChoice): void {
    this.fireEvent(this.uiEventsListeners, 'setAttackChoice', attackChoice);
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
  requestNameChange(name: string): void {
    this.fireEvent(this.modelListeners, 'requestNameChange', name);
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
