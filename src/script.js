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

function disable(button) {
    if (!button.hasAttribute('disabled')) {
        button.disabled = true;
    }
}

function enable(button) {
    if (button.hasAttribute('disabled')) {
        button.disabled = false;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    let appState = {
        // Canvas & context state
        color: '#000000',
        background: 'white',
        width: 10,
        nib: 'round',
        isDrawing: false,
        lastX: 0,
        lastY: 0,
        pointsToStroke: [],
        imageAsData: null,
    
        // Timer state
        isCounting: false,
        time: 0,
        throttle: 1000,
        timeLimit: 60000,
        interval: null,
    
        // Prompt state
        promptList: 'all'
    }
    
    const appElements = {
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
        eraseAllButton: document.getElementById('eraseAll'),
    }

    function draw(event) {
        const isDrawing = appState.isDrawing;
    
        if (!isDrawing) {
            return;
        }
    
        appState.pointsToStroke.push({ x: appState.lastX, y: appState.lastY });
    
        appElements.context.beginPath();
        appElements.context.moveTo(appState.pointsToStroke[0].x, appState.pointsToStroke[0].y);
        appState.pointsToStroke.forEach(point => appElements.context.lineTo(point.x, point.y));
        appElements.context.stroke();
        appState.lastX = event.offsetX;
        appState.lastY = event.offsetY;
    }
    
    function handleUpdate() {
        const property = `${this.name}`;
        const value = `${this.value}`;
        console.log(property, value);
    
        appState[property] = value;
    
        switch (property) {
            case 'color':
                appElements.context.strokeStyle = value;
                appElements.colorLabel.innerHTML = `Pen Color: ${ value }`;
                break;
            case 'width':
                appElements.context.lineWidth = value;
                appElements.strokeLabel.innerHTML = `Pen Width: ${ value }`;
                break;
            case 'nib':
                appElements.context.lineCap = value;
                break;
        }
    }
    
    function prompt() {
        const selected = appState.promptList;
        const randomIndex = selected === 'all' ? Math.floor(Math.random() * 199) : Math.floor(Math.random() * 99);
    
        loadJSON(function (response) {
            let topLevelJSON = JSON.parse(response);
            let fun = topLevelJSON.data.fun;
            let serious = topLevelJSON.data.serious;
            let allPrompts = fun.concat(...serious);
            let promptText = selected === 'fun' ? fun[randomIndex] : selected === 'serious' ? serious[randomIndex] : allPrompts[randomIndex];
    
            appElements.promptDisplay.innerHTML = `${promptText}.`;
        });
    }
    
    function restore(event) {
        let savedImg = new Image();
        savedImg.src = appState.imageAsData;
    
        savedImg.onload = () => { // If you do not specify the below code inside of a closure onload of the image, you will get an aggravating effect of the canvas clearing on the first click and then behaving correctly, i.e. restoring, on the second click
            eraseAll();
            appElements.context.drawImage(savedImg, 0, 0, appElements.canvas.width, appElements.canvas.height);
        }
    
        disable(event.target);
    }
    
    function store() {
        appState.imageAsData = appElements.canvas.toDataURL('image/png');
    }
    
    function downloadPic(event) {
        download(appState.imageAsData, "drawing-from-drawing-pad.png", "image/png");
        disable(event.target);
    }
    
    function eraseAll() {
        appElements.context.clearRect(0, 0, appElements.canvas.width, appElements.canvas.height);
        appElements.context.fillStyle = "white";
        appElements.context.fillRect(5, 5, (appElements.canvas.width - 10), (appElements.canvas.height - 10)); // off by 5 to preserve outline
    }
    
    function hideTimer() {
        let reveal;
    
        if (!document.querySelector('.reveal')) {
            reveal = document.createElement('button');
            reveal.classList.add('reveal');
            reveal.innerHTML = 'Reveal';
    
            document.body.appendChild(reveal);
            reveal.addEventListener('click', revealTimer);
        } else {
            reveal = document.querySelector('.reveal');
            reveal.style.opacity = '1.0';
        }
    
        appElements.timer.style.transform = `translate(0, -${timer.offsetHeight}px)`;
        reveal.style.transform = `translate(0, -${timer.offsetHeight - 10}px)`;
    }
    
    function revealTimer() {
        const reveal = document.querySelector('.reveal');
    
        appElements.timer.style.transform = `translate(0, 0)`;
        reveal.style.transform = `translate(0, -200px)`;
        reveal.style.opacity = '0.0';
    }
    
    function updateCountDown() {
        const time = appState.time;

        if (time <= 0) {
            clearInterval(appState.interval);
            appState.isCounting = false;
        }
    
        const minutes = Math.floor((time / 60000) % 60);
        const seconds = Math.floor((time / 1000) % 60);
    
        appElements.minutesDiv.innerHTML = minutes < 10 ? `0${Math.floor(minutes)}` : Math.floor(minutes);
        appElements.secondsDiv.innerHTML = seconds < 10 ? `0${Math.floor(seconds)}` : Math.floor(seconds);
    
        appState.time -= appState.throttle;
    }
    
    function startTimer() {
        appState.interval = setInterval(updateCountDown, 1000);
    }
    
    function stopStart() {
        if (!appState.isCounting) {
            if (appState.time <= 0) {
                appState.time = appState.timeLimit;
            }
    
            appState.isCounting = true;
            startTimer();
            lightUpCountdown();
        } else {
            appState.isCounting = false;
            clearInterval(appState.interval);
            lightDownCountdown();
        }
    }
    
    function lightUpCountdown() {
        appElements.countdown.classList.add('lightUp');
    }
    
    function lightDownCountdown() {
    
        appElements.countdown.classList.remove('lightUp');
    }
    
    function setCanvasProperties() {
        appElements.canvas.width = appElements.canvas.offsetWidth;
        appElements.canvas.height = appElements.canvas.offsetHeight;
    
        appElements.context.fillStyle = appState.background;
        appElements.context.fillRect(5, 5, (appElements.canvas.width - 10), (appElements.canvas.height - 10)); // off by 5 to preserve outline
    
        appElements.context.strokeStyle = appState.color;
        appElements.context.lineWidth = appState.width;
        appElements.context.lineCap = appState.nib;
    }
    
    function setLabels() {
        appElements.colorLabel.innerHTML = `Pen Color: ${ appState.color }`;
        appElements.strokeLabel.innerHTML = `Pen Width: ${ appState.width }`;
    }
    
    function addEventListeners() {
        appElements.canvas.addEventListener('mousemove', draw);
        appElements.canvas.addEventListener('mousedown', () => {
            store();
            enable(appElements.downloadButton);
            enable(appElements.undoButton);
    
            appState.isDrawing = true;
            appState.lastX = event.offsetX;
            appState.lastY = event.offsetY;
        });
        appElements.canvas.addEventListener('mouseup', () => {
            appState.pointsToStroke.length = 0;
            appState.isDrawing = false;
        });
        appElements.canvas.addEventListener('mouseout', () => {
            appState.pointsToStroke.length = 0;
            appState.isDrawing = false;
        });
    
        appElements.inputs.forEach(input => input.addEventListener('change', handleUpdate));
        appElements.nibMenu.addEventListener('change', handleUpdate);
        appElements.radioButtons.forEach(radio => radio.addEventListener('change', handleUpdate));
        appElements.promptButton.addEventListener('click', () => {
            prompt();
    
            if (appState.isCounting) {
                clearInterval(appState.interval);
            }
    
            appState.time = appState.timeLimit;
            appState.isCounting = true;
    
            startTimer();
            lightUpCountdown();
        });
        appElements.undoButton.addEventListener('click', restore);
        appElements.downloadButton.addEventListener('click', () => {
            store();
            downloadPic();
        });
        appElements.eraseAllButton.addEventListener('click', () => {
            store();
            eraseAll();
            enable(appElements.undoButton);
        });
    
        appElements.hideButton.addEventListener('click', hideTimer);
        appElements.stopStartButton.addEventListener('click', stopStart);
    }

    store();
    setCanvasProperties();
    setLabels();
    addEventListeners();
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
