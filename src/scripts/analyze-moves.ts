import { winningsFor, Move } from '../model/reel';
import { Bet } from '../model/api';
import { genArray } from '../utils';

function runSimulation(name: string, iterations: number, bet: Bet) {
  const loopData = {
    wins: 0,
    totalPayout: 0,
    totalCost: 0,
  };

  console.time('simulation');
  for (let i = 1; i <= iterations; i++) {
    const lineResults = genArray(bet.lines, () => Math.random());
    const winnings = winningsFor(bet, lineResults.map(x => Move.fromDice(x)));
    const betCost = bet.lines * bet.tronium * bet.level;

    loopData.wins += winnings.payout > 0 ? 1 : 0;
    loopData.totalPayout += winnings.payout;
    loopData.totalCost += betCost;
  }

  const results = {
    winProb: loopData.wins / iterations,
    totalCost: loopData.totalCost,
    rtp: loopData.totalPayout / loopData.totalCost,
    endingBalance: loopData.totalPayout - loopData.totalCost,
  };

  console.timeEnd('simulation');
  console.log(JSON.stringify(results, null, 2));
}

const Samples = 1e7;
runSimulation('bet 10x1', Samples, { lines: 1, tronium: 10, level: 1 });
runSimulation('bet 10x1', Samples * 3, { lines: 1, tronium: 10, level: 1 });
// runSimulation('bet 10x2', Samples, { lines: 2, tronium: 10, level: 1 });
runSimulation('bet 10x3', Samples, { lines: 3, tronium: 10, level: 1 });
