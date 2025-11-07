// main.js: App entry point and state management
import { TrainerBluetooth } from "./bluetooth.js";
import { ZlowScene } from "./scene/index.js";
import { HUD } from "./hud.js";
import { Strava } from "./strava.js";
import { constants } from "./constants.js";
import { AvatarCreator } from "./avatarCreator.js";
import { AvatarMovement } from "./avatarMovement.js";
import { KeyboardMode } from "./keyboardMode.js";
import { StandardMode } from "./standardMode.js";
import { simulationState } from "./simulationstate.js";
import { PauseCountdown } from "./pause_countdown.js";
import { units } from "./units/index.js";

// Physics-based power-to-speed conversion
// Returns speed in m/s for given power (watts)
export function powerToSpeed({ power } = {}) {
  // Use a root-finding approach for cubic equation: P = a*v^3 + b*v
  // a = 0.5 * airDensity * cda = air resistance
  // b = crr * mass * g + mass * g * Math.sin(Math.atan(slope)) = rolling resistance + gravity
  const a = 0.5 * constants.airDensity * constants.cda;
  const b =
    constants.crr * constants.mass * constants.g +
    constants.mass * constants.g * Math.sin(Math.atan(constants.slope));
  // Use Newton-Raphson to solve for v
  let v = 8; // initial guess (m/s)
  for (let i = 0; i < 20; i++) {
    const f = a * v * v * v + b * v - power;
    const df = 3 * a * v * v + b;
    v = v - f / df;
    if (v < 0) v = 0.1; // prevent negative speeds
  }
  return constants.msToKmh(v);
}

// Applies realistic coasting when power becomes zero
// Returns new calculated speed after dt seconds of coasting
export function calculateCoastingSpeed(currentSpeed, dt) {
  // Use meters for calculations
  const v_ms = constants.kmhToMs(currentSpeed);

  // If bycicle has stopped, speed stays at zero
  if (v_ms <= 0) return 0;

  // Calculate air drag from windResistance function
  const airDragForce = constants.windResistance(v_ms);

  // Calculate rolling resistance force
  const rollingResistanceForce = constants.crr * constants.mass * constants.g;

  // Calculate total resistance force
  const totalForce =
    (airDragForce + rollingResistanceForce) * constants.coastingFactor;

  // Calculate deceleration using acceleration = force / mass
  const deceleration = totalForce / constants.mass;

  // Apply decceleration as a function of time: new speed = current speed - (deceleration * delta time)
  const v_new_ms = v_ms - deceleration * dt;

  // Prevent the new speed from going negative (reverse)
  const finalSpeed_ms = Math.max(0, v_new_ms);

  // Convert speed to km/s
  return constants.msToKmh(finalSpeed_ms);
}

// Calculates acceleration to make speed increases gradual and more realistic
export function calculateAccelerationSpeed(currentSpeed, currentPower, dt) {
  // convert km to m (for standard physics equations)
  const v_ms = constants.kmhToMs(currentSpeed);

  // this prevents division by zero
  const v_for_calc = Math.max(v_ms, 0.1);

  // Calculates driving force from power: F = P / v
  const drivingForce = currentPower / v_for_calc;

  // calculates forces against cyclist
  const airDragForce = constants.windResistance(v_ms);
  const rollingResistanceForce = constants.crr * constants.mass * constants.g;

  // total force = forward force - resistance forces
  const netForce = drivingForce - airDragForce - rollingResistanceForce;

  // calculates acceleration using F = ma aka a = F/m
  const acceleration = netForce / constants.mass;

  // apply acceleration/delta time
  const v_new_ms = v_ms + acceleration * dt;

  // avoid going backwards (negative speed)
  const finalSpeed_ms = Math.max(0, v_new_ms);

  return constants.msToKmh(finalSpeed_ms);
}

// Prevent meshes from disappearing due to frustum culling
AFRAME.registerComponent('no-cull', {
    init() {
        this.el.addEventListener('model-loaded', () => {
            this.el.object3D.traverse(obj => obj.frustumCulled = false);
        });
    },
});

// define the scene and the hud
// so they can be used in multiple locations
let scene;
let hud;
let keyboardMode;
let standardMode;
//Avatar and Pacer
let rider;
let pacer;
// Handles the main loop and adding to the ride history
function loop({
  getElement = (id) => document.getElementById(id),
  requestAnimationFrameFn = window.requestAnimationFrame,
} = {}) {
  const now = Date.now();
  if (simulationState.isPaused) {
    requestAnimationFrameFn(() =>
      loop({ getElement, requestAnimationFrameFn })
    );
    return;
  }
  const dt = (now - constants.lastTime) / 1000;
  constants.lastTime = now;

  // Coasting happens here, only in Q/S keyboard mode
  const currentPower = constants.riderState.power || 0;
  const currentSpeed = constants.riderState.speed || 0;

  // Calculate calories burned using the following formula:
  // calories = (power in watts * delta time (seconds) / 1000)
  if (currentPower > 0) {
    const caloriesBurned = (currentPower * dt) / 1000;
    constants.riderState.calories =
      (constants.riderState.calories || 0) + caloriesBurned;
  }

  // If using W/S keyboard mode, don't coast (since power is always zero)
  const isUsingDirectSpeedControl =
    keyboardMode.wKeyDown || keyboardMode.sKeyDown;

  // calculates speed based on acceleration and power
  if (currentPower > 0 && !(keyboardMode.wKeyDown || keyboardMode.sKeyDown)) {
    constants.riderState.speed = calculateAccelerationSpeed(
      currentSpeed,
      currentPower,
      dt
    );
  }

  // If rider is not peddaling and their speed is not zero, calculate new speed
  if (currentPower === 0 && currentSpeed > 0 && !isUsingDirectSpeedControl) {
    constants.riderState.speed = calculateCoastingSpeed(currentSpeed, dt);
  }

  scene.update(constants.riderState.speed || 0, dt);

  //Update Avatar and Pacer
  rider.setSpeed(constants.riderState.speed);
  rider.setPower(constants.riderState.power);
  rider.update(dt);
  if (constants.pacerStarted) {
    pacer.update(dt);
    //Update pacer position
    const riderSpeed = constants.riderState.speed;
    const pacerSpeed = pacer.speed;
    const relativeSpeed = pacerSpeed - riderSpeed;
    const pacerPos = pacer.avatarEntity.getAttribute("position");
    pacerPos.z -= relativeSpeed * dt;
    pacer.setPosition(pacerPos);
  }
  hud.update(constants.riderState, dt);
  if (localStorage.getItem("testMode") == null) {
    localStorage.setItem("testMode", false);
  }
  if (localStorage.getItem("testMode") == "false") {
    keyboardMode.keyboardMode = false;
  } else {
    keyboardMode.keyboardMode = true;
  }

  const thisSecond = Math.floor((now - constants.historyStartTime) / 1000);

  //set up values to push
  let pushTime = now;
  let pushPower = constants.riderState.power || 0;
  let pushSpeed = units.speedUnit.convertFrom(constants.riderState.speed) || 0;
  let pushDistance =
    units.distanceUnit.convertFrom(
      parseFloat(getElement("distance").textContent)
    ) || 0;

  if (constants.lastHistorySecond !== thisSecond) {
    constants.rideHistory.push({
      time: pushTime,
      power: pushPower,
      speed: pushSpeed,
      distance: pushDistance,
    });
    constants.lastHistorySecond = thisSecond;
  }
  requestAnimationFrameFn(loop);
}

export function activatePacer() {
  if (!constants.pacerStarted) {
    //scene.activatePacer();
    constants.pacerStarted = true;
  }
}
function setUnits(storageVal, className) {
  let elements = document.getElementsByClassName(className);
  if (storageVal == null) {
    return;
  }
  for (let i = 0; i < elements.length; i++) {
    elements.item(i).innerHTML = storageVal;
  }
}
// Exported function to initialize app (for browser and test)
export function initZlowApp({
  getElement = (id) => document.getElementById(id),
  requestAnimationFrameFn = window.requestAnimationFrame,
} = {}) {

  const selectedWorkout = sessionStorage.getItem("SelectedWorkout") || "free";
  console.log("Selected workout:", selectedWorkout);
  
  // set up units properly
  units.setUnits();
  setUnits(units.speedUnit.name, "speed-unit");
  setUnits(units.weightUnit.name, "weight-unit");
  //setUnits(units.powerUnit.name,"power-unit");
  setUnits(units.distanceUnit.name, "distance-unit");

  // get the needed objects
  if (localStorage.getItem("testMode") !== "true") {
    const trainer = new TrainerBluetooth();
  } else {
    if (sessionStorage.getItem("Trainer") !== null) {
      try {
        //HOPEFULLY this works
        const trainer = JSON.parse(sessionStorage.getItem("Trainer"));
      } catch {
        console.log("JSON trainer did not work. This will need reworking :(");
      }
    }
  }

  const countdown = new PauseCountdown({ getElement, limit: 10 });

  rider = new AvatarMovement("rider", {
    position: { x: -0.5, y: 1, z: 0 },
    isPacer: false,
  });
  pacer = new AvatarMovement("pacer", {
    position: { x: 0.5, y: 1, z: -2 },
    isPacer: true,
  });
  pacer.creator.setPacerColors();
  keyboardMode = new KeyboardMode();
  standardMode = new StandardMode();

  // Show/hide dev hud based on testMode
  console.log("testMode value:", localStorage.getItem("testMode"));
  const devHud = getElement("dev-controls-hud");
  console.log("devHud element found:", devHud);

  if (devHud) {
    if (localStorage.getItem("testMode") === "true") {
      console.log("Removing hidden attribute");
      devHud.removeAttribute("hidden");
    } else {
      console.log("Adding hidden attribute");
      devHud.setAttribute("hidden", "");
    }
  } else {
    console.log("ERROR: dev-controls-panel element not found!");
  }

  if (localStorage.getItem("testMode") == "true") {
    const pacerSpeedInput = getElement("pacer-speed");
    scene = new ZlowScene(Number(pacerSpeedInput.value), { getElement });
    pacerSpeedInput.addEventListener("input", () => {
      const val = Number(pacerSpeedInput.value);
      pacer.setSpeed(val);
      // scene.setPacerSpeed(val);
    });

    pacer.setSpeed(Number(pacerSpeedInput.value));
    pacerSpeedInput.addEventListener("input", () => {
      const val = Number(pacerSpeedInput.value);
      pacer.setSpeed(val);
    });
  } else {
    if (sessionStorage.getItem("PacerSpeed") !== null) {
      const val = Number(sessionStorage.getItem("PacerSpeed"));
      scene = new ZlowScene(val, { getElement });
      // scene.setPacerSpeed(val);
      pacer.setSpeed(val);
    } else {
      const val = 20;
      scene = new ZlowScene(val, { getElement });
      //scene.setPacerSpeed(val);
      pacer.setSpeed(val);
    }
  }
  //map the pacer speed input to the pacer speed variable

  hud = new HUD({ getElement });
  const strava = new Strava();

  //Pacer speed control input
  //Rider state and history
  if (sessionStorage.getItem("testMode") == "true") {
    /*const keyboardBtn = getElement("keyboard-btn");
        keyboardBtn.removeAttribute("hidden");
        keyboardBtn.addEventListener("click", () => {
            keyboardMode.keyboardMode = !keyboardMode.keyboardMode;
            sessionStorage.setItem("isInKeyboardMode", keyboardMode.keyboardMode);
            keyboardBtn.textContent = keyboardMode.keyboardMode
                ? keyboardMode.keyboardOnText
                : "Keyboard Mode";*/
    if (!keyboardMode.keyboardMode) {
      constants.riderState.speed = 0;
    }
    //});
  }

  if (localStorage.getItem("testMode") == "true") {
    // Hook up live mass updates → optional immediate speed recompute
    const riderWeightEl = getElement("rider-weight");
    if (riderWeightEl) {
      const updateMassAndMaybeSpeed = () => {
        const newMass = Number(riderWeightEl.value);
        if (!Number.isFinite(newMass)) return;
        constants.riderMass = units.weightUnit.convertFrom(newMass);

        const p = constants.riderState.power || 0;
        const isDirectSpeed = keyboardMode?.wKeyDown || keyboardMode?.sKeyDown;

        // Only recompute from power if we're not in direct speed mode and power > 0
        if (p > 0 && !isDirectSpeed && !keyboardMode?.keyboardMode) {
          constants.riderState.speed = powerToSpeed({ power: p });
        }
        // If power === 0, coasting uses the new mass automatically on the next frame.
      };

      // Initialize once and then listen for changes
      updateMassAndMaybeSpeed();
      riderWeightEl.addEventListener("input", updateMassAndMaybeSpeed);
      riderWeightEl.addEventListener("change", updateMassAndMaybeSpeed);
    }
  } else {
    const updateMassAndMaybeSpeed = () => {
      let newMass;
      if (sessionStorage.getItem("weight") == null) {
        newMass = 70;
      } else {
        newMass = Number(sessionStorage.getItem("weight").value);
      }
      if (!Number.isFinite(newMass)) return;
      constants.riderMass = newMass;

      const p = constants.riderState.power || 0;
      const isDirectSpeed = keyboardMode?.wKeyDown || keyboardMode?.sKeyDown;

      // Only recompute from power if we're not in direct speed mode and power > 0
      if (p > 0 && !isDirectSpeed && !keyboardMode?.keyboardMode) {
        constants.riderState.speed = powerToSpeed({ power: p });
      }
      // If power === 0, coasting uses the new mass automatically on the next frame.
    };

    // Initialize once
    updateMassAndMaybeSpeed();
  }

  let savedPacerSpeed = pacer.speed;
  const pauseBtn = getElement("pause-btn");
  pauseBtn.addEventListener("click", () => {
    simulationState.isPaused = !simulationState.isPaused;
    pauseBtn.textContent = simulationState.isPaused ? "Resume" : "Pause";

    if (simulationState.isPaused) {
      hud.pause();
      savedPacerSpeed = pacer.speed;
      pacer.setSpeed(0); // Stop pacer when paused
      // start countdown
      countdown.start(() => {
        // auto-resume when hits 0
        simulationState.isPaused = false;
        hud.resume();
        pacer.setSpeed(savedPacerSpeed);
        pauseBtn.textContent = "Pause";
      });
    } else {
      // manual resume
      countdown.cancel();
      hud.resume();
      simulationState.isPaused = false;
      pacer.setSpeed(savedPacerSpeed);
      pauseBtn.textContent = "Pause";
    }
  });

  const stopBtn = getElement("stop-btn");
  stopBtn.addEventListener("click", () => {
    simulationState.isPaused = false;
    countdown.cancel();
    constants.rideHistory = [];
    constants.historyStartTime = Date.now();
    constants.lastHistorySecond = null;
    constants.riderState = { power: 0, speed: 0 };
    hud.resetWorkOut();
    pauseBtn.textContent = "Pause";

    // Reset pacer
    pacer.setSpeed(0);
    const startPos = { x: 0.5, y: 1, z: -2 };
    pacer.avatarEntity.setAttribute("position", startPos);
    constants.pacerStarted = false;
  });

  keyboardMode.wKeyDown = false;
  keyboardMode.sKeyDown = false;
  keyboardMode.qKeyDown = false;
  keyboardMode.aKeyDown = false;
  document.addEventListener("keydown", (e) => {
    if (!keyboardMode.keyboardMode) return;
    keyboardMode.keyboardInputActive(e.key);
  });
  document.addEventListener("keyup", (e) => {
    if (!keyboardMode.keyboardMode) return;
    keyboardMode.stopKeyboardMode(e.key.toLowerCase());
  });
  if (localStorage.getItem("testMode") == "true") {
    const connectBtn = getElement("connect-btn");
    connectBtn.addEventListener("click", async () => {
      await standardMode.connectTrainer();
      //const ok = await standardMode.trainer.connect();
      //if (ok) connectBtn.disabled = true;
    });
  } else {
    if (sessionStorage.getItem("Trainer") !== null) {
      try {
        //HOPEFULLY this works
        standardMode.setTrainer(JSON.parse(sessionStorage.getItem("Trainer")));
      } catch {
        console.log("JSON trainer did not work. This will need reworking :(");
      }
    }
  }
  standardMode.init();
  // setup the speed when using an actual trainer
  /*trainer.onData = (data) => {
      if (!keyboardMode.keyboardMode) {
      let speed = 0;
      if (typeof data.power === "number" && data.power > 0) {
        speed = powerToSpeed({ power: data.power });
      }
      constants.riderState = {
        ...constants.riderState,
        power: data.power,
        speed,
      };
      if (speed > 0) {
        activatePacer();
      }
    } else {
      constants.riderState = { ...constants.riderState, power: data.power };
    }
  };*/

  // Strava integration button - Stretch goal
  const stravaBtn = getElement("strava-btn");
  let stravaBtnEnabled = false;
  loop();
  getElement("gpx-btn").addEventListener("click", () => {
    saveTCX();
  });

  const pacerSyncBtn = getElement("pacer-sync-btn");
  pacerSyncBtn.addEventListener("click", () => {
    //Set pacer's z to rider's z
    if (scene && rider && pacer) {
      const riderSyncPos = rider.avatarEntity.getAttribute("position");
      const pacerSyncPos = pacer.avatarEntity.getAttribute("position");
      pacerSyncPos.z = riderSyncPos.z;
      pacer.avatarEntity.setAttribute("position", pacerSyncPos);
    }
  });

  // Calorie reset button
  const caloriesResetBtn = getElement("calories-reset-btn");
  caloriesResetBtn.addEventListener("click", () => {
    constants.riderState.calories = 0;
  });

  // For testing: export some internals
  return {
    scene,
    hud,
    strava,
    pacer,
    getRiderState: () => riderState,
    getRideHistory: () => rideHistory,
    setRiderState: (state) => {
      riderState = state;
    },
    setKeyboardMode: (mode) => {
      keyboardMode = mode;
    },
    getKeyboardMode: () => keyboardMode,
    setPacerStarted: (val) => {
      pacerStarted = val;
    },
    getPacerStarted: () => pacerStarted,
    setLastTime: (val) => {
      lastTime = val;
    },
    getLastTime: () => lastTime,
    setHistoryStartTime: (val) => {
      historyStartTime = val;
    },
    getHistoryStartTime: () => historyStartTime,
    setLastHistorySecond: (val) => {
      lastHistorySecond = val;
    },
    getLastHistorySecond: () => lastHistorySecond,
  };
}

// For browser usage
if (typeof window !== "undefined") {
  window.initZlowApp = initZlowApp;
}

// Switching icons for darkmode
const darkMode = window.matchMedia("(prefers-color-scheme: dark)");

function updateFavicon() {
  const favicon = document.querySelector('link[rel="icon"]');
  if (!favicon) {
    return;
  }

  if (darkMode.matches) {
    favicon.href = "/resources/favicons/ZlowFavicon-dark.svg";
  } else {
    favicon.href = "/resources/favicons/ZlowFavicon.svg";
  }
}

updateFavicon();
darkMode.addEventListener("change", updateFavicon);

/**
 * Save a TCX file
 */
function saveTCX() {
  if (constants.rideHistory.length < 2) {
    alert("Not enough data to export.");
    return;
  }
  const startTime = new Date(constants.rideHistory[0].time);
  let tcx = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  tcx += `<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd">\n`;
  tcx += `  <Activities>\n    <Activity Sport="Biking">\n      <Id>${startTime.toISOString()}</Id>\n      <Lap StartTime="${startTime.toISOString()}">\n        <TotalTimeSeconds>${Math.floor(
    (constants.rideHistory[constants.rideHistory.length - 1].time -
      constants.rideHistory[0].time) /
      1000
  )}</TotalTimeSeconds>\n        <DistanceMeters>${(
    constants.rideHistory[constants.rideHistory.length - 1].distance * 1000
  ).toFixed(
    1
  )}<\/DistanceMeters>\n        <Intensity>Active<\/Intensity>\n        <TriggerMethod>Manual<\/TriggerMethod>\n        <Track>\n`;
  for (let i = 0; i < constants.rideHistory.length; i++) {
    const pt = constants.rideHistory[i];
    const t = new Date(pt.time).toISOString();
    const lat =
      33.6 +
      (pt.distance /
        (constants.rideHistory[constants.rideHistory.length - 1].distance ||
          1)) *
        0.009;
    const lon = -111.7;
    tcx += `          <Trackpoint>\n`;
    tcx += `            <Time>${t}</Time>\n`;
    tcx += `            <Position><LatitudeDegrees>${lat.toFixed(
      6
    )}</LatitudeDegrees><LongitudeDegrees>${lon.toFixed(
      6
    )}</LongitudeDegrees></Position>\n`;
    tcx += `            <DistanceMeters>${(pt.distance * 1000).toFixed(
      1
    )}</DistanceMeters>\n`;
    tcx += `            <Cadence>0</Cadence>\n`;
    tcx += `            <Extensions>\n`;
    tcx += `              <ns3:TPX xmlns:ns3="http://www.garmin.com/xmlschemas/ActivityExtension/v2">\n`;
    tcx += `                <ns3:Watts>${Math.round(pt.power)}</ns3:Watts>\n`;
    tcx += `                <ns3:Speed>${constants
      .kmhToMs(pt.speed)
      .toFixed(3)}</ns3:Speed>\n`;
    tcx += `              </ns3:TPX>\n`;
    tcx += `            </Extensions>\n`;
    tcx += `          </Trackpoint>\n`;
  }
  tcx += `        </Track>\n      </Lap>\n    </Activity>\n  </Activities>\n</TrainingCenterDatabase>\n`;
  const blob = new Blob([tcx], { type: "application/vnd.garmin.tcx+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "zlow-ride.tcx";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  constants.rideHistory = [];
  constants.historyStartTime = Date.now();
  constants.lastHistorySecond = null;
}
