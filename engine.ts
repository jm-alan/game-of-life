import { context } from "./canvas";
import { scheduleSquare } from "./utils";
import {
  area,
  columnCount,
  fpsSteps,
  offColor,
  onColor,
  rowCount,
} from "./constants";

const makeGrid = (): number[][] =>
  new Array(columnCount).fill(null).map(() => new Array(rowCount).fill(0));

const grid = makeGrid();
const prev = makeGrid();

const pool = () =>
  new Array(area).fill(null).map(() => [0, 0] as [number, number]);

const msPerSecond = 1000;

export const engine = {
  context,
  t: 0,
  running: false,
  cancel: 0,
  toMake: 0,
  toKill: 0,
  toProc: 0,
  targetFrameTime: 1000,
  targetFrameStep: 0,
  makePool: pool(),
  killPool: pool(),
  procPool: pool(),
  grid,
  prev,
  changeTargetFrameTime(direction: boolean) {
    if (direction) {
      this.targetFrameStep = Math.min(
        this.targetFrameStep + 1,
        fpsSteps.length - 1
      );
    } else {
      this.targetFrameStep = Math.max(this.targetFrameStep - 1, 0);
    }

    this.targetFrameTime = msPerSecond / fpsSteps[this.targetFrameStep]!;
  },
  proc(x: number, y: number) {
    this.procPool[this.toProc]![0] = x;
    this.procPool[this.toProc]![1] = y;
    this.toProc++;
  },
  flip(x: number, y: number) {
    this.grid[x]![y] = 1 - this.grid[x]![y]!;
  },
  make(x: number, y: number) {
    this.makePool[this.toMake]![0] = x;
    this.makePool[this.toMake]![1] = y;
    this.toMake++;
  },
  kill(x: number, y: number) {
    this.killPool[this.toKill]![0] = x;
    this.killPool[this.toKill]![1] = y;
    this.toKill++;
  },
  step() {
    context.beginPath();
    context.fillStyle = offColor;
    for (let i = 0; i < this.toKill; i++) {
      scheduleSquare(this.killPool[i]![0], this.killPool[i]![1]);
      this.flip(this.killPool[i]![0], this.killPool[i]![1]);
    }
    context.fill();

    context.beginPath();
    context.fillStyle = onColor;
    for (let i = 0; i < this.toMake; i++) {
      scheduleSquare(this.makePool[i]![0], this.makePool[i]![1]);
      this.flip(this.makePool[i]![0], this.makePool[i]![1]);
    }
    context.fill();
  },
};
