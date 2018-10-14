////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function loadJSON(callback) {
    // Credit: https://codepen.io/KryptoniteDove/post/load-json-file-locally-using-pure-javascript
    let xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'https://raw.githubusercontent.com/martyav/drawing-pad/master/src/prompts.json', true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };

    xobj.send(null);
}

class Controller {
    constructor(appState, appElements) {
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

    draw(event) {
        if (!this.appState.isDrawing) return;

        this.appState.pointsToStroke.push({ x: this.appState.lastX, y: this.appState.lastY });

        this.appElements.context.beginPath();
        this.appElements.context.moveTo(this.appState.pointsToStroke[0].x, this.appState.pointsToStroke[0].y);
        this.appState.pointsToStroke.forEach(point => this.appElements.context.lineTo(point.x, point.y));
        this.appElements.context.stroke();
        this.appState.lastX = event.offsetX;
        this.appState.lastY = event.offsetY;
    }

    prompt() {
        const selected = this.appState.promptList;
        const randomIndex = selected === 'all' ? Math.floor(Math.random() * 199) : Math.floor(Math.random() * 99);
        let promptText;

        if (this.appState.prompts) {
            promptText = this.appState.prompts[selected][randomIndex];
            this.appElements.promptDisplay.innerHTML = `${ promptText }.`;
        } else {
            let display = this.appElements.promptDisplay;
            let prompts = this.appState.prompts;

            let callback = function (response) {
                const topLevelJSON = JSON.parse(response);
                
                promptText = selected === 'all' ? topLevelJSON.data.fun.concat(...topLevelJSON.data.serious)[randomIndex] : topLevelJSON.data[selected][randomIndex];

                display.innerHTML = `${ promptText }.`;

                prompts = {
                    fun: topLevelJSON.data.fun,
                    serious: topLevelJSON.data.serious,
                    all: topLevelJSON.data.fun.concat(...topLevelJSON.data.serious)
                }
            }

            loadJSON(callback);
        }
    }

    handleUpdate(event) {
        const property = `${ event.target.name }`;
        const value = `${ event.target.value }`;

        this.appState[property] = value;

        switch (property) {
            case 'color':
                this.appElements.context.strokeStyle = value;
                this.appElements.colorLabel.innerHTML = `Pen Color: ${ value }`;
                break;
            case 'width':
                this.appElements.context.lineWidth = value;
                this.appElements.strokeLabel.innerHTML = `Pen Width: ${ value }`;
                break;
            case 'nib':
                this.appElements.context.lineCap = value;
                break;
        }
    }

    restore(event) {
        let savedImg = new Image();
        savedImg.src = this.appState.imageAsData;

        savedImg.onload = () => { // If you do not specify the below code inside of a closure onload of the image, you will get an aggravating effect of the canvas clearing on the first click and then behaving correctly, i.e. restoring, on the second click
            this.eraseAll();
            this.appElements.context.drawImage(savedImg, 0, 0, this.appElements.canvas.width, this.appElements.canvas.height);
        }

        event.target.disable();
    }

    store() {
        this.appState.imageAsData = this.appElements.canvas.toDataURL('image/png')
    }

    downloadPic(event) {
        download(this.appState.imageAsData, "drawing-from-drawing-pad.png", "image/png");
        event.target.disable();
    }

    eraseAll() {
        this.appElements.context.clearRect(0, 0, this.appElements.canvas.width, this.appElements.canvas.height);
        this.appElements.context.fillStyle = this.appState.background;
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
        const time = this.appState.time;

        if (time <= 0) {
            clearInterval(this.appState.interval);
            this.appState.isCounting = false;
        }

        const minutes = Math.floor((time / 60000) % 60);
        const seconds = Math.floor((time / 1000) % 60);

        this.appElements.minutesDiv.innerHTML = minutes < 10 ? `0${Math.floor(minutes)}` : Math.floor(minutes);
        this.appElements.secondsDiv.innerHTML = seconds < 10 ? `0${Math.floor(seconds)}` : Math.floor(seconds);

        this.appState.time -= this.appState.throttle;
    }

    startTimer() {
        this.appState.interval = setInterval(this.updateCountDown, 1000)
    }

    stopStart() {
        if (this.appState.isCounting) {
            this.appState.isCounting = false;
            clearInterval(this.appState.interval);
            this.lightDownCountdown();
        } else {
            if (this.appState.time <= 0) this.appState.time = this.appState.timeLimit;

            this.appState.isCounting = true;
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

        this.appElements.context.fillStyle = this.appState.background;
        this.appElements.context.fillRect(5, 5, (this.appElements.canvas.width - 10), (this.appElements.canvas.height - 10)); // off by 5 to preserve outline

        this.appElements.context.strokeStyle = this.appState.color;
        this.appElements.context.lineWidth = this.appState.width;
        this.appElements.context.lineCap = this.appState.nib;
    }

    setLabels() {
        this.appElements.colorLabel.innerHTML = `Pen Color: ${ this.appState.color }`;
        this.appElements.strokeLabel.innerHTML = `Pen Width: ${ this.appState.width }`;
    }

    addEventListeners() {
        this.appElements.canvas.addEventListener('mousemove', this.draw);
        this.appElements.canvas.addEventListener('mousedown', () => {
            this.store();
            this.appElements.downloadButton.enable();
            this.appElements.undoButton.enable();

            this.appState.isDrawing = true;
            this.appState.lastX = event.offsetX;
            this.appState.lastY = event.offsetY;
        });
        this.appElements.canvas.addEventListener('mouseup', () => {
            this.appState.pointsToStroke.length = 0;
            this.appState.isDrawing = false;
        });
        this.appElements.canvas.addEventListener('mouseout', () => {
            this.appState.pointsToStroke.length = 0;
            this.appState.isDrawing = false;
        });

        this.appElements.inputs.forEach(input => input.addEventListener('change', this.handleUpdate));
        this.appElements.nibMenu.addEventListener('change', this.handleUpdate);
        this.appElements.radioButtons.forEach(radio => radio.addEventListener('change', this.handleUpdate));
        this.appElements.promptButton.addEventListener('click', () => {
            this.prompt();

            if (this.appState.isCounting) clearInterval(this.appState.interval);

            this.appState.time = this.appState.timeLimit;
            this.appState.isCounting = true;

            this.startTimer();
            this.lightUpCountdown();
        });
        this.appElements.undoButton.addEventListener('click', this.restore);
        this.appElements.downloadButton.addEventListener('click', () => {
            this.store();
            this.downloadPic();
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

class InitialState {
    constructor() {
        this.color = '#000000';
        this.background = 'white';
        this.width = 10;
        this.nib = 'round';
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.pointsToStroke = [];
        this.imageAsData;
    
        // Timer state
        this.isCounting = false;
        this.time = 0;
        this.throttle = 1000;
        this.timeLimit = 60000;
        this.interval;
    
        // Prompt state
        this.promptList = 'all';
    }
}

class GuiReferences {
    constructor(canvas, context, promptDisplay, radioButtons, promptList, promptButton, timer, hideButton, countdown, minutesDiv, secondsDiv, stopStartButton, inputs, colorInput, widthInput, nibInput, colorLabel, strokeLabel, nibMenu, undoButton, downloadButton, eraseAllButton) {
        this.canvas = canvas;
        this.context = context;

        this.promptDisplay = promptDisplay;
        this.radioButtons = radioButtons;
        this.promptList = promptList;
        this.promptButton = promptButton;

        this.timer = timer;
        this.hideButton = hideButton;
        this.countdown = countdown;
        this.minutesDiv = minutesDiv;
        this.secondsDiv = secondsDiv;
        this.stopStartButton = stopStartButton;

        this.inputs = inputs;
        this.colorInput = colorInput;
        this.widthInput = widthInput;
        this.nibInput = nibInput;

        this.colorLabel = colorLabel;
        this.strokeLabel = strokeLabel;
        this.nibMenu = nibMenu

        this.undoButton = undoButton;
        this.downloadButton = downloadButton;
        this.eraseAllButton = eraseAllButton;
    }
}

HTMLButtonElement.prototype.disable = function () {
    if (!this.hasAttribute('disabled')) this.disabled = true;
}

HTMLButtonElement.prototype.enable =  function() {
    if (this.hasAttribute('disabled')) this.disabled = false;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
    const elementBag = {
        canvas: document.querySelector("#drawHere"),
        context: document.querySelector("#drawHere").getContext("2d"),

        promptDisplay: document.querySelector('#promptDisplay'),
        radioButtons: document.querySelectorAll('input[type="radio"]'),
        promptList: document.querySelector('input[name="promptList"]:checked').value,
        promptButton: document.querySelector('#prompt'),

        timer: document.querySelector('#timer'),
        hideButton: document.querySelector('.hide'),
        countdown: document.querySelector('.countdown'),
        minutesDiv: document.querySelector('.minutes'),
        secondsDiv: document.querySelector('.seconds'),
        stopStartButton: document.querySelector('.stopStart'),

        inputs: Array.from(document.querySelectorAll(`#controls input`)),
        colorInput: document.querySelector('[name=color]').value,
        widthInput: document.querySelector('[name=width]').value,
        nibInput: document.querySelector('[name=nib]').value,

        colorLabel: document.querySelector('[for=color]'),
        strokeLabel: document.querySelector('[for=width]'),
        nibMenu: document.querySelector('[name=nib]'),

        undoButton: document.getElementById('undo'),
        downloadButton: document.getElementById('download'),
        eraseAllButton: document.getElementById('eraseAll')
    }

    const appState = new InitialState();

    const appElements = Object.assign(new GuiReferences, elementBag);
    const controller = new Controller(appState, appElements);

    controller.store();
    controller.setCanvasProperties();
    controller.setLabels();
    controller.addEventListeners();
});

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
