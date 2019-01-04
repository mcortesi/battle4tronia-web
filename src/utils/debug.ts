export function debug(...args: any[]) {
  if ((window as any).TRONDEBUG) {
    console.log(...args);
  }
}
