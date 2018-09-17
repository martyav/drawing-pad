function setUpCanvas(canvas, frame, context) {
  canvas.width = frame.width;
  canvas.height = frame.height;

  context.strokeStyle = document.body.style.getPropertyValue('--color');
  context.lineWidth = document.body.style.getPropertyValue('--width');
  context.lineCap = document.body.style.getPropertyValue('--cap');;
  context.lineJoin = document.body.style.getPropertyValue('--join');

  console.log("set up canvas ran");
}

function draw() {}

document.addEventListener("DOMContentLoaded", () => {
  document.body.style.setProperty("--color", "#000000");
  document.body.style.setProperty('--width', '10');
  document.body.style.setProperty('--cap', 'round');
  document.body.style.setProperty('--join', 'round');

  const canvas = document.querySelector("canvas");
  const frame = document.getElementById("frame");
  const context = canvas.getContext("2d", { alpha: false }); // setting alpha to false optimizes rendering

  setUpCanvas(canvas, frame, context);
});
