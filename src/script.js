function setUpCanvas(canvas, frame, context) {
  canvas.width = frame.width;
  canvas.height = frame.height;

  // These will be interacting with css selectors?
  context.strokeStyle = "#000000";
  context.lineWidth = 10;
  context.lineJoin = "round";
  context.lineCap = "round";

  console.log('set up canvas ran');
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector("canvas");
  const frame = document.getElementById("frame");
  const context = canvas.getContext("2d", { alpha: false }); // setting alpha to false optimizes rendering

  setUpCanvas(canvas, frame, context);
});
