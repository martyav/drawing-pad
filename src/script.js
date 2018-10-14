// This is a very long file because vanilla doesn't support imports. 
// If we wanted to separate things out, we could do it ES6 style (import/export), or CommonJS style (export/require).
// Either choice would mean adding dependencies.

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
    const elementBag = {
        canvas: document.querySelector("#drawHere"),
        context: document.querySelector("#drawHere").getContext("2d"),

        promptDisplay: document.querySelector('#promptDisplay'),
        radioButtons: document.querySelectorAll('input[type="radio"]'),
        promptKey: document.querySelector('input[name="promptList"]:checked').value,
        promptButton: document.querySelector('#prompt'),

        timer: document.querySelector('#timer'),
        hideButton: document.querySelector('.hide'),
        countdown: document.querySelector('.countdown'),
        minutesDiv: document.querySelector('.minutes'),
        secondsDiv: document.querySelector('.seconds'),
        stopStartButton: document.querySelector('.stopStart'),

        inputs: Array.from(document.querySelectorAll(`#controls input`)),
        colorInputValue: document.querySelector('[name=color]').value,
        widthInputValue: document.querySelector('[name=width]').value,
        nibInputValue: document.querySelector('[name=nib]').value,

        colorLabel: document.querySelector('[for=color]'),
        strokeLabel: document.querySelector('[for=width]'),
        nibMenu: document.querySelector('[name=nib]'),

        undoButton: document.getElementById('undo'),
        downloadButton: document.getElementById('download'),
        eraseAllButton: document.getElementById('eraseAll')
    }

    const appState = new StateOrganizer();
    const appElements = Object.assign(new GuiReferences, elementBag);
    const controller = new Controller(appState, appElements);

    controller.setCanvasProperties();
    controller.setLabels();
    controller.addEventListeners();
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

HTMLButtonElement.prototype.disable = function () {
    if (!this.hasAttribute('disabled')) this.disabled = true;
}

HTMLButtonElement.prototype.enable =  function() {
    if (this.hasAttribute('disabled')) this.disabled = false;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class GuiReferences {
    constructor(canvas, context, promptDisplay, radioButtons, promptKey, promptButton, timer, hideButton, countdown, minutesDiv, secondsDiv, stopStartButton, inputs, colorInputValue, widthInputValue, nibInputValue, colorLabel, strokeLabel, nibMenu, undoButton, downloadButton, eraseAllButton) {
        this.canvas = canvas;
        this.context = context;

        this.promptDisplay = promptDisplay;
        this.radioButtons = radioButtons;
        this.promptKey = promptKey;
        this.promptButton = promptButton;

        this.timer = timer;
        this.hideButton = hideButton;
        this.countdown = countdown;
        this.minutesDiv = minutesDiv;
        this.secondsDiv = secondsDiv;
        this.stopStartButton = stopStartButton;

        this.inputs = inputs;

        this.colorLabel = colorLabel;
        this.strokeLabel = strokeLabel;
        this.nibMenu = nibMenu

        this.colorInputValue = colorInputValue;
        this.widthInputValueValue = widthInputValue;
        this.nibInputValue = nibInputValue;


        this.undoButton = undoButton;
        this.downloadButton = downloadButton;
        this.eraseAllButton = eraseAllButton;
    }
}

class StateOrganizer {
    constructor() {
        // Without `this`, these properties are kept inside the constructor and are inaccessible elsewhere, making them essentially private
        let _color = '#000000';
        let _background = 'white';
        let _width = 10;
        let _nib = 'round';
        let _isDrawing = false;
        let _lastX = 0;
        let _lastY = 0;
        let _pointsToStroke = [];
        let _imageData;
    
        // Timer state
        let _isCounting = false;
        let _time = 0;
        let _throttle = 1000;
        let _timeLimit = 60000;
        let _interval;
    
        // Prompt state
        let _promptKey = 'all';
        let _prompts;

        // Getters 
        this.getColor = () => _color; 
        this.getBackground = () => _background;
        this.getWidth = () => _width;
        this.getNib = () => _nib;
        this.getIsDrawing = () => _isDrawing;
        this.getPointsToStroke = () => _pointsToStroke;
        this.getFirstX = () => _pointsToStroke[0].x;
        this.getFirstY = () => _pointsToStroke[0].y;
        // LastX & lastY are separate from the points array because they are based on the user moving their cursor, with or without drawing
        this.getLastX = () => _lastX;
        this.getLastY = () => _lastY;
        this.getImageData = () => _imageData;
        this.getIsCounting = () => _isCounting;
        this.getTime = () => _time;
        this.getThrottle = () => _throttle;
        this.getTimeLimit = () => _timeLimit;
        this.getInterval = () => _interval;
        this.getPromptKey = () => _promptKey;
        this.getPrompts = () => _prompts;

        // Setters
        this.setColor = function(color) {
            if (typeof color !== 'string' || color[0] !== "#" || color.length !== 7) throw new TypeError(`Not a valid color hex code: ${ color }`);

            _color = color;
        }
        
        this.setWidth = function(width) {
            if (typeof parseInt(width) !== 'number') throw new TypeError(`Not a valid width: ${ width }`);
            if (width < 1 || width > 100) throw new RangeError(`Width is not in range: ${ width }`);

            _width = width;
        }
        
        this.setNib = function(nib) {
            if (typeof nib != 'string') throw new TypeError(`Not a valid nib: ${ nib }`);
            
            if (nib === 'square' || nib === 'round') {
                _nib = nib;
            } else {
                throw new Error(`Nib must be either square or round: ${ nib }`);
            }
        }
        
        this.setIsDrawing = function(isDrawing) {
            if (typeof isDrawing != 'boolean') throw new TypeError(`Not a valid isDrawing value: ${ isDrawing }`);

            _isDrawing = isDrawing;
        }
        
        this.addPoint = function(point) {
            if (!point.x || !point.y || typeof point.x !== 'number' || typeof point.y !== 'number') throw new TypeError(`Arg lacks valid coordinate values: x ${ point.x } y ${ point.y }`);

            _pointsToStroke.push({ x: point.x, y: point.y });
        }
        
        this.clearPoints = () => _pointsToStroke.length = 0;
        
        this.setLastX = function(x) {
            if (typeof x !== 'number') throw new TypeError(`Not a number: ${ x }`);

            _lastX = x;
        }

        this.setLastY = function(y) {
            if (typeof y !== 'number') throw new TypeError(`Not a number: ${ y }`);

            _lastY = y;
        }

        this.setImageData = function(imageData) {
            if (typeof imageData != 'string' || !imageData.startsWith('data:image/png;base64,')) throw new TypeError(`Not a valid image data URI: ${ imageData }`);

            _imageData = imageData;
        }

        this.setTime = function(time) {
            if (typeof time !== 'number') throw new TypeError(`Not a valid time: ${ time }`);
            if (time < 0 || time > _timeLimit) throw new RangeError(`Time not in range: ${ time }`);

            _time = time;
        }

        this.resetTime = () => _time = _timeLimit;

        this.decrementTime = () => _time -= _throttle;
        
        this.setIsCounting = function(isCounting) {
            if (typeof isCounting != 'boolean') throw new TypeError(`Not a valid isDrawingValue: ${ isCounting }`);

            _isCounting = isCounting;
        }

        this.clearInterval = () => clearInterval(_interval);

        this.setInterval = function(interval) {
            if (typeof interval != 'number') throw new TypeError(`Not a valid interval value: ${ interval }`);

            _interval = interval;
        }

        this.setPromptKey = function(key) {
            if (typeof key != 'string') throw new TypeError(`Not a valid prompt list key: ${ key }`);
            
            if (key === 'all' || key === 'fun' || key === 'serious') {
                _promptKey = key;
            } else {
                throw new Error(`The only valid prompt list values are fun, serious, or all: ${ key }`);
            }
        }

        this.setPrompts = function(prompts) {
            if (!prompts.fun || !prompts.serious || !prompts.all) throw new TypeError(`Prompts must include keys for all, serious, and fun: ${ prompts }`);

            _prompts = prompts;
        }
    }
}

class Controller {
    constructor(appState, appElements) {
        if (!(appState instanceof StateOrganizer)) throw TypeError('AppState must be of type StateOrganizer');
        if (!(appElements instanceof GuiReferences)) throw TypeError('AppElements must be of type GUIReferences');

        this.appState = appState;
        this.appElements = appElements;

        this.draw = this.draw.bind(this);
        this.prompt = this.prompt.bind(this);
        this.updateCountDown = this.updateCountDown.bind(this);
        this.stopStart = this.stopStart.bind(this);
        this.hideTimer = this.hideTimer.bind(this);
        this.revealTimer = this.revealTimer.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.restore = this.restore.bind(this);
        this.downloadPic = this.downloadPic.bind(this);
    }

    loadJSON(callback, resource) {
        // Credit: https://codepen.io/KryptoniteDove/post/load-json-file-locally-using-pure-javascript
        let xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', resource, true);
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == "200") {
                // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                callback(xobj.responseText);
            }
        };
    
        xobj.send(null);
    }

    draw(event) {
        if (!this.appState.getIsDrawing()) return;

        this.appState.addPoint({ x: this.appState.getLastX(), y: this.appState.getLastY() })//pointsToStroke.push({ x: this.appState.lastX, y: this.appState.lastY });

        this.appElements.context.beginPath();
        this.appElements.context.moveTo(this.appState.getFirstX, this.appState.getFirstY);
        this.appState.getPointsToStroke().forEach(point => this.appElements.context.lineTo(point.x, point.y));
        this.appElements.context.stroke();
        this.appState.setLastX(event.offsetX);
        this.appState.setLastY(event.offsetY);
    }

    prompt() {
        const selected = this.appState.getPromptKey();
        const randomIndex = selected === 'all' ? Math.floor(Math.random() * 199) : Math.floor(Math.random() * 99);
        let promptText;

        if (this.appState.prompts) {
            promptText = this.appState.prompts[selected][randomIndex];
            this.appElements.promptDisplay.innerHTML = `${ promptText }.`;
        } else {
            // This may appear redundant, but if prompts does not have anything inside yet, we must update the UI inside the callback, because it is returning after the function exits, as callbacks are wont to do. Only loading after the first time the user clicks the button allows us to avoid making an unnecessary call if the user just wants to draw without an artist prompt.
            const display = this.appElements.promptDisplay;
            const state = this.appState;

            let callback = function (response) {
                const topLevelJSON = JSON.parse(response);
                
                promptText = selected === 'all' ? topLevelJSON.data.fun.concat(...topLevelJSON.data.serious)[randomIndex] : topLevelJSON.data[selected][randomIndex];

                display.innerHTML = `${ promptText }.`;

                state.setPrompts({
                    fun: topLevelJSON.data.fun,
                    serious: topLevelJSON.data.serious,
                    all: topLevelJSON.data.fun.concat(...topLevelJSON.data.serious)
                });
            }

            const resource = 'https://raw.githubusercontent.com/martyav/drawing-pad/master/src/prompts.json';

            this.loadJSON(callback, resource);
        }
    }

    handleUpdate(event) {
        const property = `${ event.target.name }`;
        const value = `${ event.target.value }`;

        switch (property) {
            case 'color':
                this.appState.setColor(value);
                this.appElements.context.strokeStyle = value;
                this.appElements.colorLabel.innerHTML = `Pen Color: ${ value }`;
                break;
            case 'width':
                this.appState.setWidth(value);
                this.appElements.context.lineWidth = value;
                this.appElements.strokeLabel.innerHTML = `Pen Width: ${ value }`;
                break;
            case 'nib':
                this.appState.setNib(value);
                this.appElements.context.lineCap = value;
                break;
            case 'promptList':
                this.appState.setPromptKey(value);
        }
    }

    restore(event) {
        let savedImg = new Image();
        savedImg.src = this.appState.getImageData();

        savedImg.onload = () => { // If you do not specify the below code inside of a closure onload of the image, you will get an aggravating effect of the canvas clearing on the first click and then behaving correctly, i.e. restoring, on the second click
            this.eraseAll();
            this.appElements.context.drawImage(savedImg, 0, 0, this.appElements.canvas.width, this.appElements.canvas.height);
        }

        event.target.disable();
    }

    store() {
        this.appState.setImageData(this.appElements.canvas.toDataURL('image/png'));
    }

    downloadPic() {
        download(this.appState.getImageData(), "drawing-from-drawing-pad.png", "image/png");
    }

    eraseAll() {
        this.appElements.context.clearRect(0, 0, this.appElements.canvas.width, this.appElements.canvas.height);
        this.appElements.context.fillStyle = this.appState.getBackground();
        this.appElements.context.fillRect(5, 5, (this.appElements.canvas.width - 10), (this.appElements.canvas.height - 10)); // off by 5 to preserve outline
    }

    hideTimer() {
        let reveal;

        if (document.querySelector('.reveal')) {
            reveal = document.querySelector('.reveal');
            reveal.style.opacity = '1.0';
        } else {
            reveal = document.createElement('button');
            reveal.classList.add('reveal');
            reveal.innerHTML = 'Reveal';

            document.body.appendChild(reveal);
            reveal.addEventListener('click', this.revealTimer);
        }

        this.appElements.timer.style.transform = `translate(0, -${ timer.offsetHeight }px)`;
        reveal.style.transform = `translate(0, -${ timer.offsetHeight - 10 }px)`;
    }

    revealTimer() {
        const reveal = document.querySelector('.reveal');

        this.appElements.timer.style.transform = `translate(0, 0)`;
        reveal.style.transform = `translate(0, -200px)`;
        reveal.style.opacity = '0.0';
    }

    updateCountDown() {
        const time = this.appState.getTime();

        if (time <= 0) {
            this.appState.clearInterval();
            this.appState.isCounting = false;
        }

        const minutes = Math.floor((time / 60000) % 60);
        const seconds = Math.floor((time / 1000) % 60);

        this.appElements.minutesDiv.innerHTML = minutes < 10 ? `0${Math.floor(minutes)}` : Math.floor(minutes);
        this.appElements.secondsDiv.innerHTML = seconds < 10 ? `0${Math.floor(seconds)}` : Math.floor(seconds);

        this.appState.decrementTime();//setTime -= this.appState.throttle;
    }

    startTimer() {
        this.appState.setInterval(window.setInterval(this.updateCountDown, 1000));
    }

    stopStart() {
        if (this.appState.getIsCounting()) {
            this.appState.setIsCounting(false);
            this.appState.clearInterval();
            this.lightDownCountdown();
        } else {
            if (this.appState.getTime() <= 0) this.appState.setTime(this.appState.getTimeLimit());

            this.appState.setIsCounting(true);
            this.startTimer();
            this.lightUpCountdown();
        }
    }

    lightUpCountdown() {
        this.appElements.countdown.classList.add('lightUp')}

    lightDownCountdown() {
        this.appElements.countdown.classList.remove('lightUp')
    }

    setCanvasProperties() {
        this.appElements.canvas.width = this.appElements.canvas.offsetWidth;
        this.appElements.canvas.height = this.appElements.canvas.offsetHeight;

        this.appElements.context.fillStyle = this.appState.getBackground();
        this.appElements.context.fillRect(5, 5, (this.appElements.canvas.width - 10), (this.appElements.canvas.height - 10)); // off by 5 to preserve outline

        this.appElements.context.strokeStyle = this.appState.getColor();
        this.appElements.context.lineWidth = this.appState.getWidth();
        this.appElements.context.lineCap = this.appState.getNib();
    }

    setLabels() {
        this.appElements.colorLabel.innerHTML = `Pen Color: ${ this.appState.getColor() }`;
        this.appElements.strokeLabel.innerHTML = `Pen Width: ${ this.appState.getWidth() }`;
    }

    addEventListeners() {
        this.appElements.canvas.addEventListener('mousemove', this.draw);
        this.appElements.canvas.addEventListener('mousedown', () => {
            this.store();
            this.appElements.downloadButton.enable();
            this.appElements.undoButton.enable();

            this.appState.setIsDrawing(true);
            this.appState.setLastX(event.offsetX);
            this.appState.setLastY(event.offsetY);
        });
        this.appElements.canvas.addEventListener('mouseup', () => {
            this.appState.clearPoints()//pointsToStroke.length = 0;
            this.appState.setIsDrawing(false);
        });
        this.appElements.canvas.addEventListener('mouseout', () => {
            this.appState.clearPoints();
            this.appState.setIsDrawing(false);
        });

        this.appElements.inputs.forEach(input => input.addEventListener('change', this.handleUpdate));
        this.appElements.nibMenu.addEventListener('change', this.handleUpdate);
        this.appElements.radioButtons.forEach(radio => radio.addEventListener('change', this.handleUpdate));
        this.appElements.promptButton.addEventListener('click', () => {
            this.prompt();

            if (this.appState.getIsCounting()) this.appState.clearInterval();

            this.appState.resetTime()//setTime(this.appState.getTimeLimit);
            this.appState.setIsCounting(true);

            this.startTimer();
            this.lightUpCountdown();
        });
        this.appElements.undoButton.addEventListener('click', this.restore);
        this.appElements.downloadButton.addEventListener('click', () => {
            this.store();
            this.downloadPic();
            this.appElements.downloadButton.enable();
        });
        this.appElements.eraseAllButton.addEventListener('click', () => {
            this.store();
            this.eraseAll();
            this.appElements.undoButton.enable();
        });

        this.appElements.hideButton.addEventListener('click', this.hideTimer);
        this.appElements.stopStartButton.addEventListener('click', this.stopStart);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//download.js v4.2, by dandavis; 2008-2016. [CCBY2] see http://danml.com/download.html for tests/usage
// v1 landed a FF+Chrome compat way of downloading strings to local un-named files, upgraded to use a hidden frame and optional mime
// v2 added named files via a[download], msSaveBlob, IE (10+) support, and window.URL support for larger+faster saves than dataURLs
// v3 added dataURL and Blob Input, bind-toggle arity, and legacy dataURL fallback was improved with force-download mime and base64 support. 3.1 improved safari handling.
// v4 adds AMD/UMD, commonJS, and plain browser support
// v4.1 adds url download capability via solo URL argument (same domain/CORS only)
// v4.2 adds semantic variable names, long (over 2MB) dataURL support, and hidden by default temp anchors
// https://github.com/rndme/download

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.download = factory();
    }
}(this, function () {

    return function download(data, strFileName, strMimeType) {

        var self = window, // this script is only for browsers anyway...
            defaultMime = "application/octet-stream", // this default mime also triggers iframe downloads
            mimeType = strMimeType || defaultMime,
            payload = data,
            url = !strFileName && !strMimeType && payload,
            anchor = document.createElement("a"),
            toString = function (a) { return String(a); },
            myBlob = (self.Blob || self.MozBlob || self.WebKitBlob || toString),
            fileName = strFileName || "download",
            blob,
            reader;
        myBlob = myBlob.call ? myBlob.bind(self) : Blob;

        if (String(this) === "true") { //reverse arguments, allowing download.bind(true, "text/xml", "export.xml") to act as a callback
            payload = [payload, mimeType];
            mimeType = payload[0];
            payload = payload[1];
        }


        if (url && url.length < 2048) { // if no filename and no mime, assume a url was passed as the only argument
            fileName = url.split("/").pop().split("?")[0];
            anchor.href = url; // assign href prop to temp anchor
            if (anchor.href.indexOf(url) !== -1) { // if the browser determines that it's a potentially valid url path:
                var ajax = new XMLHttpRequest();
                ajax.open("GET", url, true);
                ajax.responseType = 'blob';
                ajax.onload = function (e) {
                    download(e.target.response, fileName, defaultMime);
                };
                setTimeout(function () { ajax.send(); }, 0); // allows setting custom ajax headers using the return:
                return ajax;
            } // end if valid url?
        } // end if url?


        //go ahead and download dataURLs right away
        if (/^data\:[\w+\-]+\/[\w+\-]+[,;]/.test(payload)) {

            if (payload.length > (1024 * 1024 * 1.999) && myBlob !== toString) {
                payload = dataUrlToBlob(payload);
                mimeType = payload.type || defaultMime;
            } else {
                return navigator.msSaveBlob ?  // IE10 can't do a[download], only Blobs:
                    navigator.msSaveBlob(dataUrlToBlob(payload), fileName) :
                    saver(payload); // everyone else can save dataURLs un-processed
            }

        }//end if dataURL passed?

        blob = payload instanceof myBlob ?
            payload :
            new myBlob([payload], { type: mimeType });


        function dataUrlToBlob(strUrl) {
            var parts = strUrl.split(/[:;,]/),
                type = parts[1],
                decoder = parts[2] == "base64" ? atob : decodeURIComponent,
                binData = decoder(parts.pop()),
                mx = binData.length,
                i = 0,
                uiArr = new Uint8Array(mx);

            for (i; i < mx; ++i) uiArr[i] = binData.charCodeAt(i);

            return new myBlob([uiArr], { type: type });
        }

        function saver(url, winMode) {

            if ('download' in anchor) { //html5 A[download]
                anchor.href = url;
                anchor.setAttribute("download", fileName);
                anchor.className = "download-js-link";
                anchor.innerHTML = "downloading...";
                anchor.style.display = "none";
                document.body.appendChild(anchor);
                setTimeout(function () {
                    anchor.click();
                    document.body.removeChild(anchor);
                    if (winMode === true) { setTimeout(function () { self.URL.revokeObjectURL(anchor.href); }, 250); }
                }, 66);
                return true;
            }

            // handle non-a[download] safari as best we can:
            if (/(Version)\/(\d+)\.(\d+)(?:\.(\d+))?.*Safari\//.test(navigator.userAgent)) {
                url = url.replace(/^data:([\w\/\-\+]+)/, defaultMime);
                if (!window.open(url)) { // popup blocked, offer direct download:
                    if (confirm("Displaying New Document\n\nUse Save As... to download, then click back to return to this page.")) { location.href = url; }
                }
                return true;
            }

            //do iframe dataURL download (old ch+FF):
            var f = document.createElement("iframe");
            document.body.appendChild(f);

            if (!winMode) { // force a mime that will download:
                url = "data:" + url.replace(/^data:([\w\/\-\+]+)/, defaultMime);
            }
            f.src = url;
            setTimeout(function () { document.body.removeChild(f); }, 333);

        }//end saver

        if (navigator.msSaveBlob) { // IE10+ : (has Blob, but not a[download] or URL)
            return navigator.msSaveBlob(blob, fileName);
        }

        if (self.URL) { // simple fast and modern way using Blob and URL:
            saver(self.URL.createObjectURL(blob), true);
        } else {
            // handle non-Blob()+non-URL browsers:
            if (typeof blob === "string" || blob.constructor === toString) {
                try {
                    return saver("data:" + mimeType + ";base64," + self.btoa(blob));
                } catch (y) {
                    return saver("data:" + mimeType + "," + encodeURIComponent(blob));
                }
            }

            // Blob but not URL support:
            reader = new FileReader();
            reader.onload = function (e) {
                saver(this.result);
            };
            reader.readAsDataURL(blob);
        }
        return true;
    }; /* end download() */
}));
