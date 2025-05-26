import { area, columnCount, rowCount } from "./constants";

const pool = (): Int32Array[] =>
  new Array(area).fill(null).map(() => new Int32Array(2));

const makeGrid = (): Int8Array[] =>
  new Array(columnCount).fill(null).map(() => new Int8Array(rowCount));

export const grid = makeGrid();
export const makePool = pool();
export const killPool = pool();
export const procPool = pool();

export const state = {
  t: 0,
  running: false,
  cancel: 0,
  toMake: 0,
  toKill: 0,
  toProc: 0,
  targetFrameTime: 1000,
  targetFrameStep: 0,
};
