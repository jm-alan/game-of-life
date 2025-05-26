import { context } from "./canvas";
import { playPause } from "./controls";
import { grid, procPool, state } from "./engine";
import {
  columnCount,
  columnIterCeil,
  columnWidth,
  fpsSteps,
  gridlineWidth,
  msPerSecond,
  onColor,
  plusOne,
  rowCount,
  rowHeight,
  rowIterCeil,
  squareInteriorHeight,
  squareInteriorWidth,
} from "./constants";

const scheduleSquare = (x: number, y: number) =>
  context.rect(
    x * columnWidth + gridlineWidth,
    y * rowHeight + gridlineWidth,
    squareInteriorWidth,
    squareInteriorHeight
  );

function reassignNextFrame() {
  state.nextFrame = new Promise(step);
}

export function resetGrid() {
  for (let i = 0; i < columnCount; i++) {
    for (let j = 0; j < rowCount; j++) {
      grid[i]![j] = 0b00000000;
    }
  }
}

export function resetProc() {
  state.toProc = 0;
}

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
  triggerInterval();
}

export function proc(x: number, y: number) {
  procPool[state.toProc]![0] = x;
  procPool[state.toProc]![1] = y;
  state.toProc++;
}

export function step(res: (v: number) => void) {
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

  for (let i = 0; i < columnCount; i++) {
    for (let j = 0; j < rowCount; j++) {
      pv = grid[i]![j]!;
      grid[i]![j] = 0;
      if ((pv & 0b11111110) === 0b00000110 || pv === 0b00000101) {
        proc(i, j);
        grid[i]![j] = 0b00000001;
      }
    }
  }

  res(performance.now());
}

context.fillStyle = onColor;

export function draw() {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  context.beginPath();
  for (let i = 0; i < columnCount; i++) {
    for (let j = 0; j < rowCount; j++) {
      if ((grid[i]![j]! & 0b00000001) === 0b00000001) {
        scheduleSquare(i, j);
      }
    }
  }
  context.fill();
}

function triggerInterval() {
  clearInterval(state.interval);
  if (!state.running) {
    return;
  }
  state.interval = setInterval(reassignNextFrame, state.targetFrameTime);
}

export function stopRunning() {
  state.running = false;
  playPause!.innerHTML = "Play";
  triggerInterval();
}

function startRunning() {
  state.running = true;
  playPause!.innerHTML = "Pause";
  triggerInterval();
}

export function toggleRunning() {
  if (state.running) {
    stopRunning();
  } else {
    startRunning();
  }
}

let pv = 0b00000000;

let start = 0;
let end = 0;

context.font = "20px Arial";

export async function loop(t: number) {
  state.cancel = requestAnimationFrame(loop);
  if (t - state.t < 16.666) {
    return;
  }

  state.t = t;

  start = performance.now();

  draw();

  end = performance.now();
  context.fillText(`${(end - start).toFixed(6)}ms`, 30, 30);
}
