import { constants } from './constants.js';
import { KeyboardMode } from './keyboardMode.js';
import { StandardMode } from './standardMode.js';
export function initSettings() {
    console.log("init settings");
    //Keyboard Mode
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
    //Test Mode
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
    let standardMode = new StandardMode();
    //Connect Trainer
    const connectBtn = document.getElementById("connect-btn");
    connectBtn.addEventListener("click", async () => {
        await standardMode.connectTrainer();
        //store the trainer info using JSON
        sessionStorage.setItem("Trainer", JSON.stringify(standardMode.trainer));
        //const ok = await standardMode.trainer.connect();
        //if (ok) connectBtn.disabled = true;
    });
    //Pacer speed input
    const pacerSpeedInput = document.getElementById("pacer-speed");
    pacerSpeedInput.addEventListener("input", () => {
        sessionStorage.setItem("PacerSpeed", pacerSpeedInput.value);
    });
    //weight input
    // Hook up live mass updates → optional immediate speed recompute
    const riderWeightEl = document.getElementById("rider-weight");
    if (riderWeightEl) {
        const updateMassAndMaybeSpeed = () => {
            const newMass = Number(riderWeightEl.value);
            if (!Number.isFinite(newMass)) return;
            sessionStorage.setItem("weight", newMass);
        };

        // Initialize once and then listen for changes
        updateMassAndMaybeSpeed();
        riderWeightEl.addEventListener("input", updateMassAndMaybeSpeed);
        riderWeightEl.addEventListener("change", updateMassAndMaybeSpeed);
    }
}

if (typeof window !== "undefined") {
    window.initSettings = initSettings;
}