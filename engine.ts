import { area, columnCount, rowCount } from "./constants";

const pool = (): Int32Array[] =>
  new Array(area).fill(null).map(() => new Int32Array(2));

export const grid = new Array(columnCount)
  .fill(null)
  .map(() => new Int8Array(rowCount));
export const procPool = pool();

export const state = {
  t: 0,
  interval: setTimeout(() => {}),
  running: false,
  cancel: 0,
  toMake: 0,
  toKill: 0,
  toProc: 0,
  targetFrameTime: 1000,
  targetFrameStep: 0,
  nextFrame: new Promise<number>((res) => res(0)),
};
