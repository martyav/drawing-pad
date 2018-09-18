function setCanvasProperties(canvas, context) {
    // Width/height is set in this way here bc naively using css to set it simply causes the canvas to stretch without redefining the number of pixels, resulting in stroke drawing that is far off from the cursor. See https://stackoverflow.com/questions/10214873/make-canvas-as-wide-and-as-high-as-parent and https://stackoverflow.com/questions/11060110/drawing-at-cursor-position-on-canvas-with-javascript 
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    context.strokeStyle = document.body.style.getPropertyValue('--color');
    context.lineWidth = document.body.style.getPropertyValue('--width');
    context.lineCap = document.body.style.getPropertyValue('--nib');;

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
    const property = `--${this.name}`;
    document.body.style.setProperty(property, this.value);

    const localCanvas = document.querySelector("#drawHere");
    const localContext = localCanvas.getContext("2d");
    const changedValue = document.body.style.getPropertyValue(property);

    switch (this.name) {
        case 'color':
            localContext.strokeStyle = changedValue;
            break;
        case 'width':
            localContext.lineWidth = changedValue;
            break;
        case 'nib':
            localContext.lineCap = changedValue;
            break;
    }
}

function eraseAll() {
    console.log('Erase all was clicked');
    const localCanvas = document.querySelector("#drawHere");
    const localContext = localCanvas.getContext("2d");

    localContext.clearRect(0, 0, localCanvas.width, localCanvas.height);
}

document.addEventListener("DOMContentLoaded", () => {
    const colorInput = document.querySelector('[name=color]').value;
    const widthInput = document.querySelector('[name=width]').value;
    const nibInput = document.querySelector('[name=nib]').value;


    document.body.style.setProperty("--color", `${ colorInput }`);
    document.body.style.setProperty('--width', `${ widthInput }`);
    document.body.style.setProperty('--nib', `${ nibInput }`);
    document.body.style.setProperty('--isDrawing', false); // Note: this method converts the second arg to a string
    document.body.style.setProperty('--lastX', 0);
    document.body.style.setProperty('--lastY', 0);

    const canvas = document.querySelector("#drawHere");
    const context = canvas.getContext("2d"); // setting alpha to false optimizes rendering...but then the canvas bg is rendered black, and changing the color is quite slow
    const inputs = Array.from(document.querySelectorAll(`#controls input`));
    const nibMenu = document.querySelector('[name=nib]');
    const eraseAllButton = document.querySelector('#eraseAll');

    setCanvasProperties(canvas, context);

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
    nibMenu.addEventListener('change', handleUpdate);
    eraseAllButton.addEventListener('click', eraseAll);
});