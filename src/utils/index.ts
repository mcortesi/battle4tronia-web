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
