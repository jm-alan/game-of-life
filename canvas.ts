export const canvas = document.querySelector("canvas")!;
if (!canvas) {
  throw new Error("Failed to find canvas!");
}
export const context = canvas.getContext("2d")!;
if (!context) {
  throw new Error("Context lost/unavailable!");
}

const onResize = () => {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
};

// window.addEventListener("resize", onResize);
onResize();

export const scaleX = (percent: number): number =>
  (percent / 100) * canvas.width;
export const scaleY = (percent: number): number =>
  (percent / 100) * canvas.height;
