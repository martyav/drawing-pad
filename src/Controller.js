import GuiReferences from './GuiReferences';
import StateOrganizer from './StateOrganizer';

export default class Controller {
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

    disable(button) {
      if (!button.hasAttribute('disabled')) button.disabled = true;
    }

    enable(button) {
      if (button.hasAttribute('disabled')) button.disabled = false;
    }

    draw(event) {
      if (!this.appState.getIsDrawing()) return;

      this.appState.addPoint({ x: this.appState.getLastX(), y: this.appState.getLastY() })

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
      
      this.store();

      savedImg.onload = () => { // If you do not specify the below code inside of a closure onload of the image, you will get an aggravating effect of the canvas clearing on the first click and then behaving correctly, i.e. restoring, on the second click
          this.eraseAll();
          this.appElements.context.drawImage(savedImg, 0, 0, this.appElements.canvas.width, this.appElements.canvas.height);
      }
  }

  store() {
      this.appState.setImageData(this.appElements.canvas.toDataURL('image/png'));
  }

  downloadPic() {
    require("downloadjs")(this.appState.getImageData(), "drawing-from-drawing-pad.png", "image/png");
  }

  eraseAll() {
      this.appElements.context.clearRect(0, 0, this.appElements.canvas.width, this.appElements.canvas.height);
      this.appElements.context.fillStyle = this.appState.getBackground();
      this.appElements.context.fillRect(5, 5, (this.appElements.canvas.width - 10), (this.appElements.canvas.height - 10)); // off by 5 to preserve canvas outline
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

      this.appState.decrementTime();
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
          this.enable(this.appElements.downloadButton);
          this.enable(this.appElements.undoButton);

          this.appState.setIsDrawing(true);
          this.appState.setLastX(event.offsetX);
          this.appState.setLastY(event.offsetY);
      });
      this.appElements.canvas.addEventListener('mouseup', () => {
          this.appState.clearPoints()
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

          this.appState.resetTime()
          this.appState.setIsCounting(true);

          this.startTimer();
          this.lightUpCountdown();
      });
      this.appElements.undoButton.addEventListener('click', () => { 
          this.restore();
      });
      this.appElements.downloadButton.addEventListener('click', () => {
          this.store();
          this.downloadPic();
          this.enable(this.appElements.downloadButton);
      });
      this.appElements.eraseAllButton.addEventListener('click', () => {
          this.store();
          this.eraseAll();
          this.enable(this.appElements.undoButton);
      });

      this.appElements.hideButton.addEventListener('click', this.hideTimer);
      this.appElements.stopStartButton.addEventListener('click', this.stopStart);
  }
};