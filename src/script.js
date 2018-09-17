function setCanvasProperties(context) {
  context.strokeStyle = document.body.style.getPropertyValue('--color');
  context.lineWidth = document.body.style.getPropertyValue('--width');
  context.lineCap = document.body.style.getPropertyValue('--cap');;
  context.lineJoin = document.body.style.getPropertyValue('--join');

  console.log("set canvas ran");
}

function draw(event) {
  const isDrawing = document.body.style.getPropertyValue('--isDrawing') === 'true' // we do this weird conversion because the value we get back is a string containing either the word true or false!
  
  if (!isDrawing) {
    return;
  }

  const localCanvas = document.querySelector("#drawHere");
  const localContext = localCanvas.getContext("2d");
  const localLastX = document.body.style.getPropertyValue('--lastX');
  const localLastY = document.body.style.getPropertyValue('--lastY');
  console.log(localLastX);
  console.log(localLastY);

  localContext.beginPath();
  localContext.moveTo(localLastX, localLastY);
  localContext.lineTo(event.offsetX, event.offsetY);
  localContext.stroke();
  document.body.style.setProperty('--lastX', event.offsetX);
  document.body.style.setProperty('--lastY', event.offsetY);

  console.log('drawing');
}

function handleUpdate() {
  console.log('handleUpdate was triggered');
  console.log(this.name);
  document.body.style.setProperty(`--${this.name}`, this.value);

  const localCanvas = document.querySelector("#drawHere");
  const localContext = localCanvas.getContext("2d");


  switch (this.name) {
    case 'color':
      localContext.strokeStyle = document.body.style.getPropertyValue('--color');
      console.log('color was triggered');
      break;
    case 'width':
      localContext.lineWidth = document.body.style.getPropertyValue('--width');
      console.log('width was triggered');
      break;
    case 'cap':
      localContext.lineCap = document.body.style.getPropertyValue('--cap');
      break;
    case 'join':
      localContext.lineJoin = document.body.style.getPropertyValue('--join');
      break;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const colorInput = document.querySelector('#color').value;
  const widthInput = document.querySelector('#width').value;
  console.log(widthInput);
  
  document.body.style.setProperty("--color", `${ colorInput }`);
  document.body.style.setProperty('--width', `${ widthInput }`);
  document.body.style.setProperty('--cap', 'round');
  document.body.style.setProperty('--join', 'round');
  document.body.style.setProperty('--isDrawing', false); // Note: this method converts the second arg to a string
  document.body.style.setProperty('--lastX', 0);
  document.body.style.setProperty('--lastY', 0);
  
  const canvas = document.querySelector("#drawHere");
  const context = canvas.getContext("2d"); // setting alpha to false optimizes rendering...but then the canvas bg is rendered black, and changing the color is quite slow
  const inputs = Array.from(document.querySelectorAll(`#controls input`));
  
  setCanvasProperties(context);

  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mousedown', () => {
    document.body.style.setProperty('--lastX', event.offsetX);
    document.body.style.setProperty('--lastY', event.offsetY);
    document.body.style.setProperty('--isDrawing', true);
  });
  canvas.addEventListener('mouseup', () => {
    document.body.style.setProperty('--isDrawing', false)
  });
  canvas.addEventListener('mouseout', () => {
    document.body.style.setProperty('--isDrawing', false)
  });

  inputs.forEach(input => input.addEventListener('change', handleUpdate));
});
