export class BoostChoice {
  static ALL: BoostChoice[] = [
    new BoostChoice('Normal', 10),
    new BoostChoice('Strong', 50),
    new BoostChoice('Max Effort', 100),
  ];

  static DEFAULT = BoostChoice.ALL[0];
  static indexOf = (c: BoostChoice) => BoostChoice.ALL.indexOf(c);
  static fromIdx = (i: number) => BoostChoice.ALL[i];

  private constructor(public readonly label: string, public readonly value: number) {}
}

export class LineChoice {
  static ALL: LineChoice[] = [
    new LineChoice('Front', 1),
    new LineChoice('Flanks', 2),
    new LineChoice('All', 3),
  ];

  static DEFAULT = LineChoice.ALL[0];
  static indexOf = (c: LineChoice) => LineChoice.ALL.indexOf(c);
  static fromIdx = (i: number) => LineChoice.ALL[i];

  private constructor(public readonly label: string, public readonly value: number) {}
}
