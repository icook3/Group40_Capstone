import { StandardMode } from "./standardMode.js";
import { constants } from "./constants.js";
import { Strava } from "./strava.js";

export function initSettings() {
  if (sessionStorage.getItem("peerToPeer")==='true') {
    jQuery("#peer-name").fadeToggle(500);
  }
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

  const peerBtn = document.getElementById("peer-btn");
  peerBtn.addEventListener("click", () => {
      let peerHosting = sessionStorage.getItem("peerToPeer");
      if (peerHosting==null) {
        peerHosting = false;
      } else if (peerHosting == "false") {
        peerHosting = false;
      } else {
        peerHosting = true;
      }
      peerHosting = !peerHosting;
      sessionStorage.setItem("peerToPeer",peerHosting);
      peerBtn.textContent = peerHosting
        ? "Host peer-to-peer: ON"
        : "Host peer-to-peer";
        jQuery("#peer-name").fadeToggle(500);
  });

  const peerNameInput = document.getElementById("name-input");
  peerNameInput.addEventListener("input", () => {
      localStorage.setItem("Name",peerNameInput.value);
  });

  peerNameInput.addEventListener("change", () => {
      const name = peerNameInput.value.trim();
      if (name.length === 0) {
          alert("Name cannot be empty");
      }
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

  // units input
  // speed
  const speedUnitInput = document.getElementById("unitInputSpeed");
  if (speedUnitInput) {
    speedUnitInput.addEventListener("input", () => {
      sessionStorage.setItem("SpeedUnit", speedUnitInput.value);
      let elements = document.getElementsByClassName("speedUnit");
      for (let i = 0; i < elements.length; i++) {
        elements.item(i).innerHTML = speedUnitInput.value;
      }
    });
  }
  // weight
  const weightUnitInput = document.getElementById("unitInputWeight");
  if (weightUnitInput) {
    weightUnitInput.addEventListener("input", () => {
      sessionStorage.setItem("WeightUnit", weightUnitInput.value);
      let elements = document.getElementsByClassName("weightUnit");
      for (let i = 0; i < elements.length; i++) {
        elements.item(i).innerHTML = weightUnitInput.value;
      }
    });
  }
  // power
  //uncomment the following code if alternate units for power are implemented
  /*
  const powerUnitInput = document.getElementById("unitInputPower");
  if (powerUnitInput) {
      powerUnitInput.addEventListener("input", () => {
          sessionStorage.setItem("PowerUnit", powerUnitInput.value);
      });
  }
  */
}

async function initStravaButton() {
    const strava = new Strava();
    Strava.loadFromRedirect();
    strava.loadToken();

    const stravaBtn = document.getElementById("connect-strava-btn");
    if (!stravaBtn) {
        return;
    }

    // Disable by default until we know backend state
    stravaBtn.disabled = true;

    const backendUp = await strava.isStravaBackendUp();
    if (!backendUp) {
        stravaBtn.textContent = "Strava Unavailable";
        return;
    }

    if (Strava.isConnected()) {
        stravaBtn.textContent = "Strava Connected";
        stravaBtn.disabled = true;
    } else {
        stravaBtn.textContent = "Connect Strava";
        stravaBtn.disabled = false;
        stravaBtn.addEventListener("click", () => strava.startOAuth());
    }
}

window.addEventListener("DOMContentLoaded", initStravaButton);

if (typeof window !== "undefined") {
  window.initSettings = initSettings;
}
