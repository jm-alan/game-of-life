import { canvas, scaleX, scaleY } from "./canvas";

export const msPerSecond = 1000;
export const columnCount = 500;
export const columnIterCeil = columnCount - 1;
export const columnCheckCeil = columnIterCeil - 1;
export const columnPercent = 100 / columnCount;
export const columnWidth = scaleX(columnPercent);
export const rowCount = Math.floor(
  columnCount * (canvas.height / canvas.width)
);
export const rowIterCeil = rowCount - 1;
export const rowCheckCeil = rowIterCeil - 1;
export const rowPercent = 100 / rowCount;
export const rowHeight = scaleY(rowPercent);
export const gridlineWidth = 0.25;
export const gridlineIntrusion = gridlineWidth * 2;
export const area = columnCount * rowCount;
export const squareInteriorWidth = columnWidth - gridlineIntrusion;
export const squareInteriorHeight = rowHeight - gridlineIntrusion;
export const onColor = "white";
export const offColor = "black";
export const fpsSteps = [0.1, 0.25, 0.5, 1, 5, 15, 30, 60, 120, 240, 480];
export const plusOne = 0b00000010;
export const maskValue = 0b00000001;
export const maskNeighbors = 0b11111110;
export const twoNeighbors = 0b00000100;
export const threeNeighbors = 0b00000110;
export const twoNeighborsRetain = twoNeighbors | maskValue;
