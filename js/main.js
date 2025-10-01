// Conversion constants and helpers (DRY)
export const KMH_TO_MS = 1000 / 3600;
export const MS_TO_KMH = 3600 / 1000;
export function kmhToMs(kmh) { return kmh * KMH_TO_MS; }
export function msToKmh(ms) { return ms * MS_TO_KMH; }

// Physics-based power-to-speed conversion
// Returns speed in m/s for given power (watts) and parameters
export function powerToSpeed({
  power,
  cda = 0.38, // drag area (m^2) - slightly higher for realism
    crr = 0.006, // rolling resistance coefficient - slightly higher for realism
    mass = Number(document.getElementById("rider-weight").getAttribute("value")), // total mass (kg)
  airDensity = 1.225, // kg/m^3
  slope = 0 // road grade (decimal)
} = {}) {
  // Constants
  const g = 9.8067; // gravity
  // Use a root-finding approach for cubic equation: P = a*v^3 + b*v
  // a = 0.5 * airDensity * cda
    // b = crr * mass * g + mass * g * Math.sin(Math.atan(slope))
    mass = Number(document.getElementById("rider-weight").value);
  const a = 0.5 * airDensity * cda;
  const b = crr * mass * g + mass * g * Math.sin(Math.atan(slope));
  // Use Newton-Raphson to solve for v
  let v = 8; // initial guess (m/s)
  for (let i = 0; i < 20; i++) {
    const f = a * v * v * v + b * v - power;
    const df = 3 * a * v * v + b;
    v = v - f / df;
    if (v < 0) v = 0.1; // prevent negative speeds
  }
  return msToKmh(v);
}

// main.js: App entry point and state management
import { TrainerBluetooth } from './bluetooth.js';
import { ZlowScene } from './scene.js';
import { HUD } from './hud.js';
import { Strava } from './strava.js';
import { Avatar } from './avatar.js'

// Exported function to initialize app (for browser and test)
export function initZlowApp({
  getElement = (id) => document.getElementById(id),
  requestAnimationFrameFn = window.requestAnimationFrame
} = {}) {
  const trainer = new TrainerBluetooth();
  const hud = new HUD({ getElement });
  const strava = new Strava();

  //Avatar and Pacer
  const rider = new Avatar('rider', '#0af', {x:-0.5, y:1, z:0});
  const pacer = new Avatar('pacer', '#fa0', {x:0.5, y:1, z:-2}, undefined, true);

  //Pacer speed control input
  const pacerSpeedInput = getElement('pacer-speed');
  const scene = new ZlowScene(Number(pacerSpeedInput.value), { getElement });
  pacer.setSpeed((Number(pacerSpeedInput.value)));
  pacerSpeedInput.addEventListener('input', () => {
      const val = Number(pacerSpeedInput.value);
      pacer.setSpeed((val));
  });

  //Rider state and history
  let riderState = { power: 0, speed: 0 };
  let rideHistory = [];
  let historyStartTime = Date.now();
  let lastHistorySecond = null;
  let pacerStarted = false;
  let lastTime = Date.now();

  let keyboardMode = false;
  let keyboardSpeed = kmhToMs(100);
  let keyboardHalfSpeed = kmhToMs(50);
  const keyboardBtn = getElement('keyboard-btn');
  keyboardBtn.addEventListener('click', () => {
    keyboardMode = !keyboardMode;
    keyboardBtn.textContent = keyboardMode ? 'Keyboard Mode: ON' : 'Keyboard Mode';
    if (!keyboardMode) {
      riderState.speed = 0;
    }
  });

  let wKeyDown = false;
  let sKeyDown = false;
  document.addEventListener('keydown', (e) => {
    if (!keyboardMode) return;
    const key = e.key.toLowerCase();
    if (key === 'w' && !wKeyDown) {
      wKeyDown = true;
        riderState.speed = keyboardSpeed;
      pacerStarted = true;
    } else if (key === 's' && !sKeyDown) {
      sKeyDown = true;
        riderState.speed = keyboardHalfSpeed;
      pacerStarted = true;
    }
  });
  document.addEventListener('keyup', (e) => {
    if (!keyboardMode) return;
    const key = e.key.toLowerCase();
    if (key === 'w') {
      wKeyDown = false;
        riderState.speed = sKeyDown ? keyboardHalfSpeed: 0;
    } else if (key === 's') {
        sKeyDown = false;
        riderState.speed = wKeyDown ? speed = keyboardHalfSpeed: 0;
    }
  });

  const connectBtn = getElement('connect-btn');
  connectBtn.addEventListener('click', async () => {
    const ok = await trainer.connect();
    if (ok) connectBtn.disabled = true;
  });

  trainer.onData = data => {
    if (!keyboardMode) {
      let speed = 0;
      if (typeof data.power === 'number' && data.power > 0) {
        speed = powerToSpeed({ power: data.power });
      }
      riderState = { ...riderState, power: data.power, speed };
      if (speed > 0 && !pacerStarted) {
        pacerStarted = true;
      }
    } else {
      riderState = { ...riderState, power: data.power };
    }
  };

  const stravaBtn = getElement('strava-btn');
  let stravaBtnEnabled = false;

  //Main Loop
  function loop() {
    const now = Date.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;
    scene.update(riderState.speed || 0, dt);

    //Update Avatar and Pacer
    rider.setSpeed(riderState.speed);
    rider.update(dt);
    if (pacerStarted) {
        pacer.update(dt);
        //Update pacer position
        const riderSpeed = riderState.speed;
        const pacerSpeed = pacer.speed;
        const relativeSpeed = pacerSpeed - riderSpeed;
        const pacerPos = pacer.avatarEntity.getAttribute('position');
        pacerPos.z -= relativeSpeed * dt;
        pacer.avatarEntity.setAttribute('position', pacerPos);
    }

    hud.update(riderState, dt);
    const thisSecond = Math.floor((now - historyStartTime) / 1000);
    if (lastHistorySecond !== thisSecond) {
      rideHistory.push({
        time: now,
        power: riderState.power || 0,
        speed: riderState.speed || 0,
        distance: parseFloat(getElement('distance').textContent) || 0
      });
      lastHistorySecond = thisSecond;
    }
    requestAnimationFrameFn(loop);
  }
  loop();

  getElement('gpx-btn').addEventListener('click', () => {
    if (rideHistory.length < 2) {
      alert('Not enough data to export.');
      return;
    }
    const startTime = new Date(rideHistory[0].time);
    let tcx = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    tcx += `<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd">\n`;
    tcx += `  <Activities>\n    <Activity Sport="Biking">\n      <Id>${startTime.toISOString()}</Id>\n      <Lap StartTime="${startTime.toISOString()}">\n        <TotalTimeSeconds>${Math.floor((rideHistory[rideHistory.length-1].time - rideHistory[0].time)/1000)}</TotalTimeSeconds>\n        <DistanceMeters>${(rideHistory[rideHistory.length-1].distance*1000).toFixed(1)}<\/DistanceMeters>\n        <Intensity>Active<\/Intensity>\n        <TriggerMethod>Manual<\/TriggerMethod>\n        <Track>\n`;
    for (let i = 0; i < rideHistory.length; i++) {
      const pt = rideHistory[i];
      const t = new Date(pt.time).toISOString();
      const lat = 33.6 + (pt.distance / (rideHistory[rideHistory.length-1].distance || 1)) * 0.009;
      const lon = -111.7;
      tcx += `          <Trackpoint>\n`;
      tcx += `            <Time>${t}</Time>\n`;
      tcx += `            <Position><LatitudeDegrees>${lat.toFixed(6)}</LatitudeDegrees><LongitudeDegrees>${lon.toFixed(6)}</LongitudeDegrees></Position>\n`;
      tcx += `            <DistanceMeters>${(pt.distance*1000).toFixed(1)}</DistanceMeters>\n`;
      tcx += `            <Cadence>0</Cadence>\n`;
      tcx += `            <Extensions>\n`;
      tcx += `              <ns3:TPX xmlns:ns3="http://www.garmin.com/xmlschemas/ActivityExtension/v2">\n`;
      tcx += `                <ns3:Watts>${Math.round(pt.power)}</ns3:Watts>\n`;
      tcx += `                <ns3:Speed>${kmhToMs(pt.speed).toFixed(3)}</ns3:Speed>\n`;
      tcx += `              </ns3:TPX>\n`;
      tcx += `            </Extensions>\n`;
      tcx += `          </Trackpoint>\n`;
    }
    tcx += `        </Track>\n      </Lap>\n    </Activity>\n  </Activities>\n</TrainingCenterDatabase>\n`;
    const blob = new Blob([tcx], {type: 'application/vnd.garmin.tcx+xml'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zlow-ride.tcx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    rideHistory = [];
    historyStartTime = Date.now();
    lastHistorySecond = null;
  });

  const pacerSyncBtn = getElement('pacer-sync-btn');
  pacerSyncBtn.addEventListener('click', () => {
    //Set pacer's z to rider's z
    if (scene && rider && pacer) {
      const riderSyncPos = rider.avatarEntity.getAttribute('position');
      const pacerSyncPos = pacer.avatarEntity.getAttribute('position');
      pacerSyncPos.z = riderSyncPos.z;
      pacer.avatarEntity.setAttribute('position', pacerSyncPos);
    }
  });

  // For testing: export some internals
  return {
    trainer,
    scene,
    hud,
    strava,
    avatar,
    pacer,
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
