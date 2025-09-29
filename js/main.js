// main.js: App entry point and state management
import { TrainerBluetooth } from './bluetooth.js';
import { ZlowScene } from './scene.js';
import { HUD } from './hud.js';
import { Strava } from './strava.js';
import { constants } from './constants.js'

// Physics-based power-to-speed conversion
// Returns speed in m/s for given power (watts)
export function powerToSpeed({
  power  
} = {}) {
  // Use a root-finding approach for cubic equation: P = a*v^3 + b*v
  // a = 0.5 * airDensity * cda
  // b = crr * mass * g + mass * g * Math.sin(Math.atan(slope))
  const a = 0.5 * constants.airDensity * constants.cda;
  const b = constants.crr * constants.mass * constants.g + constants.mass * constants.g * Math.sin(Math.atan(constants.slope));
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
// define the scene and the hud
// so they can be used in multiple locations
let scene;
let hud;
// Handles the main loop and adding to the ride history
function loop({
    getElement = (id) => document.getElementById(id),
    requestAnimationFrameFn = window.requestAnimationFrame
} = {}) {
    const now = Date.now();
    const dt = (now - constants.lastTime) / 1000;
    constants.lastTime = now;
    scene.update(constants.riderState.speed || 0, dt);
    hud.update(constants.riderState, dt);
    const thisSecond = Math.floor((now - constants.historyStartTime) / 1000);
    if (constants.lastHistorySecond !== thisSecond) {
        constants.rideHistory.push({
            time: now,
            power: constants.riderState.power || 0,
            speed: constants.riderState.speed || 0,
            distance: parseFloat(getElement('distance').textContent) || 0
        });
        constants.lastHistorySecond = thisSecond;
    }
    requestAnimationFrameFn(loop);
}

/**
 * Utility methods to separate out various event listeners from the main method
 */
function activatePacer() {
    if (!constants.pacerStarted) {
        scene.activatePacer();
        constants.pacerStarted = true;
    }
}
function setKeyboardModeSpeed(key) {
    if (key === 'w' && !constants.wKeyDown) {
        constants.wKeyDown = true;
        constants.riderState.speed = constants.keyboardSpeed;
    } else if (key === 's' && !constants.sKeyDown) {
        constants.sKeyDown = true;
        constants.riderState.speed = constants.keyboardHalfSpeed;
    }
    activatePacer();
}

function stopKeyboardMode(key) {
    if (key === 'w') {
        constants.wKeyDown = false;
        constants.riderState.speed = constants.sKeyDown ? constants.keyboardHalfSpeed : 0;
    } else if (key === 's') {
        constants.sKeyDown = false;
        constants.riderState.speed = constants.wKeyDown ? constants.keyboardSpeed : 0;
    }
}

// Exported function to initialize app (for browser and test)
export function initZlowApp({
  getElement = (id) => document.getElementById(id),
  requestAnimationFrameFn = window.requestAnimationFrame
} = {}) {
  // get the needed objects
  const trainer = new TrainerBluetooth();
  const pacerSpeedInput = getElement('pacer-speed');
  scene = new ZlowScene(Number(pacerSpeedInput.value), { getElement });
  //map the pacer speed input to the pacer speed variable
  pacerSpeedInput.addEventListener('input', () => {
    const val = Number(pacerSpeedInput.value);
    scene.setPacerSpeed(val);
  });
  hud = new HUD({ getElement });
  const strava = new Strava();

  // keyboard mode initialization
  // setup the keyboard mode button
  const keyboardBtn = getElement('keyboard-btn');
  keyboardBtn.addEventListener('click', () => {
    constants.keyboardMode = !constants.keyboardMode;
    keyboardBtn.textContent = constants.keyboardMode ? 'Keyboard Mode: ON' : 'Keyboard Mode';
    if (!constants.keyboardMode) {
      constants.riderState.speed = 0;
    }
  });

  constants.wKeyDown = false;
  constants.sKeyDown = false;
  document.addEventListener('keydown', (e) => {
    if (!constants.keyboardMode) return;
    setKeyboardModeSpeed(e.key.toLowerCase());
  });
  document.addEventListener('keyup', (e) => {
    if (!constants.keyboardMode) return;
    stopKeyboardMode(e.key.toLowerCase());
  });


  // connect button
  const connectBtn = getElement('connect-btn');
  connectBtn.addEventListener('click', async () => {
    const ok = await trainer.connect();
    if (ok) connectBtn.disabled = true;
  });

  // setup the speed when using an actual trainer
  trainer.onData = data => {
  if (!constants.keyboardMode) {
      let speed = 0;
      if (typeof data.power === 'number' && data.power > 0) {
        speed = powerToSpeed({ power: data.power });
      }
      constants.riderState = { ...constants.riderState, power: data.power, speed };
      if (speed > 0) {
        activatePacer();
      }
    } else {
      constants.riderState = { ...constants.riderState, power: data.power };
    }
  };

  // Strava integration button - Stretch goal
  const stravaBtn = getElement('strava-btn');
  let stravaBtnEnabled = false;
  
  loop();
  getElement('gpx-btn').addEventListener('click', () => {
      saveTCX();
  });

  // pacer sync - maybe put in Avatar.js?
  const pacerSyncBtn = getElement('pacer-sync-btn');
  pacerSyncBtn.addEventListener('click', () => {
    // Set pacer's z to rider's z
    if (scene && scene.avatar && scene.pacer) {
      const riderPos = scene.avatar.getAttribute('position');
      scene.pacerPos.z = riderPos.z;
      scene.pacer.setAttribute('position', `${scene.pacerPos.x} ${scene.pacerPos.y} ${scene.pacerPos.z}`);
    }
  });

  // For testing: export some internals
  return {
    trainer,
    scene,
    hud,
    strava,
    getRiderState: () => riderState,
    getRideHistory: () => rideHistory,
    setRiderState: (state) => { riderState = state; },
    setKeyboardMode: (mode) => { keyboardMode = mode; },
    getKeyboardMode: () => keyboardMode,
    setPacerStarted: (val) => { pacerStarted = val; },
    getPacerStarted: () => pacerStarted,
    setLastTime: (val) => { lastTime = val; },
    getLastTime: () => lastTime,
    setHistoryStartTime: (val) => { historyStartTime = val; },
    getHistoryStartTime: () => historyStartTime,
    setLastHistorySecond: (val) => { lastHistorySecond = val; },
    getLastHistorySecond: () => lastHistorySecond,
  };
}

// For browser usage
if (typeof window !== 'undefined') {
  window.initZlowApp = initZlowApp;
}

/**
 * Save a TCX file
 */
function saveTCX() {
    if (constants.rideHistory.length < 2) {
        alert('Not enough data to export.');
        return;
    }
    const startTime = new Date(constants.rideHistory[0].time);
    let tcx = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    tcx += `<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd">\n`;
    tcx += `  <Activities>\n    <Activity Sport="Biking">\n      <Id>${startTime.toISOString()}</Id>\n      <Lap StartTime="${startTime.toISOString()}">\n        <TotalTimeSeconds>${Math.floor((constants.rideHistory[constants.rideHistory.length - 1].time - constants.rideHistory[0].time) / 1000)}</TotalTimeSeconds>\n        <DistanceMeters>${(constants.rideHistory[constants.rideHistory.length - 1].distance * 1000).toFixed(1)}<\/DistanceMeters>\n        <Intensity>Active<\/Intensity>\n        <TriggerMethod>Manual<\/TriggerMethod>\n        <Track>\n`;
    for (let i = 0; i < constants.rideHistory.length; i++) {
        const pt = constants.rideHistory[i];
        const t = new Date(pt.time).toISOString();
        const lat = 33.6 + (pt.distance / (constants.rideHistory[constants.rideHistory.length - 1].distance || 1)) * 0.009;
        const lon = -111.7;
        tcx += `          <Trackpoint>\n`;
        tcx += `            <Time>${t}</Time>\n`;
        tcx += `            <Position><LatitudeDegrees>${lat.toFixed(6)}</LatitudeDegrees><LongitudeDegrees>${lon.toFixed(6)}</LongitudeDegrees></Position>\n`;
        tcx += `            <DistanceMeters>${(pt.distance * 1000).toFixed(1)}</DistanceMeters>\n`;
        tcx += `            <Cadence>0</Cadence>\n`;
        tcx += `            <Extensions>\n`;
        tcx += `              <ns3:TPX xmlns:ns3="http://www.garmin.com/xmlschemas/ActivityExtension/v2">\n`;
        tcx += `                <ns3:Watts>${Math.round(pt.power)}</ns3:Watts>\n`;
        tcx += `                <ns3:Speed>${constants.kmhToMs(pt.speed).toFixed(3)}</ns3:Speed>\n`;
        tcx += `              </ns3:TPX>\n`;
        tcx += `            </Extensions>\n`;
        tcx += `          </Trackpoint>\n`;
    }
    tcx += `        </Track>\n      </Lap>\n    </Activity>\n  </Activities>\n</TrainingCenterDatabase>\n`;
    const blob = new Blob([tcx], { type: 'application/vnd.garmin.tcx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zlow-ride.tcx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    constants.rideHistory = [];
    constants.historyStartTime = Date.now();
    constants.lastHistorySecond = null;
}
