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
    const testModeBtn = document.getElementById("testMode");
    testModeBtn.addEventListener("click", () => {
        console.log("click testMode Button");
        let inTestMode = sessionStorage.getItem("testMode");
        if (inTestMode == null) {
            inTestMode = false;
        } else if (inTestMode == 'false') {
            inTestMode = false;
        } else {
            inTestMode = true;
        }
        inTestMode = !inTestMode;
        sessionStorage.setItem("testMode", inTestMode);
        testModeBtn.textContent = inTestMode ? "Test Mode ON" : "Test Mode";
    });
}

if (typeof window !== "undefined") {
    window.initSettings = initSettings;
}