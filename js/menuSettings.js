export function initMenuSettings() {
    //Keyboard Mode
    const keyboardBtn = document.getElementById("keyboard-btn");
    keyboardBtn.addEventListener("click", () => {
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
    window.initMenuSettings = initMenuSettings;
}