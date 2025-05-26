import { context, scaleX, scaleY } from "./canvas";
import { grid, procPool, state } from "./engine";
import {
  columnCheckCeil,
  columnCount,
  columnIterCeil,
  columnWidth,
  fpsSteps,
  gridlineWidth,
  msPerSecond,
  onColor,
  plusOne,
  rowCheckCeil,
  rowCount,
  rowHeight,
  rowIterCeil,
  squareInteriorHeight,
  squareInteriorWidth,
} from "./constants";

function drawGrid() {
  context.clearRect(0, 0, scaleX(100), scaleY(100));
  context.beginPath();
  context.strokeStyle = "white";
  context.lineWidth = gridlineWidth;

  for (let i = 1; i < columnCount; i++) {
    const X = i * columnWidth;
    context.moveTo(X, 0);
    context.lineTo(X, scaleY(100));
  }

  for (let i = 1; i < rowCount; i++) {
    const Y = i * rowHeight;
    context.moveTo(0, Y);
    context.lineTo(scaleX(100), Y);
  }

  context.stroke();
}

drawGrid();

export const scheduleSquare = (x: number, y: number) =>
  context.rect(
    x * columnWidth + gridlineWidth,
    y * rowHeight + gridlineWidth,
    squareInteriorWidth,
    squareInteriorHeight
  );

export const drawSquare = (x: number, y: number) =>
  context.fillRect(
    x + gridlineWidth,
    y + gridlineWidth,
    squareInteriorWidth,
    squareInteriorHeight
  );

export const sumCenterTopWall = (x: number): number =>
  grid[x - 1]![0]! +
  grid[x - 1]![1]! +
  grid[x]![1]! +
  grid[x + 1]![1]! +
  grid[x + 1]![0]!;

export const sumCenterBottomWall = (x: number): number =>
  grid[x - 1]![rowIterCeil]! +
  grid[x - 1]![rowCheckCeil]! +
  grid[x]![rowCheckCeil]! +
  grid[x + 1]![rowCheckCeil]! +
  grid[x]![rowIterCeil]!;

export const sumLeftWall = (y: number): number =>
  grid[0]![y - 1]! +
  grid[1]![y - 1]! +
  grid[1]![y]! +
  grid[1]![y + 1]! +
  grid[0]![y + 1]!;

export const sumRightWall = (y: number) =>
  grid[columnIterCeil]![y - 1]! +
  grid[columnCheckCeil]![y - 1]! +
  grid[columnCheckCeil]![y]! +
  grid[columnCheckCeil]![y + 1]! +
  grid[columnIterCeil]![y + 1]!;

export const sumCoords = (x: number, y: number): number =>
  grid[x - 1]![y - 1]! +
  grid[x]![y - 1]! +
  grid[x + 1]![y - 1]! +
  grid[x + 1]![y]! +
  grid[x + 1]![y + 1]! +
  grid[x]![y + 1]! +
  grid[x - 1]![y + 1]! +
  grid[x - 1]![y]!;

export function changeTargetFrameTime(direction: boolean) {
  if (direction) {
    state.targetFrameStep = Math.min(
      state.targetFrameStep + 1,
      fpsSteps.length - 1
    );
  } else {
    state.targetFrameStep = Math.max(state.targetFrameStep - 1, 0);
  }

  state.targetFrameTime = msPerSecond / fpsSteps[state.targetFrameStep]!;
}

export function proc(x: number, y: number) {
  procPool[state.toProc]![0] = x;
  procPool[state.toProc]![1] = y;
  state.toProc++;
}

function proc0() {
  for (let i = 0; i < state.toProc; i++) {
    const [x, y] = procPool[i]!;
    if (x! > 0) {
      grid[x! - 1]![y!]! += plusOne;
      if (y! > 0) {
        grid[x! - 1]![y! - 1]! += plusOne;
      }
      if (y! < rowIterCeil) {
        grid[x! - 1]![y! + 1]! += plusOne;
      }
    }
    if (x! < columnIterCeil) {
      grid[x! + 1]![y!]! += plusOne;
      if (y! > 0) {
        grid[x! + 1]![y! - 1]! += plusOne;
      }
      if (y! < rowIterCeil) {
        grid[x! + 1]![y! + 1]! += plusOne;
      }
    }
    if (y! > 0) {
      grid[x!]![y! - 1]! += plusOne;
    }
    if (y! < rowIterCeil) {
      grid[x!]![y! + 1]! += plusOne;
    }
  }

  state.toProc = 0;
}

let pv = 0b00000000;

function proc1() {
  drawGrid();
  context.beginPath();
  context.fillStyle = onColor;

  for (let i = 0; i < columnCount; i++) {
    for (let j = 0; j < rowCount; j++) {
      pv = grid[i]![j]!;
      grid[i]![j] = 0;
      if ((pv & 0b11111110) === 0b00000110 || pv === 0b00000101) {
        scheduleSquare(i, j);
        proc(i, j);
        grid[i]![j] = 0b00000001;
      }
    }
  }

  context.fill();
}

export function loop(t: number) {
  state.cancel = requestAnimationFrame(loop);
  if (!state.running || t - state.t < state.targetFrameTime) {
    return;
  }

  state.t = t;

  proc0();
  proc1();

  state.toMake = 0;
  state.toKill = 0;
}
