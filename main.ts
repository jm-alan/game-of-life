import { canvas, context } from "./canvas";
import {
  columnIterCeil,
  columnWidth,
  offColor,
  onColor,
  rowHeight,
  rowIterCeil,
} from "./constants";
import { engine } from "./engine";
import {
  drawSquare,
  sumCenterBottomWall,
  sumCenterTopWall,
  sumCoords,
  sumLeftWall,
  sumRightWall,
} from "./utils";

canvas.addEventListener("click", (e) => {
  const columnMod = ~~(e.clientX / columnWidth);
  const rowMod = ~~(e.clientY / rowHeight);

  const value = engine.grid[columnMod]![rowMod]!;
  engine.flip(columnMod, rowMod);
  context.fillStyle = value ? offColor : onColor;
  drawSquare(columnMod * columnWidth, rowMod * rowHeight);
});

export const keyMap = {
  [" "]() {
    engine.running = !engine.running;
  },
  ["+"]() {
    engine.changeTargetFrameTime(true);
  },
  ["-"]() {
    engine.changeTargetFrameTime(false);
  },
} as Record<string, () => void>;

window.addEventListener("keydown", (e) => {
  if (e.key in keyMap) {
    keyMap[e.key]!();
  }
});

let sumCheck = 0;
let zeroRowIterCeil = 0;
let zeroRowIterMin1 = 0;
let oneRowIterCeil = 0;
let columnIterCeil0 = 0;
let columnIterCeil1 = 0;
let columnIterRowIter = 0;
let oneRowIterMinOne = 0;
let columnIterMinOneZero = 0;
let columnIterRowMinOne = 0;
let zeroZero = 0;
let zeroOne = 0;
let oneZero = 0;
let oneOne = 0;

const loop = (t: number) => {
  engine.cancel = requestAnimationFrame(loop);
  if (!engine.running || t - engine.t < engine.targetFrameTime) {
    return;
  }

  engine.t = t;

  zeroZero = engine.grid[0]![0]!;
  zeroOne = engine.grid[0]![1]!;
  oneZero = engine.grid[1]![0]!;
  oneOne = engine.grid[1]![1]!;
  zeroRowIterCeil = engine.grid[0]![rowIterCeil]!;
  zeroRowIterMin1 = engine.grid[0]![rowIterCeil - 1]!;
  oneRowIterCeil = engine.grid[1]![rowIterCeil]!;
  columnIterCeil0 = engine.grid[columnIterCeil]![0]!;
  columnIterCeil1 = engine.grid[columnIterCeil]![1]!;
  columnIterRowIter = engine.grid[columnIterCeil]![rowIterCeil]!;
  oneRowIterMinOne = engine.grid[1]![rowIterCeil - 1]!;
  columnIterMinOneZero = engine.grid[columnIterCeil - 1]![0]!;
  columnIterRowMinOne = engine.grid[columnIterCeil]![rowIterCeil - 1]!;

  if (zeroZero && zeroOne + oneZero + oneOne < 2) {
    engine.kill(0, 0);
  } else if (!zeroZero && zeroOne + oneZero + oneOne >= 2) {
    engine.make(0, 0);
  }

  if (
    zeroRowIterCeil &&
    zeroRowIterMin1 + oneRowIterCeil + oneRowIterMinOne < 2
  ) {
    engine.kill(0, rowIterCeil);
  } else if (
    !zeroRowIterCeil &&
    zeroRowIterMin1 + oneRowIterCeil + oneRowIterMinOne >= 2
  ) {
    engine.make(0, rowIterCeil);
  }

  if (
    columnIterCeil0 &&
    columnIterCeil1 +
      columnIterMinOneZero +
      engine.grid[columnIterCeil - 1]![1]! <
      2
  ) {
    engine.kill(columnIterCeil, 0);
  } else if (
    !columnIterCeil0 &&
    columnIterCeil1 +
      columnIterMinOneZero +
      engine.grid[columnIterCeil - 1]![1]! ==
      3
  ) {
    engine.make(columnIterCeil, 0);
  }

  if (
    columnIterRowIter &&
    columnIterRowMinOne +
      engine.grid[columnIterCeil - 1]![rowIterCeil]! +
      engine.grid[columnIterCeil - 1]![rowIterCeil - 1]! <
      2
  ) {
    engine.kill(columnIterCeil, rowIterCeil);
  } else if (
    !columnIterRowIter &&
    columnIterRowMinOne +
      engine.grid[columnIterCeil - 1]![rowIterCeil]! +
      engine.grid[columnIterCeil - 1]![rowIterCeil - 1]! ==
      3
  ) {
    engine.make(columnIterCeil, rowIterCeil);
  }

  for (let i = 1; i < columnIterCeil; i++) {
    sumCheck = sumCenterTopWall(i);
    if (engine.grid[i]![0] && sumCheck !== 2 && sumCheck !== 3) {
      engine.kill(i, 0);
    } else if (!engine.grid[i]![0] && sumCheck === 3) {
      engine.make(i, 0);
    }

    sumCheck = sumCenterBottomWall(i);
    if (engine.grid[i]![rowIterCeil] && sumCheck !== 2 && sumCheck !== 3) {
      engine.kill(i, rowIterCeil);
    } else if (!engine.grid[i]![rowIterCeil] && sumCheck === 3) {
      engine.make(i, rowIterCeil);
    }
  }

  for (let i = 1; i < rowIterCeil; i++) {
    sumCheck = sumLeftWall(i);
    if (engine.grid[0]![i] && sumCheck !== 2 && sumCheck !== 3) {
      engine.kill(0, i);
    } else if (!engine.grid[0]![i] && sumCheck === 3) {
      engine.make(0, i);
    }

    sumCheck = sumRightWall(i);
    if (engine.grid[columnIterCeil]![i] && sumCheck !== 2 && sumCheck !== 3) {
      engine.kill(columnIterCeil, i);
    } else if (!engine.grid[columnIterCeil]![i] && sumCheck === 3) {
      engine.make(columnIterCeil, i);
    }
  }

  for (let i = 1; i < columnIterCeil; i++) {
    for (let j = 1; j < rowIterCeil; j++) {
      sumCheck = sumCoords(i, j);
      if (engine.grid[i]![j] && sumCheck !== 2 && sumCheck !== 3) {
        engine.kill(i, j);
      } else if (!engine.grid[i]![j] && sumCheck === 3) {
        engine.make(i, j);
      }
    }
  }

  engine.step();

  engine.toMake = 0;
  engine.toKill = 0;
};

requestAnimationFrame(loop);
