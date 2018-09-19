function draw(event) {
    const isDrawing = JSON.parse(document.body.style.getPropertyValue('--isDrawing')); // we do this weird conversion because the value we get back is a string containing either the word true or false!

    if (!isDrawing) {
        return;
    }

    const localCanvas = document.querySelector("#drawHere");
    const localContext = localCanvas.getContext("2d");
    const localLastX = document.body.style.getPropertyValue('--lastX');
    const localLastY = document.body.style.getPropertyValue('--lastY');

    localContext.beginPath();
    localContext.moveTo(localLastX, localLastY);
    localContext.lineTo(event.offsetX, event.offsetY);
    localContext.stroke();
    document.body.style.setProperty('--lastX', event.offsetX);
    document.body.style.setProperty('--lastY', event.offsetY);
}

function handleUpdate() {
    const property = `--${this.name}`;
    document.body.style.setProperty(property, this.value);

    const localCanvas = document.querySelector("#drawHere");
    const localContext = localCanvas.getContext("2d");
    const colorLabel = document.querySelector('[for=color]');
    const strokeLabel = document.querySelector('[for=width]');
    const changedValue = document.body.style.getPropertyValue(property);

    switch (property) {
        case '--color':
            localContext.strokeStyle = changedValue;
            colorLabel.innerHTML = `Pen Color: ${ changedValue }`;
            break;
        case '--width':
            localContext.lineWidth = changedValue;
            strokeLabel.innerHTML = `Pen Width: ${ changedValue }`;
            break;
        case '--nib':
            localContext.lineCap = changedValue;
            break;
    }
}

function eraseAll() {
    const localCanvas = document.querySelector("#drawHere");
    const localContext = localCanvas.getContext("2d");

    localContext.clearRect(0, 0, localCanvas.width, localCanvas.height);
}

function setCSSVariables(colorInput, widthInput, nibInput) {
    document.body.style.setProperty("--color", `${ colorInput }`);
    document.body.style.setProperty('--width', `${ widthInput }`);
    document.body.style.setProperty('--nib', `${ nibInput }`);
    document.body.style.setProperty('--isDrawing', false); // Note: this method converts the second arg to a string
    document.body.style.setProperty('--lastX', 0);
    document.body.style.setProperty('--lastY', 0);
}

function setCanvasProperties(canvas, context) {
    // Width/height is set in this way here bc naively using css to set it simply causes the canvas to stretch without redefining the number of pixels, resulting in stroke drawing that is far off from the cursor. See https://stackoverflow.com/questions/10214873/make-canvas-as-wide-and-as-high-as-parent and https://stackoverflow.com/questions/11060110/drawing-at-cursor-position-on-canvas-with-javascript 
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    context.strokeStyle = document.body.style.getPropertyValue('--color');
    context.lineWidth = document.body.style.getPropertyValue('--width');
    context.lineCap = document.body.style.getPropertyValue('--nib');;
}

function setLabels(colorLabel, strokeLabel) {
    colorLabel.innerHTML = `Pen Color: ${ document.body.style.getPropertyValue('--color') }`;
    strokeLabel.innerHTML = `Pen Width: ${ document.body.style.getPropertyValue('--width') }`;
}

function addEventHandlers(canvas, inputs, nibMenu, eraseAllButton) {
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mousedown', () => {
        document.body.style.setProperty('--isDrawing', true);
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
}

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.querySelector("#drawHere");
    const context = canvas.getContext("2d"); // setting alpha to false optimizes rendering...but then the canvas bg is rendered black, and changing the color is quite slow
    const inputs = Array.from(document.querySelectorAll(`#controls input`));
    const colorLabel = document.querySelector('[for=color]');
    const strokeLabel = document.querySelector('[for=width]');
    const nibMenu = document.querySelector('[name=nib]');
    const eraseAllButton = document.querySelector('#eraseAll');

    const colorInput = document.querySelector('[name=color]').value;
    const widthInput = document.querySelector('[name=width]').value;
    const nibInput = nibMenu.value;

    setCSSVariables(colorInput, widthInput, nibInput);
    setCanvasProperties(canvas, context);
    setLabels(colorLabel, strokeLabel);
    addEventHandlers(canvas, inputs, nibMenu, eraseAllButton);
});