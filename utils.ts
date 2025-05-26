import { context, scaleX, scaleY } from "./canvas";
import {
  columnCheckCeil,
  columnCount,
  columnIterCeil,
  columnWidth,
  gridlineWidth,
  rowCheckCeil,
  rowCount,
  rowHeight,
  rowIterCeil,
  squareInteriorHeight,
  squareInteriorWidth,
} from "./constants";
import { engine } from "./engine";

export const drawGrid = () => {
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
};

drawGrid();

export const scheduleSquare = (x: number, y: number) => {
  context.rect(
    x * columnWidth + gridlineWidth,
    y * rowHeight + gridlineWidth,
    squareInteriorWidth,
    squareInteriorHeight
  );
};

export const drawSquare = (x: number, y: number) => {
  context.fillRect(
    x + gridlineWidth,
    y + gridlineWidth,
    squareInteriorWidth,
    squareInteriorHeight
  );
};

export const sumCenterTopWall = (x: number): number =>
  engine.grid[x - 1]![0]! +
  engine.grid[x - 1]![1]! +
  engine.grid[x]![1]! +
  engine.grid[x + 1]![1]! +
  engine.grid[x + 1]![0]!;

export const sumCenterBottomWall = (x: number): number =>
  engine.grid[x - 1]![rowIterCeil]! +
  engine.grid[x - 1]![rowCheckCeil]! +
  engine.grid[x]![rowCheckCeil]! +
  engine.grid[x + 1]![rowCheckCeil]! +
  engine.grid[x]![rowIterCeil]!;

export const sumLeftWall = (y: number): number =>
  engine.grid[0]![y - 1]! +
  engine.grid[1]![y - 1]! +
  engine.grid[1]![y]! +
  engine.grid[1]![y + 1]! +
  engine.grid[0]![y + 1]!;

export const sumRightWall = (y: number) =>
  engine.grid[columnIterCeil]![y - 1]! +
  engine.grid[columnCheckCeil]![y - 1]! +
  engine.grid[columnCheckCeil]![y]! +
  engine.grid[columnCheckCeil]![y + 1]! +
  engine.grid[columnIterCeil]![y + 1]!;

export const sumCoords = (x: number, y: number): number =>
  engine.grid[x - 1]![y - 1]! +
  engine.grid[x]![y - 1]! +
  engine.grid[x + 1]![y - 1]! +
  engine.grid[x + 1]![y]! +
  engine.grid[x + 1]![y + 1]! +
  engine.grid[x]![y + 1]! +
  engine.grid[x - 1]![y + 1]! +
  engine.grid[x - 1]![y]!;
