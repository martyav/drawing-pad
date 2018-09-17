function setCanvasProperties(canvas, frame, context) {
  context.strokeStyle = document.body.style.getPropertyValue('--color');
  context.lineWidth = document.body.style.getPropertyValue('--width');
  context.lineCap = document.body.style.getPropertyValue('--cap');;
  context.lineJoin = document.body.style.getPropertyValue('--join');

  console.log("set canvas ran");
}

function draw(event) {
  console.log('drawing');
  console.log(event);
}

function handleUpdate() {
  document.documentElement.style.setProperty(`--${this.name}`, this.value);
}

document.addEventListener("DOMContentLoaded", () => {  
  document.body.style.setProperty("--color", "#f00");
  document.body.style.setProperty('--width', '10');
  document.body.style.setProperty('--cap', 'round');
  document.body.style.setProperty('--join', 'round');
  
  const canvas = document.querySelector("#drawHere");
  const frame = document.getElementById("#frame");
  const context = canvas.getContext("2d"); // setting alpha to false optimizes rendering...but then the canvas bg is rendered black, and changing the color is quite slow
  const inputs = Array.from(document.querySelectorAll(`.controls input`));
  
  setCanvasProperties(canvas, frame, context);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mousedown', draw);
  inputs.forEach(input => input.addEventListener('mousemove', handleUpdate));
  inputs.forEach(input => input.addEventListener('change', handleUpdate));
});
