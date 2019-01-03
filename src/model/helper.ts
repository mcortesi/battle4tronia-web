import { Winnings } from './reel';
import {
  MessagePlayerOpened,
  MessageDealerAccepted,
  MessagePlayerClosed,
  MessageType,
} from './utils';
import { Bet, Player } from './model';

export function createRandom(playerRandom: number, dealerRandomNumber: number): number {
  return (playerRandom + dealerRandomNumber) / (2 * 10000);
}

export function updatePlayer(player: Player, bet: Bet, winnings: Winnings): Player {
  const betCost = bet.lines * bet.tronium * bet.level;

  player.tronium += winnings.payout - betCost;
  player.fame += winnings.epicness;

  return player;
}

export function getNextRoundFromLastMessage(
  message: MessagePlayerOpened | MessageDealerAccepted | MessagePlayerClosed
): number {
  if (!message) {
    return 1;
  }
  switch (message.type) {
    case MessageType.PLAYER_OPENED: {
      return (message as MessagePlayerOpened).round + 1;
    }
    case MessageType.DELEAR_ACCEPTED: {
      return (message as MessageDealerAccepted).messagePlayerOpened.round + 1;
    }
    case MessageType.PLAYER_CLOSED: {
      return (message as MessagePlayerClosed).messageDealerAccepted.messagePlayerOpened.round + 1;
    }
  }
  return 1;
}
