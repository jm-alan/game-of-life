import { grid } from "./engine";
import { canvas, context } from "./canvas";
import { columnWidth, rowHeight } from "./constants";
import { faster, playPause, reset, slower } from "./controls";
import {
  changeTargetFrameTime,
  loop,
  proc,
  resetGrid,
  resetProc,
  stopRunning,
  toggleRunning,
  unProc,
} from "./utils";

canvas.addEventListener("click", (e) => {
  const x = ~~(e.clientX / columnWidth);
  const y = ~~(e.clientY / rowHeight);

  grid[x]![y]! ^= 0b00000001;

  if (grid[x]![y]! & 0b00000001) {
    proc(x, y);
  } else {
    unProc(x, y);
  }
});

reset!.addEventListener("click", () => {
  stopRunning();
  resetGrid();
  resetProc();
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  (reset as HTMLButtonElement).blur();
});

playPause!.addEventListener("click", () => {
  toggleRunning();
  (playPause as HTMLButtonElement).blur();
});

slower!.addEventListener("click", () => {
  changeTargetFrameTime(false);
  (slower as HTMLButtonElement).blur();
});

faster!.addEventListener("click", () => {
  changeTargetFrameTime(true);
  (faster as HTMLButtonElement).blur();
});

export const keyMap = {
  [" "]: toggleRunning,
  ["+"]() {
    changeTargetFrameTime(true);
  },
  ["-"]() {
    changeTargetFrameTime(false);
  },
} as Record<string, () => void>;

window.addEventListener("keydown", (e) => {
  if (e.key in keyMap) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    keyMap[e.key]!();
  }
});

requestAnimationFrame(loop);
