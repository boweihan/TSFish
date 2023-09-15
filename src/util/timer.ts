export type Timings = {
  generateMove: number;
  makeMove: number;
  undoMove: number;
  pawnMove: number;
  pawnAttack: number;
  knightMove: number;
  bishopMove: number;
  rookMove: number;
  queenMove: number;
  kingMove: number;
  legalMoves: number;
  isCheck: number;
};

export type Timing = keyof Timings;

const defaultTimings = {
  generateMove: 0,
  makeMove: 0,
  undoMove: 0,
  pawnMove: 0,
  pawnAttack: 0,
  knightMove: 0,
  bishopMove: 0,
  rookMove: 0,
  queenMove: 0,
  kingMove: 0,
  legalMoves: 0,
  isCheck: 0,
};

const defaultCounts = {
  generateMove: 0,
  makeMove: 0,
  undoMove: 0,
  pawnMove: 0,
  pawnAttack: 0,
  knightMove: 0,
  bishopMove: 0,
  rookMove: 0,
  queenMove: 0,
  kingMove: 0,
  legalMoves: 0,
  isCheck: 0,
};

class Timer {
  private static instance: Timer;

  private timings: Timings;

  private counts: Timings;

  constructor() {
    this.timings = { ...defaultTimings };
    this.counts = { ...defaultCounts };
  }

  public static getInstance(): Timer {
    if (!Timer.instance) {
      Timer.instance = new Timer();
    }

    return Timer.instance;
  }

  public time(prop: Timing, func: Function) {
    const start = performance.now();

    const result = func();

    const end = performance.now();
    const time = end - start;

    this.timings[prop] += time;
    this.counts[prop] += 1;

    return result;
  }

  public reset() {
    this.timings = { ...defaultTimings };
    this.counts = { ...defaultCounts };
  }

  public print() {
    console.log(this.timings, this.counts);
  }
}

export default Timer.getInstance();
