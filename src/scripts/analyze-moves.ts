import { winningsFor, Move } from '../model/reel';
import { Bet } from '../model/model';
import { genArray } from '../utils';

function spin(bet: Bet) {
  const lineResults = genArray(bet.lines, () => Math.random());
  const winnings = winningsFor(bet, lineResults.map(x => Move.fromDice(x)));
  return winnings;
}

// @ts-ignore
function runRTPSimulation(name: string, iterations: number, bet: Bet) {
  const loopData = {
    wins: 0,
    totalPayout: 0,
    totalCost: 0,
  };

  console.time(name);
  for (let i = 1; i <= iterations; i++) {
    const betCost = bet.lines * bet.tronium * bet.level;
    const winnings = spin(bet);

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

  console.timeEnd(name);
  console.log(JSON.stringify(results, null, 2));
}

// @ts-ignore
function runPlayerSimulation(
  iterations: number,
  initialBalance: number,
  bet: Bet,
  maxSpins: number
) {
  const loopData = {
    totalBalance: 0,
    totalBalance2: 0,
    totalSpins: 0,
    totalSpins2: 0,
    canKeepPlaying: 0,
    wonMoney: 0,
  };
  const name = `SIM: maxspins: ${maxSpins} startsWith: ${initialBalance} bets: ${bet.tronium} x ${
    bet.lines
  }`;
  console.time(name);
  for (let i = 1; i <= iterations; i++) {
    let balance = initialBalance;
    let spins = 0;
    const betCost = bet.lines * bet.tronium * bet.level;
    while (balance >= betCost && spins !== maxSpins) {
      spins++;
      const winnings = spin(bet);
      balance += winnings.payout - betCost;
    }
    loopData.totalBalance += balance;
    loopData.totalBalance2 += balance * balance;
    loopData.totalSpins += spins;
    loopData.totalSpins2 += spins * spins;
    loopData.wonMoney += balance > initialBalance ? 1 : 0;
    loopData.canKeepPlaying += spins === maxSpins ? 1 : 0;
  }

  const avgBalance = loopData.totalBalance / iterations;
  const avgSpins = loopData.totalSpins / iterations;
  const results = {
    dvtBalance: Math.sqrt(loopData.totalBalance2 / iterations - avgBalance * avgBalance).toFixed(2),
    avgBalance: avgBalance.toFixed(2),
    avgSpins,
    dvtSpins: Math.sqrt(loopData.totalSpins2 / iterations - avgSpins * avgSpins).toFixed(2),
    probCanKeepPlaying: (loopData.canKeepPlaying / iterations) * 100,
    probWonMoney: (loopData.wonMoney / iterations) * 100,
    probBankrupt: (1 - loopData.canKeepPlaying / iterations) * 100,
  };

  console.timeEnd(name);
  console.log(JSON.stringify(results, null, 2));
}

const Samples = 1e4;

// runRTPSimulation('bet 10x1', Samples, { lines: 1, tronium: 10, level: 1 });
// runRTPSimulation('bet 10x1', Samples * 3, { lines: 1, tronium: 10, level: 1 });
// runRTPSimulation('bet 10x3', Samples, { lines: 3, tronium: 10, level: 1 });

const simBet: Bet = { lines: 2, tronium: 10, level: 1 };
// runPlayerSimulation(Samples, 500, { lines: 3, tronium: 10, level: 1 }, 1000);
// runPlayerSimulation(Samples, 500, { lines: 1, tronium: 10, level: 1 }, 1000);
// runPlayerSimulation(Samples, 1000, { lines: 3, tronium: 10, level: 1 }, 1000);
// runPlayerSimulation(Samples, 1000, { lines: 1, tronium: 10, level: 1 }, 1000);

// runPlayerSimulation(Samples, 1000, simBet, 50);
// runPlayerSimulation(Samples, 1000, simBet, 100);
runPlayerSimulation(Samples, 100, simBet, 100000);
runPlayerSimulation(Samples, 500, simBet, 100000);
runPlayerSimulation(Samples, 1000, simBet, 100000);
runPlayerSimulation(Samples, 2000, simBet, 100000);

// runPlayerSimulation(Samples, 500, simBet, 50);
// runPlayerSimulation(Samples, 500, simBet, 100);
// runPlayerSimulation(Samples, 500, simBet, 1000);

// runPlayerSimulation(Samples, 1000, { lines: 3, tronium: 10, level: 1 }, 100);
// runPlayerSimulation(Samples, 1000, { lines: 1, tronium: 10, level: 1 }, 100);
