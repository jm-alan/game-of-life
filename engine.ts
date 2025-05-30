import {
  area,
  columnCount,
  fpsSteps,
  msPerSecond,
  rowCount,
} from "./constants";

const pool = (): Uint32Array[] =>
  new Array(area).fill(null).map(() => new Uint32Array(2));

export const procPool = pool();
export const grid = new Array(columnCount)
  .fill(null)
  .map(() => new Uint8Array(rowCount));
export const procCache = new Array(columnCount)
  .fill(null)
  .map(() => new Int32Array(rowCount).fill(-1));

const targetFrameStep = ~~fpsSteps.findIndex((step) => step === 5);
const targetFrameTime = msPerSecond / fpsSteps[targetFrameStep]!;

export const state = {
  t: 0,
  running: false,
  cancel: 0,
  toMake: 0,
  toKill: 0,
  toProc: 0,
  targetFrameStep,
  targetFrameTime,
  frameTimeout: setTimeout(() => {}),
  lastFrame: performance.now(),
  nextFrame: new Promise<void>((res) => res()),
};
