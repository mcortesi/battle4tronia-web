import * as utils from './utils';
import * as game from './helper';
import { Move, winningsFor } from './reel';
import { GameStatus, Battle, Bet, SpinResult, Player, PlayerStats, GlobalStats } from './model';

export interface API {
  /**
   * Need to check this constantly (every x sec) to proactively check for errors
   */
  getStatus(): Promise<GameStatus>;

  openChannel(tronium: number): Promise<boolean>;

  spin(bet: Bet): Promise<SpinResult>;

  addTronium(tronium: number): Promise<boolean>;

  getPlayer(): Promise<Player | null>;

  updatePlayerName(name: string): Promise<Player>;

  getCurrentBattle(): Promise<Battle>;

  closeChannel(): Promise<boolean>;

  getGlobalStats(): Promise<GlobalStats>;

  getPlayerStats(): Promise<PlayerStats>;

  getTroniumPrice(): Promise<number>;
}

export class GameApi implements API {
  private channel: null | utils.Channel;
  private player: null | Player;
  private battle: null | Battle;
  private address: null | string;
  private addressChangeEventSet: boolean = false;
  private emptyBattle = {
    playerName: '',
    epicness: 0,
    troniums: 0,
    seconds: 0,
  };

  async getTroniumPrice(): Promise<number> {
    // TODO: ask for the price after checking that TronLink is installed
    /*const tronWeb = (window as any).tronWeb;
    if(!tronWeb || !tronWeb.ready) {
      throw new Error('TronLink not installed');
    }
    return utils.getTroniumPrice(tronWeb);*/
    return 1.5;
  }

  async getPlayer(): Promise<null | Player> {
    const tronWeb = (window as any).tronWeb;
    if (!tronWeb || !tronWeb.ready) {
      return null;
    }
    const address = tronWeb.defaultAddress.base58;
    const player = await utils.getPlayer(address);
    return player;
  }

  async getCurrentBattle(): Promise<Battle> {
    const tronWeb = (window as any).tronWeb;
    if (!tronWeb || !tronWeb.ready) {
      throw new Error('No battle');
    }
    const address = tronWeb.defaultAddress.base58;
    const battle = await utils.getBattle(address);
    if (!battle) {
      throw new Error('No battle');
    }
    return battle;
  }

  reload() {
    const tronWeb = (window as any).tronWeb;
    const address = tronWeb.defaultAddress.base58;
    if (this.address && this.address !== address) {
      (window as any).location.reload();
    } else {
      this.address = address;
    }
  }

  async getStatus(): Promise<GameStatus> {
    // Checks if everything is correct (conencted, has credit, has a privateKey, etc.)
    const tronWeb = (window as any).tronWeb;

    // 1) Checked tronlink installed
    if (!tronWeb) {
      return GameStatus.INSTALL_TRONLINK;
    }
    // 2) Checked tronlink loggedin
    if (!tronWeb.ready) {
      return GameStatus.LOGIN_TRONLINK;
    }

    if (!this.addressChangeEventSet) {
      const that = this;
      tronWeb.on('addressChanged', () => {
        that.reload();
      });
      this.addressChangeEventSet = true;
    }

    const address = tronWeb.defaultAddress.base58;
    // 3) Checked if player has an open channel
    try {
      this.channel = await utils.getCurrentChannel(tronWeb);
      this.player = await utils.getPlayer(address);
      this.battle = await utils.getBattle(address);

      console.log(this.channel);
      console.log(this.player);
      console.log(this.battle);

      if (!this.channel) {
        // No channel opened
        return GameStatus.NO_CHANNEL_OPENED;
      } else {
        // If channel opened, check same public key
        const wallet = utils.getWallet();
        if (this.channel.publicKey !== wallet.publicKey) {
          // No channel opened
          return GameStatus.UNKNOWN_CHANNEL_OPENED;
        }
      }
    } catch (error) {
      console.log(error);
      return GameStatus.ERROR;
    }

    const trxBalance = await utils.getBalance(tronWeb, address);
    if (trxBalance === 0) {
      return GameStatus.NOT_ENOUGH_BALANCE;
    }

    return GameStatus.READY;
  }

  async openChannel(tronium: number): Promise<boolean> {
    const status = await this.getStatus();
    if (status === GameStatus.NO_CHANNEL_OPENED || status === GameStatus.UNKNOWN_CHANNEL_OPENED) {
      const tronWeb = (window as any).tronWeb;
      const address = tronWeb.defaultAddress.base58;
      const wallet = utils.getWallet();
      try {
        switch (status) {
          case GameStatus.NO_CHANNEL_OPENED: {
            const price = await utils.getTroniumPrice(tronWeb);
            const trx = tronium * price;
            this.channel = await utils.openChannel(tronWeb, trx, wallet.publicKey);
            break;
          }
          case GameStatus.UNKNOWN_CHANNEL_OPENED: {
            // TODO this.channel = await utils.closeOpenChannel(tronWeb, tronium, wallet.publicKey);
            break;
          }
        }
        this.player = await utils.getPlayer(address);
        this.battle = await utils.getBattle(address);
        return true;
      } catch (err) {
        console.log(err);
        return false;
      }
    } else {
      return false;
    }
  }

  async updatePlayerName(name: string): Promise<Player> {
    const tronWeb = (window as any).tronWeb;
    const address = tronWeb.defaultAddress.base58;

    return utils.updatePlayerName(address, name);
  }

  async spin(bet: Bet): Promise<SpinResult> {
    const tronWeb = (window as any).tronWeb;
    const address = tronWeb.defaultAddress.base58;

    // TODO: compare to last message bet
    // const lastLocalBet = utils.getLocalLastMessage();
    const lastServerBet = await utils.getServerLastMessage(address);

    const round = game.getNextRoundFromLastMessage(lastServerBet!);

    const playerRandom1 = Math.random() * 10000;
    const playerRandom2 = Math.random() * 10000;
    const playerRandom3 = Math.random() * 10000;

    const wallet = utils.getWallet();
    const playerRandomHash1 = utils.signMessage(playerRandom1.toString(), wallet.privateKey);
    const playerRandomHash2 = utils.signMessage(playerRandom2.toString(), wallet.privateKey);
    const playerRandomHash3 = utils.signMessage(playerRandom3.toString(), wallet.privateKey);

    const messagePlayerOpened = {
      playerAddress: address,
      channelId: this.channel ? this.channel.channelId : 0,
      round,
      publicKey: wallet.publicKey,
      bet,
      player: this.player!,
      type: utils.MessageType.PLAYER_OPENED,
      playerRandomHash1,
      playerRandomHash2,
      playerRandomHash3,
    };

    const hashOpen = utils.getOpenBetMessageHash(
      messagePlayerOpened.playerAddress,
      messagePlayerOpened.player.tronium,
      messagePlayerOpened.channelId,
      messagePlayerOpened.round,
      messagePlayerOpened.publicKey,
      messagePlayerOpened.bet.level,
      messagePlayerOpened.bet.tronium,
      messagePlayerOpened.bet.lines,
      utils.getPlayerRandomHash(
        messagePlayerOpened.playerRandomHash1.v,
        messagePlayerOpened.playerRandomHash1.r,
        messagePlayerOpened.playerRandomHash1.s,
        messagePlayerOpened.playerRandomHash2.v,
        messagePlayerOpened.playerRandomHash2.r,
        messagePlayerOpened.playerRandomHash2.s,
        messagePlayerOpened.playerRandomHash3.v,
        messagePlayerOpened.playerRandomHash3.r,
        messagePlayerOpened.playerRandomHash3.s
      )
    );

    const signatureForMessagePlayerOpened = utils.signHash(hashOpen);

    /*if(lastServerBet && lastServerBet.type == "DELEAR_ACCEPTED") {
      //There is a bet not closed
      lastServerBet
    }*/

    const messagePlayerOpenedSigned: utils.MessagePlayerOpened = Object.assign(
      messagePlayerOpened,
      {
        signature: signatureForMessagePlayerOpened,
      }
    );

    const messageDealerAccepted: utils.MessageDealerAccepted = await utils.openBet(
      messagePlayerOpenedSigned
    );

    // Check message validity
    const delearSignature = messageDealerAccepted.signature;
    // Removes player signature
    delete messageDealerAccepted.signature;

    // Check valid signature
    const hashAccepted = utils.getAcceptedBetMessageHash(
      messagePlayerOpened.playerAddress,
      messagePlayerOpened.player.tronium,
      messagePlayerOpened.channelId,
      messagePlayerOpened.round,
      messagePlayerOpened.publicKey,
      messagePlayerOpened.bet.level,
      messagePlayerOpened.bet.tronium,
      messagePlayerOpened.bet.lines,
      utils.getPlayerRandomHash(
        messagePlayerOpened.playerRandomHash1.v,
        messagePlayerOpened.playerRandomHash1.r,
        messagePlayerOpened.playerRandomHash1.s,
        messagePlayerOpened.playerRandomHash2.v,
        messagePlayerOpened.playerRandomHash2.r,
        messagePlayerOpened.playerRandomHash2.s,
        messagePlayerOpened.playerRandomHash3.v,
        messagePlayerOpened.playerRandomHash3.r,
        messagePlayerOpened.playerRandomHash3.s
      ),
      utils.getDelearNumberHash(
        messageDealerAccepted.dealerRandomNumber1,
        messageDealerAccepted.dealerRandomNumber2,
        messageDealerAccepted.dealerRandomNumber3
      )
    );
    const signerEVMAddress = utils.recoverSignatureAddressFromHash(hashAccepted, delearSignature);
    const signerAddress = utils.EVMAddressToAddress(signerEVMAddress);
    // Adds player signature back
    messageDealerAccepted.signature = delearSignature;

    if (signerAddress !== utils.getDealearAddress()) {
      throw new Error('Invalid message signature');
    }

    // Check if signed message is equal to open open
    if (
      JSON.stringify(messagePlayerOpenedSigned) !==
      JSON.stringify(messageDealerAccepted.messagePlayerOpened)
    ) {
      throw new Error('Invalid open player message in delear accepted message');
    }

    let finalRandom1: number;
    let finalRandom2: null | number = null;
    let finalRandom3: null | number = null;
    const lineResults: number[] = [];

    finalRandom1 = game.createRandom(playerRandom1, messageDealerAccepted.dealerRandomNumber1);
    lineResults.push(finalRandom1);

    if (messagePlayerOpenedSigned.bet.lines > 1) {
      finalRandom2 = game.createRandom(playerRandom1, messageDealerAccepted.dealerRandomNumber2);
      lineResults.push(finalRandom2);
    }

    if (messagePlayerOpenedSigned.bet.lines > 2) {
      finalRandom3 = game.createRandom(playerRandom1, messageDealerAccepted.dealerRandomNumber3);
      lineResults.push(finalRandom3);
    }

    const winnings = winningsFor(bet, lineResults.map(x => Move.fromDice(x)));
    const playerUpdated = game.updatePlayer(this.player!, messagePlayerOpenedSigned.bet, winnings);

    const messagePlayerClosed = {
      messageDealerAccepted,
      playerUpdated,
      playerRandomNumber1: playerRandom1,
      playerRandomNumber2: playerRandom2,
      playerRandomNumber3: playerRandom3,
      type: utils.MessageType.PLAYER_CLOSED,
    };

    // No need to hash with abi format, we can use simple stringify
    const signatureForMessagePlayerClosed = utils.signMessage(
      JSON.stringify(messagePlayerClosed),
      wallet.privateKey
    );
    const messagePlayerClosedSigned: utils.MessagePlayerClosed = Object.assign(
      messagePlayerClosed,
      {
        signature: signatureForMessagePlayerClosed,
      }
    );

    const resp = await utils.closeBet(messagePlayerClosedSigned);

    this.player = resp.player;
    this.battle = resp.battle;

    // TODO:  compare that server returns correct player

    const spinResult = {
      player: this.player!,
      bet: messagePlayerOpenedSigned.bet,
      result: [finalRandom1, finalRandom2, finalRandom3].filter(el => el !== null) as any,
      currentBattle: this.battle,
    };

    return spinResult;
  }

  async addTronium(tronium: number): Promise<boolean> {
    const status = await this.getStatus();
    if (status === GameStatus.READY) {
      const tronWeb = (window as any).tronWeb;
      const address = tronWeb.defaultAddress.base58;
      const wallet = utils.getWallet();
      let result = await utils.requestCloseAndOpenChannel(
        address,
        this.channel!.channelId,
        this.player!.tronium,
        wallet.publicKey
      );
      if (!result) {
        return false;
      }
      const price = await utils.getTroniumPrice(tronWeb);
      const trx = tronium * price;
      result = await utils.closeOpenChannel(
        tronWeb,
        this.player!.tronium,
        wallet.publicKey,
        trx,
        result.v,
        result.r,
        result.s
      );
      if (!result) {
        return false;
      }
      this.channel = null;
      return true;
    } else {
      return false;
    }
  }

  async closeChannel(): Promise<boolean> {
    const status = await this.getStatus();
    if (status === GameStatus.READY) {
      const tronWeb = (window as any).tronWeb;
      const address = tronWeb.defaultAddress.base58;
      let result = await utils.requestCloseChannel(
        address,
        this.channel!.channelId,
        this.player!.tronium
      );
      if (!result) {
        return false;
      }
      result = await utils.closeChannel(
        tronWeb,
        this.player!.tronium,
        result.v,
        result.r,
        result.s
      );
      if (!result) {
        return false;
      }
      this.channel = null;
      return true;
    } else {
      return false;
    }
  }

  async getGlobalStats(): Promise<GlobalStats> {
    const stats = await utils.getGlobalStats();
    if (stats === null) {
      return {
        allTimeByEpicness: [],
        allTimeByTroniunm: [],
        villainsDefeated: 0,
        bestFightWeekByEpicness: this.emptyBattle,
        bestFightWeekByTroniunm: this.emptyBattle,
      };
    } else {
      if (!stats.bestFightWeekByEpicness) {
        stats.bestFightWeekByEpicness = this.emptyBattle;
      }
      if (!stats.bestFightWeekByTroniunm) {
        stats.bestFightWeekByTroniunm = this.emptyBattle;
      }
      return stats;
    }
  }

  async getPlayerStats(): Promise<PlayerStats> {
    const tronWeb = (window as any).tronWeb;
    const address = tronWeb.defaultAddress.base58;
    const stats = await utils.getPlayerStats(address);

    if (stats === null) {
      return {
        bestFightByEpicness: this.emptyBattle,
        bestFightByTroniums: this.emptyBattle,
        villainsDefeated: 0,
      };
    } else {
      if (!stats.bestFightByEpicness) {
        stats.bestFightByEpicness = this.emptyBattle;
      }
      if (!stats.bestFightByEpicness) {
        stats.bestFightByTroniums = this.emptyBattle;
      }
      return stats;
    }
  }
}
