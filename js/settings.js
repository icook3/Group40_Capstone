import { constants } from './constants.js';
import { KeyboardMode } from './keyboardMode.js';
export function initSettings() {
    console.log("init settings");
    const keyboardBtn = document.getElementById("keyboard-btn");
    keyboardBtn.addEventListener("click", () => {
        console.log("Click keyboard button");
        let inKeyboardMode = sessionStorage.getItem("isInKeyboardMode");
        if (inKeyboardMode == null) {
            inKeyboardMode = false;
        } else if (inKeyboardMode == 'false') {
            inKeyboardMode = false;
        } else {
            inKeyboardMode = true;
        }
        inKeyboardMode = !inKeyboardMode;
        sessionStorage.setItem("isInKeyboardMode", inKeyboardMode);
        keyboardBtn.textContent = inKeyboardMode
            ? new KeyboardMode().keyboardOnText
            : "Keyboard Mode";
        if (!inKeyboardMode) {
            constants.riderState.speed = 0;
        }
    });
}

// used as a way to make it work - I don't know if this is the way it is supposed to work or not
window.addEventListener('DOMContentLoaded', () => {
    console.log(initSettings);
    if (initSettings) {
        initSettings();
    }
});