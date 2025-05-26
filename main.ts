import { grid } from "./engine";
import { canvas, context } from "./canvas";
import { faster, playPause, reset, slower } from "./controls";
import { columnWidth, rowHeight } from "./constants";
import {
  changeTargetFrameTime,
  draw,
  loop,
  proc,
  resetGrid,
  resetProc,
  stopRunning,
  toggleRunning,
} from "./utils";

canvas.addEventListener("click", (e) => {
  const columnMod = ~~(e.clientX / columnWidth);
  const rowMod = ~~(e.clientY / rowHeight);

  grid[columnMod]![rowMod]! ^= 0b00000001;

  draw();

  proc(columnMod, rowMod);
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
    keyMap[e.key]!();
  }
});

requestAnimationFrame(loop);
