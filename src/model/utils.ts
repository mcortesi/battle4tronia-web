import { Address, Battle, Player, Bet, GlobalStats, PlayerStats } from './model';
// @ts-ignore
import * as bs58check from 'bs58check';
// @ts-ignore
import * as ethjswallet from 'ethereumjs-wallet';
// @ts-ignore
import * as ethjsutil from 'ethereumjs-util';
// @ts-ignore
import * as abi from 'ethereumjs-abi';
import fetch from 'cross-fetch';
import { ethers } from 'ethers';

export interface Channel {
  playerAddress: Address;
  channelId: number;
  publicKey: string;
}
export interface Wallet {
  privateKey: string;
  publicKey: string;
}

export interface Signature {
  r: string;
  s: string;
  v: number;
}

export const enum MessageType {
  PLAYER_OPENED = 'PLAYER_OPENED',
  DELEAR_ACCEPTED = 'DELEAR_ACCEPTED',
  PLAYER_CLOSED = 'PLAYER_CLOSED',
}

export interface Message {
  playerAddress: Address;
  channelId: number;
  round: number;
  publicKey: string;
  type: MessageType;
}

export interface Signed {
  signature: Signature;
}

export interface MessagePlayerOpened extends Message, Signed {
  bet: Bet;
  player: Player;
  playerRandomHash1: Signature;
  playerRandomHash2: Signature;
  playerRandomHash3: Signature;
}

export interface MessageDealerAccepted extends Signed {
  messagePlayerOpened: MessagePlayerOpened;
  type: MessageType;
  dealerRandomNumber1: number;
  dealerRandomNumber2: number;
  dealerRandomNumber3: number;
}

export interface MessagePlayerClosed extends Signed {
  messageDealerAccepted: MessageDealerAccepted;
  type: MessageType;
  playerUpdated: Player;
  playerRandomNumber1: number;
  playerRandomNumber2: number;
  playerRandomNumber3: number;
}

export interface MessageDelearClosed {
  player: Player;
  battle: Battle;
}

const config = {
  delearAddress: 'TPL66VK2gCXNCD7EJg9pgJRfqcRazjhUZY',
  battleForTroniaAddress: 'THgLbHhQ3fHXmBAHou4pNRVgp1RBfxW41x',
  apiDomain: 'http://192.168.1.176:8000/api/v1/',
  apiPlayerEndpoint: 'player/',
  apiGetBattleEndpoint: 'battle/',
  apiGetLastMessageEndpoint: 'message/',
  apiPostMessagePlayerOpenedEndpoint: 'message/opened',
  apiPostMessagePlayerClosedEndpoint: 'message/closed',
  apiRequestCloseEndpoint: 'channel/close/',
  apiRequestCloseOpenEndpoint: 'channel/closeopen/',
  apiGetGlobalStatsEndpoint: 'stats/global',
  apiGetPlayerStatsEndpoint: 'stats/player/',
};

///////////////////////////////////////////// GET GENERAL INFO

export function getDealearAddress() {
  return config.delearAddress;
}

export function getBalance(tronWeb: any, address: any): Promise<number> {
  return tronWeb.trx.getBalance(address.base58);
}

export async function getBattle(playerAddress: Address): Promise<null | Battle> {
  const res = await fetch(config.apiDomain + config.apiGetBattleEndpoint + playerAddress);
  if (res.ok) {
    const battle = await res.json();
    return battle;
  }
  return null;
}

export async function getServerLastMessage(
  playerAddress: Address
): Promise<null | MessagePlayerOpened | MessageDealerAccepted | MessagePlayerClosed> {
  const res = await fetch(config.apiDomain + config.apiGetLastMessageEndpoint + playerAddress);
  if (res.ok) {
    const message = await res.json();
    return message;
  }
  return null;
}

export async function getTroniumPrice(tronWeb: any): Promise<number> {
  const tx = await tronWeb.transactionBuilder.triggerSmartContract(
    tronWeb.address.toHex(config.battleForTroniaAddress),
    'getTroniumPrice()',
    30000,
    0,
    []
  );
  const decoded = decodeParameters(['uint'], tx.constant_result[0]);
  if (decoded[0]) {
    return parseInt(decoded[0], 10) / 1000;
  } else {
    throw new Error('Error getting price from contract');
  }
}

///////////////  CHANNELS //////////////////////

export async function getCurrentChannel(tronWeb: any): Promise<Channel | null> {
  const address = tronWeb.defaultAddress;
  const tx = await tronWeb.transactionBuilder.triggerSmartContract(
    tronWeb.address.toHex(config.battleForTroniaAddress),
    'getChannel(address)',
    30000,
    0,
    [{ type: 'address', value: addressToEVMAddress(address.base58) }]
  );

  const decoded = decodeParameters(['uint', 'uint', 'address'], tx.constant_result[0]);
  const channelId = decoded[0];
  // const tronium = decoded[2];
  const publicKey = decoded[2];

  if (channelId.toString() !== '0') {
    return {
      playerAddress: address.base58,
      channelId: parseInt(channelId.toString(), 10),
      publicKey,
    };
  } else {
    return null;
  }
}

export async function openChannel(tronWeb: any, trx: number, publicKey: string): Promise<Channel> {
  return new Promise<Channel>((resolve, reject) => {
    tronWeb.transactionBuilder.triggerSmartContract(
      tronWeb.address.toHex(config.battleForTroniaAddress),
      'openChannel(address)',
      30000000,
      trx * 1000000,
      [{ type: 'address', value: publicKey }],
      async (err: string, res: any) => {
        if (err) {
          console.log(err);
          return reject(null);
        }
        const signedTransaction = await tronWeb.trx.sign(res.transaction);

        tronWeb.trx.sendRawTransaction(
          signedTransaction,
          async (sendError: string, result: any) => {
            if (sendError) {
              console.log(sendError);
              return reject(null);
            }

            const txInfo = await waitForTx(signedTransaction.txID, 1800000, tronWeb);

            if (!txInfo.receipt || txInfo.receipt.result !== 'SUCCESS') {
              return reject('There was a problem approving the transaction');
            } else {
              const channel = await getCurrentChannel(tronWeb);
              resolve(channel!);
            }
          }
        );
      }
    );
  });
}

export async function requestCloseAndOpenChannel(
  playerAddress: Address,
  channelId: number,
  tronium: number,
  publicKey: string
) {
  const resp = await fetch(config.apiDomain + config.apiRequestCloseOpenEndpoint + playerAddress, {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channelId,
      tronium,
      publicKey,
    }),
  });
  if (resp.status >= 400) {
    throw new Error('error');
  }

  const signedMsg = await resp.json();
  return signedMsg;
}

export async function closeOpenChannel(
  tronWeb: any,
  tronium: number,
  publicKey: string,
  trx: number,
  v: number,
  r: string,
  s: string
): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    tronWeb.transactionBuilder.triggerSmartContract(
      tronWeb.address.toHex(config.battleForTroniaAddress),
      'closeAndOpenChannel(uint256,address,uint8,bytes32,bytes32)',
      30000000,
      trx * 1000000,
      [
        { type: 'uint256', value: tronium },
        { type: 'address', value: publicKey },
        { type: 'uint8', value: v },
        { type: 'bytes32', value: '0x' + r },
        { type: 'bytes32', value: '0x' + s },
      ],
      async (err: string, res: any) => {
        if (err) {
          console.log(err);
          return reject(false);
        }
        const signedTransaction = await tronWeb.trx.sign(res.transaction);

        tronWeb.trx.sendRawTransaction(
          signedTransaction,
          async (sendError: string, result: any) => {
            if (sendError) {
              console.log(sendError);
              return resolve(false);
            }

            const txInfo = await waitForTx(signedTransaction.txID, 1800000, tronWeb);

            console.log(txInfo);

            if (!txInfo.receipt || txInfo.receipt.result !== 'SUCCESS') {
              return resolve(false);
            } else {
              resolve(true);
            }
          }
        );
      }
    );
  });
}

export async function requestCloseChannel(
  playerAddress: Address,
  channelId: number,
  tronium: number
) {
  const resp = await fetch(config.apiDomain + config.apiRequestCloseEndpoint + playerAddress, {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channelId,
      tronium,
    }),
  });
  if (resp.status >= 400) {
    throw new Error('error');
  }

  const signedMsg = await resp.json();
  return signedMsg;
}

export async function closeChannel(
  tronWeb: any,
  tronium: number,
  v: number,
  r: string,
  s: string
): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    tronWeb.transactionBuilder.triggerSmartContract(
      tronWeb.address.toHex(config.battleForTroniaAddress),
      'closeChannel(uint256,uint8,bytes32,bytes32)',
      30000000,
      0,
      [
        { type: 'uint256', value: tronium },
        { type: 'uint8', value: v },
        { type: 'bytes32', value: '0x' + r },
        { type: 'bytes32', value: '0x' + s },
      ],
      async (err: string, res: any) => {
        if (err) {
          console.log(err);
          return reject(false);
        }
        const signedTransaction = await tronWeb.trx.sign(res.transaction);

        tronWeb.trx.sendRawTransaction(
          signedTransaction,
          async (sendError: string, result: any) => {
            if (sendError) {
              console.log(sendError);
              return resolve(false);
            }

            const txInfo = await waitForTx(signedTransaction.txID, 1800000, tronWeb);

            console.log(txInfo);

            if (!txInfo.receipt || txInfo.receipt.result !== 'SUCCESS') {
              return resolve(false);
            } else {
              resolve(true);
            }
          }
        );
      }
    );
  });
}

///////////////////////////////////////////// WALLET AND SIGN

function createWallet(): Wallet {
  const ethWallet = ethjswallet.generate();

  const wallet = {
    privateKey: ethWallet.getPrivateKeyString(),
    publicKey: EVMAddressToAddress(ethWallet.getAddressString()),
  };
  setWallet(wallet);
  return wallet;
}

export function signMessage(message: string, privKey: string): Signature {
  const hashedMsg = ethjsutil.sha256(message);
  const rsv = ethjsutil.ecsign(hashedMsg, new Buffer(privKey.substr(2), 'hex'));
  return {
    r: rsv.r.toString('hex'),
    s: rsv.s.toString('hex'),
    v: rsv.v,
  };
}

export function recoverSignatureAddress(message: string, signature: Signature) {
  const hashedMsg = ethjsutil.sha256(message);
  const publicKey = ethjsutil.ecrecover(
    hashedMsg,
    signature.v,
    new Buffer(signature.r, 'hex'),
    new Buffer(signature.s, 'hex')
  );
  const addressBuffer = ethjsutil.pubToAddress(publicKey);
  const address = ethjsutil.bufferToHex(addressBuffer);
  return address;
}

export function signHash(hashedMsg: Buffer): Signature {
  const rsv = ethjsutil.ecsign(hashedMsg, new Buffer(getWallet().privateKey.substr(2), 'hex'));
  return {
    r: rsv.r.toString('hex'),
    s: rsv.s.toString('hex'),
    v: rsv.v,
  };
}

export function recoverSignatureAddressFromHash(hashedMsg: Buffer, signature: Signature) {
  const publicKey = ethjsutil.ecrecover(
    hashedMsg,
    signature.v,
    new Buffer(signature.r, 'hex'),
    new Buffer(signature.s, 'hex')
  );
  const addressBuffer = ethjsutil.pubToAddress(publicKey);
  const address = ethjsutil.bufferToHex(addressBuffer);
  return address;
}

function setWallet(wallet: Wallet) {
  localStorage.setItem('wallet', JSON.stringify(wallet));
}

export function getWallet(newWallet: boolean = false): Wallet {
  const wallet = localStorage.getItem('wallet');
  if (!wallet || newWallet) {
    return createWallet();
  }
  return JSON.parse(wallet);
}

export async function getLocalLastMessage() {
  return localStorage.getItem('lastMessage');
}

///////////////////////////////////////////////// PLAYER

export async function getPlayer(playerAddress: Address): Promise<null | Player> {
  const res = await fetch(config.apiDomain + config.apiPlayerEndpoint + playerAddress);
  if (res.ok) {
    const player = await res.json();
    return player;
  }
  return null;
}

export async function updatePlayerName(playerAddress: Address, name: string): Promise<Player> {
  const resp = await fetch(config.apiDomain + config.apiPlayerEndpoint + playerAddress, {
    method: 'put',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });
  if (resp.status >= 400) {
    throw new Error('error');
  }

  const player = await resp.json();
  return player;
}

// -------------------------- BET --------------------------------------------------

export function getOpenBetMessageHash(
  playerAddress: Address,
  playerTronium: number,
  channelId: number,
  round: number,
  publicKey: Address,
  betLevel: number,
  betTronium: number,
  betLines: number,
  playerRandomHashes: Buffer
): Buffer {
  return abi.soliditySHA256(
    [
      'address',
      'address',
      'uint256',
      'uint256',
      'uint256',
      'address',
      'uint256',
      'uint256',
      'uint256',
      'bytes32',
    ],
    [
      addressToEVMAddress(config.battleForTroniaAddress),
      addressToEVMAddress(playerAddress),
      playerTronium,
      channelId,
      round,
      addressToEVMAddress(publicKey),
      betLevel,
      betTronium,
      betLines,
      playerRandomHashes,
    ]
  );
}

export function getPlayerRandomHash(
  playerRandomHash1_v: number,
  playerRandomHash1_r: string,
  playerRandomHash1_s: string,
  playerRandomHash2_v: number,
  playerRandomHash2_r: string,
  playerRandomHash2_s: string,
  playerRandomHash3_v: number,
  playerRandomHash3_r: string,
  playerRandomHash3_s: string
): Buffer {
  return abi.soliditySHA256(
    ['uint8', 'bytes32', 'bytes32', 'uint8', 'bytes32', 'bytes32', 'uint8', 'bytes32', 'bytes32'],
    [
      playerRandomHash1_v,
      Buffer.from(playerRandomHash1_r, 'hex'),
      Buffer.from(playerRandomHash1_s, 'hex'),
      playerRandomHash2_v,
      Buffer.from(playerRandomHash2_r, 'hex'),
      Buffer.from(playerRandomHash2_s, 'hex'),
      playerRandomHash3_v,
      Buffer.from(playerRandomHash3_r, 'hex'),
      Buffer.from(playerRandomHash3_s, 'hex'),
    ]
  );
}

export function getAcceptedBetMessageHash(
  playerAddress: Address,
  playerTronium: number,
  channelId: number,
  round: number,
  publicKey: Address,
  betLevel: number,
  betTronium: number,
  betLines: number,
  playerRandomHashes: Buffer,
  delearNumberHashes: Buffer
): Buffer {
  return abi.soliditySHA256(
    [
      'address',
      'address',
      'uint256',
      'uint256',
      'uint256',
      'address',
      'uint256',
      'uint256',
      'uint256',
      'bytes32',
      'bytes32',
    ],
    [
      addressToEVMAddress(config.battleForTroniaAddress),
      addressToEVMAddress(playerAddress),
      playerTronium,
      channelId,
      round,
      addressToEVMAddress(publicKey),
      betLevel,
      betTronium,
      betLines,
      playerRandomHashes,
      delearNumberHashes,
    ]
  );
}

export function getDelearNumberHash(random1: number, random2: number, random3: number): Buffer {
  return abi.soliditySHA256(['uint256', 'uint256', 'uint256'], [random1, random2, random3]);
}

export async function openBet(message: MessagePlayerOpened): Promise<MessageDealerAccepted> {
  const resp = await fetch(config.apiDomain + config.apiPostMessagePlayerOpenedEndpoint, {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
  if (resp.status >= 400) {
    throw new Error('error');
  }

  const dealerMessage = await resp.json();
  return dealerMessage;
}

export async function closeBet(message: MessagePlayerClosed): Promise<MessageDelearClosed> {
  const resp = await fetch(config.apiDomain + config.apiPostMessagePlayerClosedEndpoint, {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
  if (resp.status >= 400) {
    throw new Error('error');
  }

  const dealerMessage = await resp.json();
  return dealerMessage;
}

// ------------ UTILS -----------------------------------------------

export function isValidAddress(addr: Address) {
  return addr.length === 34 && addr.indexOf('T') === 0;
}

export function isHexAddress(addr: string) {
  return addr.length === 42 && addr.indexOf('41') === 0;
}

export function addressToHex(str: string): string {
  if (isHexAddress(str)) {
    return str;
  } else {
    return bs58check.decode(str).toString('hex');
  }
}

export function hexToAddress(str: string): Address {
  // tslint:disable-next-line:no-bitwise
  if (str.length < 2 || (str.length & 1) !== 0) {
    throw new Error(`Invalid hex string: ${str}`);
  }
  return bs58check.encode(Buffer.from(str, 'hex'));
}

export function addressToEVMAddress(addr: Address) {
  return '0x' + addressToHex(addr).slice(2);
  // return ensure0xPrefix(addressToHex(addr));
}

export function EVMAddressToAddress(evmAddress: string) {
  // return hexToAddress('41' + remove0x(evmAddress));
  return hexToAddress('41' + evmAddress.slice(2));
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function pollTimeout<A>(
  poller: () => Promise<{ ok: boolean; value?: A }>,
  timeout: number,
  pollWait: number
) {
  const timeoutDate = Date.now() + timeout;

  while (Date.now() < timeoutDate) {
    const res = await poller();
    if (res.ok) {
      return res.value!;
    }

    if (Date.now() + pollWait >= timeoutDate) {
      break;
    }
    await wait(pollWait);
  }
  throw new Error(`Timeout: after ${timeout} ms`);
}

export async function waitForTx(tx: string, timeout: number = 5000, tronWeb: any): Promise<any> {
  return pollTimeout(
    async () => {
      const txInfo = await tronWeb.trx.getTransactionInfo(tx);
      if (txInfo != null && txInfo.id) {
        return { ok: true, value: txInfo };
      } else {
        return { ok: false };
      }
    },
    timeout,
    Math.min(timeout / 10, 500)
  );
}

export function ensure0xPrefix(str: string) {
  if (str.slice(0, 2) === '0x') {
    return str;
  } else {
    return '0x' + str;
  }
}

export function remove0x(hexStr: string) {
  return ensure0xPrefix(hexStr).replace(/^(0x)/, '');
}

export function encodeParameters(types: string[], values: any[]) {
  // @ts-ignore
  const coder = new ethers.utils.AbiCoder();

  values = values.map(
    (value, idx) => (types[idx] === 'address' ? addressToEVMAddress(value) : value)
  );
  return remove0x(coder.encode(types, values));
}

export function decodeParameters(types: string[], encodedData: string) {
  // @ts-ignore
  const coder = new ethers.utils.AbiCoder();
  let values = coder.decode(types, '0x' + encodedData);

  values = values.map(
    (value: any, idx: any) => (types[idx] === 'address' ? EVMAddressToAddress(value) : value)
  );

  return values;
}

/////////////////// STATS ///////////////

export async function getGlobalStats(): Promise<null | GlobalStats> {
  const res = await fetch(config.apiDomain + config.apiGetGlobalStatsEndpoint);
  if (res.ok) {
    const message = await res.json();
    return message;
  }
  return null;
}

export async function getPlayerStats(playerAddress: Address): Promise<null | PlayerStats> {
  const res = await fetch(config.apiDomain + config.apiGetPlayerStatsEndpoint + playerAddress);
  if (res.ok) {
    const message = await res.json();
    return message;
  }
  return null;
}
