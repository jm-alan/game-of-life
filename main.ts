import { grid, state } from "./engine";
import { canvas, context } from "./canvas";
import { columnWidth, offColor, onColor, rowHeight } from "./constants";
import { changeTargetFrameTime, drawSquare, loop, proc } from "./utils";

canvas.addEventListener("click", (e) => {
  const columnMod = ~~(e.clientX / columnWidth);
  const rowMod = ~~(e.clientY / rowHeight);

  const value = grid[columnMod]![rowMod]!;
  grid[columnMod]![rowMod]! ^= 0b00000001;
  context.fillStyle = value ? offColor : onColor;
  drawSquare(columnMod * columnWidth, rowMod * rowHeight);

  proc(columnMod, rowMod);
});

export const keyMap = {
  [" "]() {
    state.running = !state.running;
  },
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
