import 'babel-polyfill';
import 'babel-preset-es2015';
import GuiReferences from './GuiReferences';
import StateOrganizer from './StateOrganizer';
import Controller from './Controller';

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
