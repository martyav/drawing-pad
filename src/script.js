let globalPointPreserve = [];
let interval;

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

function draw(event) {
    const isDrawing = JSON.parse(document.body.style.getPropertyValue('--isDrawing')); // we do this weird conversion because the value we get back is a string containing either the word true or false!

    if (!isDrawing) {
        return;
    }

    const localCanvas = document.querySelector("#drawHere");
    const localContext = localCanvas.getContext("2d");
    const localLastX = document.body.style.getPropertyValue('--lastX');
    const localLastY = document.body.style.getPropertyValue('--lastY');

    globalPointPreserve.push({x: localLastX, y: localLastY});

    localContext.beginPath();
    localContext.moveTo(globalPointPreserve[0].x, globalPointPreserve[0].y);
    globalPointPreserve.forEach(point => localContext.lineTo(point.x, point.y));
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

function prompt() {
    const promptDisplay = document.querySelector('#promptDisplay');
    const selected = document.body.style.getPropertyValue('--promptList');
    const randomIndex = selected === 'all' ? Math.floor(Math.random() * 200) : Math.floor(Math.random() * 100);

    loadJSON(function(response) {
        let topLevelJSON = JSON.parse(response);
        let fun = topLevelJSON.data.fun;
        let serious = topLevelJSON.data.serious;
        let allPrompts = fun.concat(...serious);
        let promptText = selected === 'fun' ? fun[randomIndex] : selected === 'serious' ? serious[randomIndex] : allPrompts[randomIndex];

        promptDisplay.innerHTML = `${ promptText }.`;
    });
}

function restore(event) {
    console.table(localStorage);

    let savedDataUrl = localStorage.getItem('currentCanvas');
    let savedImg = new Image();
    savedImg.src = savedDataUrl;

    const localCanvas = document.querySelector("#drawHere");
    const localContext = localCanvas.getContext("2d");

    savedImg.onload = () => { // If you do not specify the below code inside of a closure onload of the image, you will get an aggravating effect of the canvas clearing on the first click and then behaving correctly, i.e. restoring, on the second click
        eraseAll();
        localContext.drawImage(savedImg, 0, 0, localCanvas.width, localCanvas.height);
    }

    disable(event.target);
}

function store() {
    const localCanvas = document.querySelector("#drawHere");
    let imgAsDataUrl = localCanvas.toDataURL('image/png');

    try {
        localStorage.setItem('currentCanvas', imgAsDataUrl);
        console.log('Successfully stored in local');
    } catch (error) {
        console.log(`Store failed: ${error}`);
    }
}

function downloadPic(event) {
    let savedDataUrl = localStorage.getItem('currentCanvas');

    download(savedDataUrl, "drawing-from-drawing-pad.png", "image/png");

    disable(event.target);
}

function eraseAll() {    
    const localCanvas = document.querySelector("#drawHere");
    const localContext = localCanvas.getContext("2d");

    localContext.clearRect(0, 0, localCanvas.width, localCanvas.height);
    localContext.fillStyle = "white";
    localContext.fillRect(5, 5, (localCanvas.width - 10), (localCanvas.height - 10)); // off by 5 to preserve outline
}

function hideTimer() {
    const timer = document.querySelector('#timer');

    let reveal;

    if (!document.querySelector('.reveal')) {
        reveal = document.createElement('button');
        reveal.classList.add('reveal');
        reveal.innerHTML = 'Reveal';

        document.body.appendChild(reveal);
        reveal.addEventListener('click', revealTimer);
    } else {
        reveal = document.querySelector('.reveal');
    }

    timer.style.transform = `translate(0, -${timer.offsetHeight}px)`;
    reveal.style.transform = `translate(0, -${timer.offsetHeight - 10}px)`;
}

function revealTimer() {
    const timer = document.querySelector('#timer');
    const reveal = document.querySelector('.reveal');

    timer.style.transform = `translate(0, 0)`;
    reveal.style.transform = `translate(0, 10px)`;
}

function updateCountDown() {
    let time = parseInt(document.body.style.getPropertyValue('--time')); 
    const throttle = 1000;
    const minutesDiv = document.querySelector('.minutes');
    const secondsDiv = document.querySelector('.seconds');

    if (time <= 0) {
        clearInterval(interval);
        document.body.style.setProperty('--isCounting', false);
    }

    let minutes = Math.floor((time/60000) % 60);
    let seconds = Math.floor((time/1000) % 60);
    
    minutesDiv.innerHTML = minutes < 10 ? `0${Math.floor(minutes)}` : Math.floor(minutes);
    secondsDiv.innerHTML = seconds < 10 ? `0${Math.floor(seconds)}` : Math.floor(seconds);
    document.body.style.setProperty('--time', time);
    
    time -= throttle;
    document.body.style.setProperty('--time', time);
}

function startTimer() {
    interval = setInterval(updateCountDown, 1000);
}

function stopStart() {
    const isCounting = JSON.parse(document.body.style.getPropertyValue('--isCounting'));
    
    if (!isCounting) {
        if (parseInt(document.body.style.getPropertyValue('--time')) <= 0) {
            document.body.style.setProperty('--time', 180000);
        }
        
        document.body.style.setProperty('--isCounting', true);
        startTimer();
    } else {
        document.body.style.setProperty('--isCounting', false);
        clearInterval(interval);
    } 
}

function setCSSVariables(colorInput, widthInput, nibInput, promptList) {
    document.body.style.setProperty("--color", `${ colorInput }`);
    document.body.style.setProperty('--width', `${ widthInput }`);
    document.body.style.setProperty('--nib', `${ nibInput }`);
    document.body.style.setProperty('--isDrawing', false); // Note: this method converts the second arg to a string
    document.body.style.setProperty('--lastX', 0);
    document.body.style.setProperty('--lastY', 0);
    document.body.style.setProperty('--promptList', `${ promptList }`);
    document.body.style.setProperty('--isCounting', false);
    document.body.style.setProperty('--time', 0);
}

function setCanvasProperties(canvas, context) {
    // Width/height is set in this way here bc naively using css to set it simply causes the canvas to stretch without redefining the number of pixels, resulting in stroke drawing that is far off from the cursor. See https://stackoverflow.com/questions/10214873/make-canvas-as-wide-and-as-high-as-parent and https://stackoverflow.com/questions/11060110/drawing-at-cursor-position-on-canvas-with-javascript 
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    context.fillStyle = "white";
    context.fillRect(5, 5, (canvas.width - 10), (canvas.height - 10)); // off by 5 to preserve outline

    context.strokeStyle = document.body.style.getPropertyValue('--color');
    context.lineWidth = document.body.style.getPropertyValue('--width');
    context.lineCap = document.body.style.getPropertyValue('--nib');
}

function setLabels(colorLabel, strokeLabel) {
    colorLabel.innerHTML = `Pen Color: ${ document.body.style.getPropertyValue('--color') }`;
    strokeLabel.innerHTML = `Pen Width: ${ document.body.style.getPropertyValue('--width') }`;
}

function addEventHandlers(canvas, inputs, nibMenu, radioButtons, promptButton, undoButton, downloadButton, eraseAllButton, hideButton, stopStartButton) {
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mousedown', () => {
        store();
        enable(downloadButton);
        enable(undo);
        document.body.style.setProperty('--isDrawing', true);
        document.body.style.setProperty('--lastX', event.offsetX);
        document.body.style.setProperty('--lastY', event.offsetY);
    });
    canvas.addEventListener('mouseup', () => {
        globalPointPreserve.length = 0;
        document.body.style.setProperty('--isDrawing', false)
    });
    canvas.addEventListener('mouseout', () => {
        globalPointPreserve.length = 0;
        document.body.style.setProperty('--isDrawing', false)
    });

    inputs.forEach(input => input.addEventListener('change', handleUpdate));
    nibMenu.addEventListener('change', handleUpdate);
    radioButtons.forEach(radio => radio.addEventListener('change', handleUpdate));
    promptButton.addEventListener('click', prompt);
    undoButton.addEventListener('click', restore);
    downloadButton.addEventListener('click', () => {
        store();
        downloadPic();
    });
    eraseAllButton.addEventListener('click', () => {
        store();
        eraseAll();
        enable(undo);
    });

    hideButton.addEventListener('click', hideTimer);
    stopStartButton.addEventListener('click', stopStart);
}

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.querySelector("#drawHere");
    const context = canvas.getContext("2d", {alpha: false}); // setting alpha to false optimizes rendering...but then the canvas bg is rendered black, and changing the color is quite slow
    const inputs = Array.from(document.querySelectorAll(`#controls input`));
    const colorLabel = document.querySelector('[for=color]');
    const strokeLabel = document.querySelector('[for=width]');
    const nibMenu = document.querySelector('[name=nib]');
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    const promptButton = document.querySelector('#prompt');
    const undoButton = document.getElementById('undo');
    const downloadButton = document.getElementById('download');
    const eraseAllButton = document.getElementById('eraseAll');

    const colorInput = document.querySelector('[name=color]').value;
    const widthInput = document.querySelector('[name=width]').value;
    const nibInput = nibMenu.value;
    const promptList = document.querySelector('input[name="promptList"]:checked').value;

    const hideButton = document.querySelector('.hide');
    const stopStartButton = document.querySelector('.stopStart');

    localStorage.clear();
    store();

    setCSSVariables(colorInput, widthInput, nibInput, promptList);
    setCanvasProperties(canvas, context);
    setLabels(colorLabel, strokeLabel);
    addEventHandlers(canvas, inputs, nibMenu, radioButtons, promptButton, undoButton, downloadButton, eraseAllButton, hideButton, stopStartButton);
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
			toString = function(a){return String(a);},
			myBlob = (self.Blob || self.MozBlob || self.WebKitBlob || toString),
			fileName = strFileName || "download",
			blob,
			reader;
			myBlob= myBlob.call ? myBlob.bind(self) : Blob ;
	  
		if(String(this)==="true"){ //reverse arguments, allowing download.bind(true, "text/xml", "export.xml") to act as a callback
			payload=[payload, mimeType];
			mimeType=payload[0];
			payload=payload[1];
		}


		if(url && url.length< 2048){ // if no filename and no mime, assume a url was passed as the only argument
			fileName = url.split("/").pop().split("?")[0];
			anchor.href = url; // assign href prop to temp anchor
		  	if(anchor.href.indexOf(url) !== -1){ // if the browser determines that it's a potentially valid url path:
        		var ajax=new XMLHttpRequest();
        		ajax.open( "GET", url, true);
        		ajax.responseType = 'blob';
        		ajax.onload= function(e){ 
				  download(e.target.response, fileName, defaultMime);
				};
        		setTimeout(function(){ ajax.send();}, 0); // allows setting custom ajax headers using the return:
			    return ajax;
			} // end if valid url?
		} // end if url?


		//go ahead and download dataURLs right away
		if(/^data\:[\w+\-]+\/[\w+\-]+[,;]/.test(payload)){
		
			if(payload.length > (1024*1024*1.999) && myBlob !== toString ){
				payload=dataUrlToBlob(payload);
				mimeType=payload.type || defaultMime;
			}else{			
				return navigator.msSaveBlob ?  // IE10 can't do a[download], only Blobs:
					navigator.msSaveBlob(dataUrlToBlob(payload), fileName) :
					saver(payload) ; // everyone else can save dataURLs un-processed
			}
			
		}//end if dataURL passed?

		blob = payload instanceof myBlob ?
			payload :
			new myBlob([payload], {type: mimeType}) ;


		function dataUrlToBlob(strUrl) {
			var parts= strUrl.split(/[:;,]/),
			type= parts[1],
			decoder= parts[2] == "base64" ? atob : decodeURIComponent,
			binData= decoder( parts.pop() ),
			mx= binData.length,
			i= 0,
			uiArr= new Uint8Array(mx);

			for(i;i<mx;++i) uiArr[i]= binData.charCodeAt(i);

			return new myBlob([uiArr], {type: type});
		 }

		function saver(url, winMode){

			if ('download' in anchor) { //html5 A[download]
				anchor.href = url;
				anchor.setAttribute("download", fileName);
				anchor.className = "download-js-link";
				anchor.innerHTML = "downloading...";
				anchor.style.display = "none";
				document.body.appendChild(anchor);
				setTimeout(function() {
					anchor.click();
					document.body.removeChild(anchor);
					if(winMode===true){setTimeout(function(){ self.URL.revokeObjectURL(anchor.href);}, 250 );}
				}, 66);
				return true;
			}

			// handle non-a[download] safari as best we can:
			if(/(Version)\/(\d+)\.(\d+)(?:\.(\d+))?.*Safari\//.test(navigator.userAgent)) {
				url=url.replace(/^data:([\w\/\-\+]+)/, defaultMime);
				if(!window.open(url)){ // popup blocked, offer direct download:
					if(confirm("Displaying New Document\n\nUse Save As... to download, then click back to return to this page.")){ location.href=url; }
				}
				return true;
			}

			//do iframe dataURL download (old ch+FF):
			var f = document.createElement("iframe");
			document.body.appendChild(f);

			if(!winMode){ // force a mime that will download:
				url="data:"+url.replace(/^data:([\w\/\-\+]+)/, defaultMime);
			}
			f.src=url;
			setTimeout(function(){ document.body.removeChild(f); }, 333);

		}//end saver

		if (navigator.msSaveBlob) { // IE10+ : (has Blob, but not a[download] or URL)
			return navigator.msSaveBlob(blob, fileName);
		}

		if(self.URL){ // simple fast and modern way using Blob and URL:
			saver(self.URL.createObjectURL(blob), true);
		}else{
			// handle non-Blob()+non-URL browsers:
			if(typeof blob === "string" || blob.constructor===toString ){
				try{
					return saver( "data:" +  mimeType   + ";base64,"  +  self.btoa(blob)  );
				}catch(y){
					return saver( "data:" +  mimeType   + "," + encodeURIComponent(blob)  );
				}
			}

			// Blob but not URL support:
			reader=new FileReader();
			reader.onload=function(e){
				saver(this.result);
			};
			reader.readAsDataURL(blob);
		}
		return true;
	}; /* end download() */
}));