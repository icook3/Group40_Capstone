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
import { RampTestController } from "./workouts/RampTestController.js";

import { WorkoutStorage } from "./workoutStorage.js";
import { WorkoutSession } from "./workoutSession.js";
import { WorkoutSummary, showStopConfirmation } from "./workoutSummary.js";
import { MilestoneTracker } from "./milestones.js";
import { NotificationManager } from "./notifications.js";

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
AFRAME.registerComponent("no-cull", {
  init() {
    this.el.addEventListener("model-loaded", () => {
      this.el.object3D.traverse((obj) => (obj.frustumCulled = false));
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
// workout session
let workoutStorage;
let workoutSession;
// milestones
let notificationManager;
let milestoneTracker;
let rampController = null;
let peer;
let conn;
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

  //update workout session with current values
  if (workoutSession.isWorkoutActive()) {
    if (rampController) {
      // Update FTP result if available
      workoutSession.addFTPResult(rampController.ftpResult);
    }
    workoutSession.update({
      speed: constants.riderState.speed || 0,
      power: constants.riderState.power || 0,
      distance: hud.totalDistance,
      calories: constants.riderState.calories || 0,
    });

    //if there is a milestone show it
    const milestone = milestoneTracker.check();
    if (milestone) {
      //console.log("Milestone found, showing notification:", milestone.message);

      notificationManager.show(milestone.message, milestone.isSpecial);
    }
  }

  //Update Avatar and Pacer
  rider.setSpeed(constants.riderState.speed);
  rider.setPower(constants.riderState.power);

  // Cache rider speed (in km/h, same units as calculateAccelerationSpeed)
  const riderSpeed = constants.riderState.speed || 0;

  rider.update(dt);
  if (constants.pacerStarted&&peerState==0) {
    //console.log("Inside if statement");
    // Start from whatever speed the pacer currently has
    let pacerSpeed = pacer.speed || 0;

    if (rampController) {
      // RampTestController is active (Ramp Test workout)
      const targetWatts = rampController.getCurrentTargetWatts();

      if (targetWatts == null) {
        // Warmup or finished:
        // Pacer exactly matches the rider so it stays beside you.
        pacerSpeed = riderSpeed;
      } else {
        // Active ramp step:
        // Pacer behaves like an ideal rider holding target watts,
        // using the same physics as the real rider for smooth changes.
        pacerSpeed = calculateAccelerationSpeed(pacerSpeed, targetWatts, dt);
      }
    }
    // If rampController is null (free ride, other workouts),
    // pacerSpeed stays whatever was set elsewhere (test mode slider, etc.).

    // Apply the computed speed to the pacer avatar
    pacer.setSpeed(pacerSpeed);
    pacer.update(dt);

    // Update pacer position relative to the rider based on speed difference
    const relativeSpeed = pacerSpeed - riderSpeed;
    const pacerPos = pacer.avatarEntity.getAttribute("position");
    pacerPos.z -= relativeSpeed * dt;
    pacer.setPosition(pacerPos);
  } else if (peerState!=0&&connected&&pacer!=undefined) {
    pacer.update(dt);

    const riderSpeed = constants.riderState.speed;    
    const pacerSpeed = pacer.speed;
    const relativeSpeed = pacerSpeed - riderSpeed;
    const pacerPos = pacer.avatarEntity.getAttribute("position");
    pacerPos.z -= relativeSpeed * dt;
    pacer.setPosition(pacerPos);
  }

  // Let the ramp controller advance its state
  if (rampController) {
    const power = constants.riderState.power || 0;
    rampController.update(now, power);

    const target = rampController.getCurrentTargetWatts();
    constants.riderState.targetWatts = target || 0;
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
  sendPeerDataOver(constants.riderState.speed);
  requestAnimationFrameFn(loop);
}

export function activatePacer() {
  //if (peerState!=0) {return;}
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

function setPacerSpeed(speed) {
  if (peerState==0) {
    pacer.setSpeed(speed);
  }
}

//0: not in peer-peer mode
//1: host
//2: peer
let peerState=0;
let connected = false;
//used for frequent updates in update method
function sendPeerDataOver(speed) {
  //console.log("sending data: "+connected);
  if (connected&&conn.open) {
    conn.send({name:"speed",data:speed})
  }
}

function recieveData(data) {
  //console.log("Recieving data");
  //console.log(data);
  switch(data.name) {
    case "playerData":
      console.log("recieving player data");
      pacer = new AvatarMovement("pacer", {
        position: { x: 0.5, y: 1, z: 0 },
        isPacer: false,
      });
      pacer.creator.loadOtherData(data.data);
      if (peerState==1) {
        conn.send({name:"playerData", data:localStorage.getItem('playerData')});
      }
      break;
    case "speed":
      //console.log("Set pacer speed to "+data.data);
      if (pacer==null) {
        return;
      }
      activatePacer();
      pacer.setSpeed(Number(data.data));
      //console.log(pacer.speed);
      break;
    case "syncPlayers":
      if (scene && rider && pacer) {
        const riderSyncPos = rider.avatarEntity.getAttribute("position");
        const pacerSyncPos = pacer.avatarEntity.getAttribute("position");
        pacerSyncPos.z = riderSyncPos.z;
        pacer.avatarEntity.setAttribute("position", pacerSyncPos);
      }
      break;
  }
}


// Exported function to initialize app (for browser and test)
export function initZlowApp({
  getElement = (id) => document.getElementById(id),
  requestAnimationFrameFn = window.requestAnimationFrame,
} = {}) {
  // initialize peer-to-peer connection
  // if you are the peer
  if (sessionStorage.getItem('SelectedWorkout')=="peerServer") {
    peerState = 2;
    console.log("connecting to peer");
    peer = new Peer({host: constants.peerHost, port: constants.peerPort, path: constants.peerPath});
    peer.on('open', id => {
        conn = peer.connect(sessionStorage.getItem("peer"));
        console.log("ID="+id);

        setTimeout(() => {
            if (!connected) {
                alert("Connection timed out. Host offline, \nhost lobby is full \nor lobby does not exist");
                try { conn.close(); } catch {}
                peerState = 0;
                window.location.href="mainMenu.html"
            }
        }, 1500);

        //console.log("Peer: "+peer);
        conn.on('open', () => {
          console.log("connected!");
          console.log(conn);
          connected = true;
          // initially send over JSON of character design
          // when you recieve data
          conn.on("data", data => {
              if (data.name === "error") {
                  connected = false;
                  alert(data.data);
                  conn.close();
                  peerState = 0;
                  return;
              }

              recieveData(data);
          });
          conn.send({name:"playerData", data:localStorage.getItem('playerData')});
        });
        conn.on('error', function(err) {
            if (err.type === "peer-unavailable") {
                alert("Could not connect — the host does not exist.");
                peerState = 0;
                return;
            } else {
                console.error("Connection Error:", err);
            }

            console.error("Connection Error:", err);
        });
    });
    peer.on('error', function(err) {
        // Server/connection issue
        if (err.type === "network" || err.type === "server-error") {
            console.log("Network/server error");
            peerState = 0;
            return;
        }

        console.error("PeerJS error:", err);
    });
  }
  // You are hosting a session 
  else if (sessionStorage.getItem("peerToPeer")=='true') {
    peerState = 1;
    console.log("hosting peer");
    peer = new Peer(localStorage.getItem("Name"), {host: constants.peerHost, port: constants.peerPort, path: constants.peerPath});
    peer.on('open', function(id) {
        console.log("ID="+id);        
    });
    peer.on("connection", connection => {
        if (connected) {
            // reject second player
            connection.send({
                name: "error",
                data: "This lobby is full."
            });
            connection.close()
            return
        }

        conn = connection;
        connected = true;

        console.log("Peer JOINED lobby:", connection.peer);

        // Immediately listen for messages
        conn.on("data", data => recieveData(data));

        // Send host's player data back
        conn.send({
            name: "playerData",
            data: localStorage.getItem("playerData")
        });

        conn.on("error", err => {
            console.error("Connection error:", err);
        });
    });
    peer.on('error', function(err) {

        if (err.type === "unavailable-id") {
            alert("This name is already being used. Please choose a different one.");
            peerState = 0;
            window.location.href="mainMenu.html"
            return;
        }

        if (err.type === "peer-unavailable") {
            console.log("Peer unavailable.");
            return;
        }

        if (err.type === "network" || err.type === "server-error") {
            console.log("Network/server error");
            peerState = 0;
            return;
        }

        switch (err.type) {
            case "browser-incompatible":
                console.log("PeerJS not supported by this browser.");
                break;
            case "invalid-id":
                window.location.href = "./mainMenu.html";
                break;
        }

        console.error("PeerJS error:", err);
    });
  }
  const selectedWorkout = sessionStorage.getItem("SelectedWorkout") || "free";
  console.log("Selected workout:", selectedWorkout);

  // set up units properly
  units.setUnits();
  setUnits(units.speedUnit.name, "speed-unit");
  setUnits(units.weightUnit.name, "weight-unit");
  //setUnits(units.powerUnit.name,"power-unit");
  setUnits(units.distanceUnit.name, "distance-unit");

  // start tracking current workout stats
  workoutStorage = new WorkoutStorage();
  workoutSession = new WorkoutSession();

  // start notification manager and milestone tracker
  notificationManager = new NotificationManager();
  milestoneTracker = new MilestoneTracker(workoutSession, workoutStorage);

  const workoutSummary = new WorkoutSummary({
    workoutStorage,
    onClose: () => {
      window.location.href = 'mainMenu.html';
    },
  });

  workoutSession.start();
  milestoneTracker.reset();

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
  if (peerState == 0) {
    pacer = new AvatarMovement("pacer", {
      position: { x: 0.5, y: 1, z: -2 },
      isPacer: true,
    });
    pacer.creator.setPacerColors();
  }
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
      setPacerSpeed(val);
      // scene.setPacerSpeed(val);
    });

    setPacerSpeed(Number(pacerSpeedInput.value));
    pacerSpeedInput.addEventListener("input", () => {
      const val = Number(pacerSpeedInput.value);
      setPacerSpeed(val);
    });
  } else {
    if (sessionStorage.getItem("PacerSpeed") !== null) {
      const val = Number(sessionStorage.getItem("PacerSpeed"));
      scene = new ZlowScene(val, { getElement });
      // scene.setPacerSpeed(val);
      setPacerSpeed(val);
    } else {
      const val = 20;
      scene = new ZlowScene(val, { getElement });
      //scene.setPacerSpeed(val);
      setPacerSpeed(val);
    }
  }
  //map the pacer speed input to the pacer speed variable

  hud = new HUD({ getElement });

  // Map workout keys to user-facing labels
  const workoutLabels = {
    free: "Free Ride",
    ramp: "Ramp Test",
    sprint: "Sprint Intervals",
  };

  const workoutName = workoutLabels[selectedWorkout] || "Free Ride";

  // Set up ramp test controller if applicable
  if (selectedWorkout === "ramp") {
    const now = Date.now();
    rampController = new RampTestController({
      hud,
      nowMs: now,
      warmupSeconds: 5 * 60, // 5-minute warmup
      startWatts: 100,
      stepWatts: 20,
      stepSeconds: 60,
      ftpFactor: 0.75,
    });
  } else {
    rampController = null;
  }

  hud.showStartCountdown({
    workoutName,
    seconds: 5,
    onDone: () => {
      // After 5s, unpause the sim
      simulationState.isPaused = false;

      // If ramp, begin warmup countdown (no pause)
      if (selectedWorkout === "ramp") {
        // tell HUD to show 5-minute warmup timer
        hud.showWarmupCountdown({
          seconds: 5 * 60,
          onDone: () => {
            // Warmup over → tell RampTestController to start ramps
            rampController?.startRamp?.();
          },
        });
      }
    },
  });

  const strava = new Strava();

  //for testing purposes
  window.testHud = hud;
  window.testStorage = workoutStorage;
  window.testMilestones = milestoneTracker;

  //Pacer speed control input
  //Rider state and history
  if (localStorage.getItem("testMode") == "true") {
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
  let savedPacerSpeed;
  const pauseBtn = getElement("pause-btn");
  pauseBtn.addEventListener("click", () => {
    simulationState.isPaused = !simulationState.isPaused;
    pauseBtn.textContent = simulationState.isPaused ? "Resume" : "Pause";

    if (simulationState.isPaused) {
      hud.pause();
      savedPacerSpeed = pacer.speed;
      setPacerSpeed(0); // Stop pacer when paused
      // start countdown
      countdown.start(() => {
        // auto-resume when hits 0
        simulationState.isPaused = false;
        hud.resume();
        setPacerSpeed(savedPacerSpeed);
        pauseBtn.textContent = "Pause";
      });
    } else {
      // manual resume
      countdown.cancel();
      hud.resume();
      simulationState.isPaused = false;
      setPacerSpeed(savedPacerSpeed);
      pauseBtn.textContent = "Pause";
    }
  });

  document.addEventListener("click", async (e) => {
    if (e.target && e.target.id === "summary-export-tcx") {
      saveTCX();
    }

    if (e.target && e.target.id === "summary-export-strava") {
      await exportToStrava();
    }
  });

  /*const stopBtn = getElement("stop-btn");
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
  });*/
  const stopBtn = getElement("stop-btn");
  stopBtn.addEventListener("click", () => {
    // Show confirmation dialog
    showStopConfirmation(
      // On Confirm - end workout and show summary
      () => {
        // End the session and get final stats
        const finalStats = workoutSession.end();

        // After you compute finalStats from workoutSession / history, etc.
        if (selectedWorkout === "ramp" && rampController) {
          const result = rampController.computeFtpFromHistory(
            constants.rideHistory
          );
          if (result) {
            // Flatten FTP numbers into stats for summary + records
            finalStats.ftp = Math.round(result.ftp);
            finalStats.peakMinutePower = Math.round(result.peakMinute);

            hud.showWorkoutMessage({
              text: `Ramp Test FTP ≈ ${finalStats.ftp} W`,
              seconds: 8,
            });
          }
        }

        // Save workout and check for records
        const { newRecords, streak } = workoutStorage.saveWorkout(finalStats);

        // Show the summary!
        workoutSummary.show(finalStats, newRecords, streak);

        // Reset everything
        simulationState.isPaused = false;
        countdown.cancel();
        constants.historyStartTime = Date.now();
        constants.lastHistorySecond = null;
        constants.riderState = { power: 0, speed: 0 };
        hud.resetWorkOut();
        pauseBtn.textContent = "Pause";

        // Reset pacer
        setPacerSpeed(0);
        const startPos = { x: 0.5, y: 1, z: -2 };
        pacer.avatarEntity.setAttribute("position", startPos);
        constants.pacerStarted = false;

        // Start a new session for next workout
        workoutSession.start();
        milestoneTracker.reset();
      },
      // On Cancel
      () => {
        console.log("❌ Stop cancelled - continuing workout");
      }
    );
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
  const connectBtn = getElement("connect-btn");
  connectBtn.addEventListener("click", async () => {
    await standardMode.connectTrainer();
    const ok = await standardMode.trainer.connect();
    if (ok) connectBtn.disabled = true;
  });
  // Calibration modal button
  const calibrateModalBtn = getElement("calibrate-trainer-modal-btn");
  if (calibrateModalBtn) {
    calibrateModalBtn.addEventListener("click", () => {
      const modal = document.getElementById("calibration-modal");
      if (modal) {
        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");
        // Initialize calibration if not already done, passing the shared trainer
        if (window.initCalibration) {
          window.initCalibration({ trainer: standardMode.trainer });
        }
      }
    });
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

  loop();

  const pacerSyncBtn = getElement("pacer-sync-btn");
  pacerSyncBtn.addEventListener("click", () => {
    //Set pacer's z to rider's z
    if (scene && rider && pacer) {
      const riderSyncPos = rider.avatarEntity.getAttribute("position");
      const pacerSyncPos = pacer.avatarEntity.getAttribute("position");
      pacerSyncPos.z = riderSyncPos.z;
      pacer.avatarEntity.setAttribute("position", pacerSyncPos);
    }
    if (connected) {
      conn.send({name: "syncPlayers", data: {}});
    }
  });

  if (peerState!=0) {
    pacerSyncBtn.innerHTML = "Sync Players";
  }

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
    favicon.href = "../../resources/favicons/ZlowFavicon-dark.svg";
  } else {
    favicon.href = "../../resources/favicons/ZlowFavicon.svg";
  }
}

updateFavicon();
darkMode.addEventListener("change", updateFavicon);

// Gets workout summary
export function getWorkoutSummary() {
  const history = constants.rideHistory;
  if (!history || history.length < 2) return null;

  const startTime = history[0].time;
  const endTime = history[history.length - 1].time;

  const duration = Math.floor((endTime - startTime) / 1000);
  const distanceKm = history[history.length - 1].distance;
  const avgPower =
    history.reduce((sum, p) => sum + p.power, 0) / history.length;

  return {
    name: "Zlow Ride",
    description: "Workout synced from Zlow Cycling",
    distance: distanceKm, // km to m Strava converter happens inside upload
    duration: duration,
    avgPower: Math.round(avgPower),
  };
}

// Disable exporting if Strava is not connected
function updateStravaButtonState() {
  const btn = document.getElementById("summary-export-strava");
  if (!btn) return;
  btn.disabled = !Strava.isConnected();
}

updateStravaButtonState();
setInterval(updateStravaButtonState, 2000);

export async function exportToStrava() {
  const strava = new Strava();

  if (!Strava.isConnected()) {
    alert("You must connect to Strava first (from main menu).");
    return;
  }

  const workout = getWorkoutSummary();
  if (!workout) {
    alert("No workout data yet. Ride first!");
    return;
  }

  await strava.uploadActivity(workout);
}

// Generates TCX file based old saveTCX
export function generateTCXFile() {
  if (constants.rideHistory.length < 2) {
    return null;
  }

  const startTime = new Date(constants.rideHistory[0].time);
  let tcx = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  tcx += `<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd">\n`;
  tcx += `  <Activities>\n    <Activity Sport="Biking">\n      <Id>${startTime.toISOString()}</Id>\n      <Lap StartTime="${startTime.toISOString()}">\n        <TotalTimeSeconds>${Math.floor(
    (constants.rideHistory.at(-1).time - constants.rideHistory[0].time) / 1000
  )}</TotalTimeSeconds>\n        <DistanceMeters>${(
    constants.rideHistory.at(-1).distance * 1000
  ).toFixed(
    1
  )}</DistanceMeters>\n        <Intensity>Active</Intensity>\n        <TriggerMethod>Manual</TriggerMethod>\n        <Track>\n`;

  for (let pt of constants.rideHistory) {
    tcx += `          <Trackpoint>\n`;
    tcx += `            <Time>${new Date(pt.time).toISOString()}</Time>\n`;
    tcx += `            <Position><LatitudeDegrees>0</LatitudeDegrees><LongitudeDegrees>0</LongitudeDegrees></Position>\n`;
    tcx += `            <DistanceMeters>${(pt.distance * 1000).toFixed(
      1
    )}</DistanceMeters>\n`;
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

  return new Blob([tcx], { type: "application/vnd.garmin.tcx+xml" });
}

/**
 * Save a TCX file
 */
function saveTCX() {
  const tcxBlob = generateTCXFile();
  if (!tcxBlob) {
    alert("Not enough data to export.");
    return;
  }

  const url = URL.createObjectURL(tcxBlob);
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
