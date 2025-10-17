import { constants } from './constants.js';
import { KeyboardMode } from './keyboardMode.js';
import { StandardMode } from './standardMode.js';
export function initSettings() {

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
}

if (typeof window !== "undefined") {
    window.initSettings = initSettings;
}