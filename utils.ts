import { context } from "./canvas";
import { playPause } from "./controls";
import { grid, procCache, procPool, state } from "./engine";
import {
  columnCount,
  columnIterCeil,
  columnWidth,
  fpsSteps,
  maskNeighbors,
  msPerSecond,
  onColor,
  plusOne,
  rowCount,
  rowHeight,
  rowIterCeil,
  threeNeighbors,
  twoNeighborsRetain,
} from "./constants";

export function resetGrid() {
  for (let x = 0; x < columnCount; x++) {
    for (let y = 0; y < rowCount; y++) {
      grid[x]![y] = 0b00000000;
    }
  }
}

export function resetProc() {
  state.toProc = 0;
  for (let x = 0; x < columnCount; x++) {
    for (let y = 0; y < rowCount; y++) {
      procCache[x]![y] = -1;
    }
  }
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
  const cacheIdx = procCache[x]![y]!;

  if (cacheIdx >= 0) {
    return;
  }

  procPool[state.toProc]![0] = x;
  procPool[state.toProc]![1] = y;
  procCache[x]![y] = state.toProc;
  state.toProc++;
}

export function unProc(x: number, y: number) {
  const cacheIdx = procCache[x]![y]!;

  if (cacheIdx === -1) {
    return;
  }

  [procPool[cacheIdx], procPool[state.toProc - 1]] = [
    procPool[state.toProc - 1]!,
    procPool[cacheIdx]!,
  ];
  procCache[x]![y] = -1;
  state.toProc--;
}

let pv = 0b00000000;

function reassignNextFrame() {
  state.nextFrame = new Promise(step);
}

let now = performance.now();

function step(res: () => void) {
  for (let i = 0; i < state.toProc; i++) {
    const [x, y] = procPool[i]!;
    procCache[x!]![y!] = -1;

    if (x! > 0) {
      grid[x! - 1]![y!]! += plusOne;

      if (y! > 0) {
        grid[x! - 1]![y! - 1]! += plusOne;
      } else {
        grid[x! - 1]![rowIterCeil]! += plusOne;
      }

      if (y! < rowIterCeil) {
        grid[x! - 1]![y! + 1]! += plusOne;
      } else {
        grid[x! - 1]![0]! += plusOne;
      }
    } else {
      grid[columnIterCeil]![y!]! += plusOne;

      if (y! > 0) {
        grid[columnIterCeil]![y! - 1]! += plusOne;
      } else {
        grid[columnIterCeil]![rowIterCeil]! += plusOne;
      }

      if (y! < rowIterCeil) {
        grid[columnIterCeil]![y! + 1]! += plusOne;
      } else {
        grid[columnIterCeil]![0]! += plusOne;
      }
    }

    if (x! < columnIterCeil) {
      grid[x! + 1]![y!]! += plusOne;

      if (y! > 0) {
        grid[x! + 1]![y! - 1]! += plusOne;
      } else {
        grid[x! + 1]![rowIterCeil]! += plusOne;
      }

      if (y! < rowIterCeil) {
        grid[x! + 1]![y! + 1]! += plusOne;
      } else {
        grid[x! + 1]![0]! += plusOne;
      }
    } else {
      grid[0]![y!]! += plusOne;

      if (y! > 0) {
        grid[0]![y! - 1]! += plusOne;
      } else {
        grid[0]![rowIterCeil]! += plusOne;
      }

      if (y! < rowIterCeil) {
        grid[0]![y! + 1]! += plusOne;
      } else {
        grid[0]![0]! += plusOne;
      }
    }

    if (y! > 0) {
      grid[x!]![y! - 1]! += plusOne;
    } else {
      grid[x!]![rowIterCeil]! += plusOne;
    }
    if (y! < rowIterCeil) {
      grid[x!]![y! + 1]! += plusOne;
    } else {
      grid[x!]![0]! += plusOne;
    }
  }

  state.toProc = 0;

  for (let x = 0; x < columnCount; x++) {
    for (let y = 0; y < rowCount; y++) {
      pv = grid[x]![y]!;
      grid[x]![y] = 0;
      if (
        (pv & maskNeighbors) === threeNeighbors ||
        pv === twoNeighborsRetain
      ) {
        proc(x, y);
        grid[x]![y] = 0b00000001;
      }
    }
  }

  res();
  now = performance.now();
  state.frameTimeout = setTimeout(
    reassignNextFrame,
    state.targetFrameTime - (now - state.lastFrame)
  );
  state.lastFrame = now;
}

context.fillStyle = onColor;

function triggerInterval() {
  clearTimeout(state.frameTimeout);
  if (!state.running) {
    state.nextFrame = new Promise<void>((res) => res());
    return;
  }
  state.nextFrame = new Promise(step);
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

let start = 0;
let middle = 0;
let end = 0;

context.font = "20px monospace";

let iterX = 0;
let iterY = 0;

export async function loop(t: number) {
  state.cancel = requestAnimationFrame(loop);
  if (t - state.t < 16.666) {
    return;
  }

  state.t = t;

  start = performance.now();
  await state.nextFrame;
  middle = performance.now();

  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  context.beginPath();
  for (iterX = 0; iterX < columnCount; iterX++) {
    for (iterY = 0; iterY < rowCount; iterY++) {
      if ((grid[iterX]![iterY]! & 0b00000001) === 0b00000001) {
        context.rect(
          iterX * columnWidth,
          iterY * rowHeight,
          columnWidth,
          rowHeight
        );
      }
    }
  }
  context.fill();

  end = performance.now();

  context.fillText(`C ${(middle - start).toFixed(6)}ms`, 0, 20);
  context.fillText(`G ${(end - middle).toFixed(6)}ms`, 0, 40);
  context.fillText(`T ${(end - start).toFixed(6)}ms`, 0, 60);
}
