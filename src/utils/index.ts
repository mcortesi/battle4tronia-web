export function shuffle<A>(a: A[]) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

export function cloneArr<A>(a: A[]) {
  return ([] as A[]).concat(a);
}

/**
 * Random integer in interval [from,to) (inclusives)
 */
export function rndInt(from: number, to: number) {
  return from + Math.floor(Math.random() * (to - from));
}

/**
 * Random integer in interval [from,to] (inclusives)
 */
export function rndElem<A>(elements: A[]): A {
  return elements[rndInt(0, elements.length)];
}

export function newArray<A>(n: number, f: A): A[] {
  const res: A[] = [];
  for (let i = 0; i < n; i++) {
    res.push(f);
  }
  return res;
}

export function genArray<A>(n: number, f: (i: number) => A): A[] {
  const res: A[] = [];
  for (let i = 0; i < n; i++) {
    res.push(f(i));
  }
  return res;
}

export function iter(n: number, f: (i: number) => void) {
  for (let i = 0; i < n; i++) {
    f(i);
  }
}

export function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function transpose<A>(matrix: A[][]): A[][] {
  const rows = matrix.length;
  const cols = matrix[0].length;

  const newMatrix: A[][] = [];
  for (let i = 0; i < cols; i++) {
    const xs: A[] = [];
    for (let j = 0; j < rows; j++) {
      xs.push(matrix[j][i]);
    }
    newMatrix.push(xs);
  }
  return newMatrix;
}

type AcquireFn = () => void;

export class Lock {
  private _isAcquired = false;
  private acquireQueue: AcquireFn[] = [];

  release() {
    this._isAcquired = false;
    if (this.acquireQueue.length > 0) {
      const first = this.acquireQueue.shift()!;
      first();
    }
  }

  get acquired() {
    return this._isAcquired;
  }

  acquire(): Promise<void> {
    if (this.acquired) {
      return new Promise(resolve => {
        this.acquireQueue.push(resolve);
      });
    } else {
      this._isAcquired = true;
      return Promise.resolve();
    }
  }
}
