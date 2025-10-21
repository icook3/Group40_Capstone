import { StandardMode } from "./standardMode.js";
import { constants } from "./constants.js";

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

  //Test Mode
  const testModeBtn = document.getElementById("testMode");
  testModeBtn.addEventListener("click", () => {
    let inTestMode = localStorage.getItem("testMode");
    if (inTestMode == null) {
      inTestMode = false;
    } else if (inTestMode == "false") {
      inTestMode = false;
    } else {
      inTestMode = true;
    }
    inTestMode = !inTestMode;
    localStorage.setItem("testMode", inTestMode);
    testModeBtn.textContent = inTestMode
      ? "Test Mode: ON"
      : "Developer Testing Mode";
    if (!inTestMode) {
      constants.riderState.speed = 0;
    }
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
