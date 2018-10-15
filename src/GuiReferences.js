export default class GuiReferences {
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
};
