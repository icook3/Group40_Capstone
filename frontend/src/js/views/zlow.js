import { TrainerBluetooth } from "../bluetooth.js";
import { ZlowScene } from "../scene/index.js";
import { HUD } from "../hud.js";
import { Strava } from "../strava.js";
import { constants } from "../constants.js";
import { AvatarCreator } from "../avatarCreator.js";
import { AvatarMovement } from "../avatarMovement.js";
import { KeyboardMode } from "../keyboardMode.js";
import { StandardMode } from "../standardMode.js";
import { simulationState } from "../simulationstate.js";
import { PauseCountdown } from "../pause_countdown.js";
import { units } from "../units/index.js";
import { RampTestController } from "../workouts/RampTestController.js";
import { rideHistory } from "../rideHistoryStore.js";
import { WorkoutStorage } from "../workoutStorage.js";
import { WorkoutSession } from "../workoutSession.js";
import { WorkoutSummary, showStopConfirmation } from "../workoutSummary.js";
import { MilestoneTracker } from "../milestones.js";
import { NotificationManager } from "../notifications.js";
import {initCrashReporter} from "../crashReporter.js";
import { PhysicsEngine } from "../PhysicsEngine.js";

export class zlowScreen {
    content;
    ready=false;

    //other variables used in the main zlow app
    workoutStorage;
    workoutSession;
    notificationManager;
    milestoneTracker;
    rider;
    pacer;
    physics;
    pacerPhysics;
    keyboardMode;
    standardMode;
    scene;
    hud;
    rampController;
    //0: not in peer-peer mode
    //1: host
    //2: peer
    peerState=0;
    connected = false;

    loopRunning=false;

    constructor(setWhenDone) {
        fetch("../html/zlow.html").then((content)=> {
            return content.text();
        }).then((content)=> {
            this.content=content;
            if (setWhenDone) {
                this.setPage();
            }
            this.ready=true;
        });
    }

    setPage() {
        document.getElementById("mainDiv").innerHTML=this.content;
        this.initZlowApp();
        window.testNotifications = new NotificationManager();
    }

    initializeTiles() {
        const scene = document.getElementById("scene");
        // Add as a new thing rather than getting the entity??
        const tilesEntity = scene.querySelector("#tiles");
        for (let z = 0; z < constants.gridDepth; z++) {
          for (let x = 0; x < constants.gridWidth; x++) {
            const color =
              (x + z) % 2 === 0
                ? constants.groundColor1
                : constants.groundColor2;
            const tile = document.createElement("a-entity");
            tile.setAttribute(
              "geometry",
              `primitive: box; width: ${constants.tileSize}; height: ${constants.height}; depth: ${constants.tileSize}`
            );
            //tile.setAttribute('material', `color: ${color}; roughness: ${constants.roughness}; metalness: ${constants.metalness}`);
            tile.setAttribute("material", "src: #grass-texture");
            tile.setAttribute(
              "position",
              `${constants.startX + x * constants.tileSize} 0 ${
                constants.startZ - z * constants.tileSize
              }`
            );
            tilesEntity.appendChild(tile);
          }
        }
    }

    darkMode = window.matchMedia("(prefers-color-scheme: dark)");
    updateFavicon() {
      const favicon = document.querySelector('link[rel="icon"]');
      if (!favicon) {
        return;
      }

      if (this.darkMode.matches) {
        favicon.href = "../../resources/favicons/ZlowFavicon-dark.svg";
      } else {
        favicon.href = "../../resources/favicons/ZlowFavicon.svg";
      }
    }

    activatePacer() {
      //if (this.peerState!=0) {return;}
      if (!constants.pacerStarted) {
        //this.scene.activatePacer();
        constants.pacerStarted = true;
      }
    }
    setUnits(storageVal, className) {
      let elements = document.getElementsByClassName(className);
      if (storageVal == null) {
        return;
      }
      for (let i = 0; i < elements.length; i++) {
        elements.item(i).innerHTML = storageVal;
      }
    }
    
    setPacerSpeed(speed) {
      if (this.peerState==0) {
        this.pacer.setSpeed(speed);
        this.pacerPhysics.setSpeed(speed);
      }
    }
    


    //used for frequent updates in update method
    sendPeerDataOver(speed) {
      //console.log("sending data: "+this.connected);
      if (this.connected&&conn.open) {
        conn.send({name:"speed",data:speed})
      }
    }
    
    recieveData(data) {
      //console.log("Recieving data");
      //console.log(data);
      switch(data.name) {
        case "playerData":
          console.log("recieving player data");
          this.pacer = new AvatarMovement("pacer-entity", {
            position: { x: 0.5, y: 1, z: 0 },
            isPacer: false,
          });
          this.pacer.creator.loadOtherData(data.data);
          if (this.peerState==1) {
            conn.send({name:"playerData", data:localStorage.getItem('playerData')});
          }
          break;
        case "speed":
          //console.log("Set pacer speed to "+data.data);
          if (this.pacer==null) {
            return;
          }
          activatePacer();
          this.pacer.setSpeed(Number(data.data));
          this.pacerPhysics.setSpeed(Number(data.data));
          //console.log(this.pacer.speed);
          break;
        case "syncPlayers":
          if (this.scene && this.rider && this.pacer) {
            const riderSyncPos = this.rider.avatarEntity.getAttribute("position");
            const pacerSyncPos = this.pacer.avatarEntity.getAttribute("position");
            pacerSyncPos.z = riderSyncPos.z;
            
            // Set pacer constants to rider constants and adjust animation
            constants.pacerCurrentTrackPiece = constants.currentTrackPiece;
            document.getElementById('pacer-speed').value = this.pacerPhysics.getSpeed();
            this.pacer.avatarEntity.removeAttribute("animation__2");
            this.pacer.avatarEntity.setAttribute("animation__2", `property: position; to: ${constants.trackPoints[constants.pacerCurrentTrackPiece].x + 0.5} ${constants.trackPoints[constants.pacerCurrentTrackPiece].y} ${constants.trackPoints[constants.pacerCurrentTrackPiece].z}; dur: ${this.rider.avatarEntity.getAttribute("animation__1").dur}; easing: linear; loop: false; autoplay:true;`);
            this.pacer.avatarEntity.setAttribute("position", pacerSyncPos);
          }
          break;
      }
    }


    /**
     * MAIN ZLOW FLOW
     * 
     * separated from the rest of this for improved readability
     * 
     * 
     */


    reset() {
        this.loopRunning=false;
        constants.riderState={power: 0,speed: 0,calories: 0};
        constants.pacerStarted = false;
    }

    // Handles the main loop and adding to the ride history
    loop({
      getElement = (id) => document.getElementById(id),
      requestAnimationFrameFn = window.requestAnimationFrame,
      owner = this
    } = {}) {
      if (!owner.loopRunning) {
        return;
      }
      const now = Date.now();
      if (simulationState.isPaused) {
        requestAnimationFrameFn(() =>
          owner.loop({ getElement, requestAnimationFrameFn, owner })
        );
        return;
      }
      const dt = (now - constants.lastTime) / 1000;
      constants.lastTime = now;
    
      const currentPower = constants.riderState.power || 0;
      constants.riderState.speed = owner.physics.update(currentPower, dt);
    
      // Calculate calories burned using the following formula:
      // calories = (power in watts * delta time (seconds) / 1000)
      if (currentPower > 0) {
        const caloriesBurned = (currentPower * dt) / 1000;
        constants.riderState.calories =
          (constants.riderState.calories || 0) + caloriesBurned;
      }
    
      owner.scene.update(constants.riderState.speed || 0, dt);
    
      //update workout session with current values
      if (owner.workoutSession.isWorkoutActive()) {
        if (owner.rampController) {
          // Update FTP result if available
          owner.workoutSession.addFTPResult(owner.rampController.ftpResult);
        }
        owner.workoutSession.update({
          speed: constants.riderState.speed || 0,
          power: constants.riderState.power || 0,
          distance: owner.hud.totalDistance,
          calories: constants.riderState.calories || 0,
        });
    
        //if there is a milestone show it
        const milestone = owner.milestoneTracker.check();
        if (milestone) {
          //console.log("Milestone found, showing notification:", milestone.message);
    
          owner.notificationManager.show(milestone.message, milestone.isSpecial);
        }
      }
    
      //Update Avatar and Pacer
      owner.rider.setSpeed(constants.riderState.speed);
      owner.rider.setPower(constants.riderState.power);
    
      owner.rider.update(dt);
    
      if (constants.pacerStarted&&owner.peerState==0) {
        //console.log("Inside if statement");
        // Start from whatever speed the pacer currently has
        let pacerSpeed = owner.pacerPhysics.getSpeed();
    
        if (owner.rampController) {
          // RampTestController is active (Ramp Test workout)
          const targetWatts = owner.rampController.getCurrentTargetWatts();
    
          if (targetWatts == null) {
            // Warmup or finished:
            // Pacer exactly matches the rider so it stays beside you.
            pacerSpeed = constants.riderState.speed;
            owner.pacerPhysics.setSpeed(pacerSpeed);
          } else {
            // Active ramp step:
            // Pacer behaves like an ideal rider holding target watts,
            // using the same physics as the real rider for smooth changes.
            pacerSpeed = owner.pacerPhysics.update(targetWatts, dt);
          }
        }
        // If rampController is null (free ride, other workouts),
        // pacerSpeed stays whatever was set elsewhere (test mode slider, etc.).
    
        // Apply the computed speed to the pacer avatar
        owner.pacer.setSpeed(pacerSpeed);
        owner.pacerPhysics.setSpeed(pacerSpeed);
        owner.pacer.update(dt);
      }
    
      // Let the ramp controller advance its state
      if (owner.rampController) {
        const power = constants.riderState.power || 0;
        owner.rampController.update(now, power);
    
        const target = owner.rampController.getCurrentTargetWatts();
        constants.riderState.targetWatts = target || 0;
      }
    
      owner.hud.update(constants.riderState, dt);
      if (localStorage.getItem("testMode") == null) {
        localStorage.setItem("testMode", false);
      }
      if (localStorage.getItem("testMode") == "false") {
        owner.keyboardMode.keyboardMode = false;
      } else {
        owner.keyboardMode.keyboardMode = true;
      }
    
      //set up values to push
      let pushTime = performance.now();
      let pushPower = constants.riderState.power || 0;
      let pushSpeed = units.speedUnit.convertFrom(constants.riderState.speed) || 0;
      let pushDistance =
        units.distanceUnit.convertFrom(
          parseFloat(getElement("distance").textContent)
        ) || 0;
    
      rideHistory.pushSample(pushTime, pushPower, pushSpeed, pushDistance);
    
      owner.sendPeerDataOver(constants.riderState.speed);
      requestAnimationFrameFn(() =>
          owner.loop({ getElement, requestAnimationFrameFn, owner })
      );
    }
    
    // Exported function to initialize app (for browser and test)
    initZlowApp({
      getElement = (id) => document.getElementById(id),
      requestAnimationFrameFn = window.requestAnimationFrame,
    } = {}) {
        this.peerState=0;
        this.loopRunning=false;
        this.connected=false;
        this.initializeTiles();
        /*AFRAME.registerComponent("no-cull", {
          init() {
            this.el.addEventListener("model-loaded", () => {
              this.el.object3D.traverse((obj) => (obj.frustumCulled = false));
            });
          },
        });*/
        this.updateFavicon();
        this.darkMode.addEventListener("change", this.updateFavicon);

        window.__zlowInitCount = (window.__zlowInitCount || 0) + 1;
        console.log("initZlowApp count:", window.__zlowInitCount);
      
        // Initialize crash reporter to collect game related data
        initCrashReporter(async () => {
            const rideSamples = rideHistory.samples || [];
            const lastSample = rideSamples.at(-1);
            const elapsedMs = lastSample ? lastSample.elapsedMs : 0;
            const workoutSeconds = Math.floor(elapsedMs / 1000);
    
            let riderPos = null;
            let pacerPos = null;
    
            try {
                const riderEl = document.getElementById("rider");
                const pacerEl = document.getElementById("pacer");
    
                riderPos = riderEl?.getAttribute("position") || null;
                pacerPos = pacerEl?.getAttribute("position") || null;
            } catch {}
    
            let aframeStats = null;
    
            try {
                const rideScene = AFRAME?.scenes?.[0];
                const info = rideScene?.renderer?.info;
    
                if (rideScene && info) {
                    aframeStats = {
                        geometries: info.memory?.geometries,
                        textures: info.memory?.textures,
                        programs: info.programs?.length,
                        drawCalls: info.render?.calls,
                        triangles: info.render?.triangles,
                        entities: rideScene.querySelectorAll('a-entity')?.length,
                    };
                }
            } catch (e) {
                aframeStats = { error: "failed to read aframe stats" };
            }
            tempPeerState=this.peerState;
            return {
                workout: sessionStorage.getItem("SelectedWorkout") || "free",
                samples: rideHistory.samples?.length,
                workoutSeconds: workoutSeconds,
    
                speed: lastSample?.speed ?? 0,
                power: lastSample?.power ?? 0,
                riderPosition: riderPos,
                pacerPosition: pacerPos,
    
                aframe: aframeStats,
    
                testMode: localStorage.getItem("testMode"),
                trainerConnected: !!this.standardMode?.trainer?.isConnected,
    
                tempPeerState,
                peerConnected: this.connected,
                peerOpen: conn?.open,
                peerId: peer?.id,
            };
        });
    
      // initialize peer-to-peer connection
      // if you are the peer
      if (sessionStorage.getItem('SelectedWorkout')=="peerServer") {
        this.peerState = 2;
        console.log("connecting to peer");
        peer = new Peer({host: constants.peerHost, port: constants.peerPort, path: constants.peerPath});
        peer.on('open', id => {
            conn = peer.connect(sessionStorage.getItem("peer"));
            console.log("ID="+id);
    
            setTimeout(() => {
                if (!this.connected) {
                    alert("Connection timed out. Host offline, \nhost lobby is full \nor lobby does not exist");
                    try { conn.close(); } catch {}
                    this.peerState = 0;
                    viewManager.setView(viewManager.views.mainMenu)
                }
            }, 1500);
    
            //console.log("Peer: "+peer);
            conn.on('open', () => {
              console.log("connected!");
              console.log(conn);
              this.connected = true;
              // initially send over JSON of character design
              // when you recieve data
              conn.on("data", data => {
                  if (data.name === "error") {
                      this.connected = false;
                      alert(data.data);
                      conn.close();
                      this.peerState = 0;
                      return;
                  }
    
                  recieveData(data);
              });
              conn.send({name:"playerData", data:localStorage.getItem('playerData')});
            });
            conn.on('error', function(err) {
                if (err.type === "peer-unavailable") {
                    alert("Could not connect — the host does not exist.");
                    this.peerState = 0;
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
                this.peerState = 0;
                return;
            }
    
            console.error("PeerJS error:", err);
        });
      }
      // You are hosting a session 
      else if (sessionStorage.getItem("peerToPeer")=='true') {
        this.peerState = 1;
        console.log("hosting peer");
        peer = new Peer(localStorage.getItem("Name"), {host: constants.peerHost, port: constants.peerPort, path: constants.peerPath});
        peer.on('open', function(id) {
            console.log("ID="+id);        
        });
        peer.on("connection", connection => {
            if (this.connected) {
                // reject second player
                connection.send({
                    name: "error",
                    data: "This lobby is full."
                });
                connection.close()
                return
            }
    
            conn = connection;
            this.connected = true;
    
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
                this.peerState = 0;
                viewManager.setView(viewManager.views.mainMenu);
                return;
            }
    
            if (err.type === "peer-unavailable") {
                console.log("Peer unavailable.");
                return;
            }
    
            if (err.type === "network" || err.type === "server-error") {
                console.log("Network/server error");
                this.peerState = 0;
                return;
            }
    
            switch (err.type) {
                case "browser-incompatible":
                    console.log("PeerJS not supported by this browser.");
                    break;
                case "invalid-id":
                    viewManager.setView(viewManager.views.mainMenu);
                    break;
            }
    
            console.error("PeerJS error:", err);
        });
      }
      const selectedWorkout = sessionStorage.getItem("SelectedWorkout") || "free";
      console.log("Selected workout:", selectedWorkout);
    
      // set up units properly
      units.setUnits();
      this.setUnits(units.speedUnit.name, "speed-unit");
      this.setUnits(units.weightUnit.name, "weight-unit");
      //setUnits(units.powerUnit.name,"power-unit");
      this.setUnits(units.distanceUnit.name, "distance-unit");
    
      // start tracking current workout stats
      this.workoutStorage = new WorkoutStorage();
      this.workoutSession = new WorkoutSession();
    
      // start notification manager and milestone tracker
      this.notificationManager = new NotificationManager();
      this.milestoneTracker = new MilestoneTracker(this.workoutSession, this.workoutStorage);
      
      //let tempWorkoutStorage=this.workoutStorage;
      const workoutSummary = new WorkoutSummary({
        workoutStorage: this.workoutStorage,
        onClose: () => {
          viewManager.setView(viewManager.views.mainMenu);
        },
      });
    
      this.workoutSession.start();
      this.milestoneTracker.reset();
    
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
    
      this.rider = new AvatarMovement("rider", {
        position: { x: -0.5, y: 1, z: 0 },
        isPacer: false,
      });
      this.physics = new PhysicsEngine();
      console.log("setting physics to");
      console.log(this.physics);
    
      if (this.peerState == 0) {
        this.pacer = new AvatarMovement("pacer-entity", {
          position: { x: 0.5, y: 1, z: -2 },
          isPacer: true,
        });
        this.pacerPhysics = new PhysicsEngine();
        this.pacer.creator.setPacerColors();
      }
      this.keyboardMode = new KeyboardMode();
      this.standardMode = new StandardMode();
    
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
        this.scene = new ZlowScene(Number(pacerSpeedInput.value), { getElement });
        pacerSpeedInput.addEventListener("input", () => {
          const val = Number(pacerSpeedInput.value);
          this.setPacerSpeed(val);
          // this.scene.setPacerSpeed(val);
        });
    
        this.setPacerSpeed(Number(pacerSpeedInput.value));
        pacerSpeedInput.addEventListener("input", () => {
          const val = Number(pacerSpeedInput.value);
          this.setPacerSpeed(val);
        });
      } else {
        if (sessionStorage.getItem("PacerSpeed") !== null) {
          const val = Number(sessionStorage.getItem("PacerSpeed"));
          this.scene = new ZlowScene(val, { getElement });
          // this.scene.setPacerSpeed(val);
          this.setPacerSpeed(val);
        } else {
          const val = 20;
          this.scene = new ZlowScene(val, { getElement });
          //this.scene.setPacerSpeed(val);
          this.setPacerSpeed(val);
        }
      }
      //map the pacer speed input to the pacer speed variable
    
      this.hud = new HUD({ getElement });
      this.hud.initTrainerToggle();
    
    
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
        let tempHud=this.hud;
        this.rampController = new RampTestController({
          tempHud,
          nowMs: now,
          warmupSeconds: 5 * 60, // 5-minute warmup
          startWatts: 100,
          stepWatts: 20,
          stepSeconds: 60,
          ftpFactor: 0.75,
        });
      } else {
        this.rampController = null;
      }
    
      this.hud.showStartCountdown({
        workoutName,
        seconds: 5,
        onDone: () => {
          // After 5s, unpause the sim
          simulationState.isPaused = false;
    
          // If ramp, begin warmup countdown (no pause)
          if (selectedWorkout === "ramp") {
            // tell HUD to show 5-minute warmup timer
            this.hud.showWarmupCountdown({
              seconds: 5 * 60,
              onDone: () => {
                // Warmup over → tell RampTestController to start ramps
                this.rampController?.startRamp?.();
              },
            });
          }
        },
      });
    
      const strava = new Strava();
    
      //for testing purposes
      window.testHud = this.hud;
      window.testStorage = this.workoutStorage;
      window.testMilestones = this.milestoneTracker;
    
      let savedPacerSpeed;
      const pauseBtn = getElement("pause-btn");
      pauseBtn.addEventListener("click", () => {
        simulationState.isPaused = !simulationState.isPaused;
        pauseBtn.textContent = simulationState.isPaused ? "Resume" : "Pause";
    
        if (simulationState.isPaused) {
          this.hud.pause();
          savedPacerSpeed = this.pacerPhysics.getSpeed();
          this.setPacerSpeed(0); // Stop pacer when paused
          // start countdown
          countdown.start(() => {
            // auto-resume when hits 0
            simulationState.isPaused = false;
            this.hud.resume();
            this.setPacerSpeed(savedPacerSpeed);
            pauseBtn.textContent = "Pause";
          });
        } else {
          // manual resume
          countdown.cancel();
          this.hud.resume();
          simulationState.isPaused = false;
          this.setPacerSpeed(savedPacerSpeed);
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
    
      const stopBtn = getElement("stop-btn");
      stopBtn.addEventListener("click", () => {
        // Show confirmation dialog
        showStopConfirmation(
          // On Confirm - end workout and show summary
          () => {
            // End the session and get final stats
            const finalStats = this.workoutSession.end();
    
            // After you compute finalStats from workoutSession / history, etc.
            if (selectedWorkout === "ramp" && this.rampController) {
              const result = this.rampController.computeFtpFromHistory(
                rideHistory.samples
              );
              if (result) {
                // Flatten FTP numbers into stats for summary + records
                finalStats.ftp = Math.round(result.ftp);
                finalStats.peakMinutePower = Math.round(result.peakMinute);
    
                this.hud.showWorkoutMessage({
                  text: `Ramp Test FTP ≈ ${finalStats.ftp} W`,
                  seconds: 8,
                });
              }
            }
    
            // Save workout and check for records
            const { newRecords, streak } = this.workoutStorage.saveWorkout(finalStats);
    
            // Show the summary!
            workoutSummary.show(finalStats, newRecords, streak);
    
            // Reset everything
            simulationState.isPaused = false;
            countdown.cancel();
            constants.riderState.power = 0;
            this.physics.setSpeed(0);
            this.hud.resetWorkOut();
            pauseBtn.textContent = "Pause";
    
            // Reset pacer
            this.setPacerSpeed(0);
            const startPos = { x: 0.5, y: 1, z: -2 };
            this.pacer.avatarEntity.setAttribute("position", startPos);
            constants.pacerStarted = false;
    
            // Start a new session for next workout
            this.workoutSession.start();
            this.milestoneTracker.reset();
          },
          // On Cancel
          () => {
            console.log("❌ Stop cancelled - continuing workout");
          }
        );
      });
    
      document.addEventListener("keydown", (e) => {
        if (!this.keyboardMode.keyboardMode) return;
        this.keyboardMode.keyboardInputActive(e.key);
      });
      document.addEventListener("keyup", (e) => {
        if (!this.keyboardMode.keyboardMode) return;
        this.keyboardMode.stopKeyboardMode(e.key.toLowerCase());
      });
      const connectBtn = getElement("connect-btn");
      connectBtn.addEventListener("click", async () => {
        await this.standardMode.connectTrainer();
        const ok = await this.standardMode.trainer.connect();
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
              window.initCalibration({ trainer: this.standardMode.trainer });
            }
          }
        });
      }
      this.standardMode.init();
      this.loopRunning=true;
      this.loop();
    
      const pacerSyncBtn = getElement("pacer-sync-btn");
      pacerSyncBtn.addEventListener("click", () => {
        //Set pacer's z to rider's z
        if (this.scene && this.rider && this.pacer) {
          const riderSyncPos = this.rider.avatarEntity.getAttribute("position");
          const pacerSyncPos = this.pacer.avatarEntity.getAttribute("position");
          pacerSyncPos.z = riderSyncPos.z;
    
          // Set pacer constants to rider constants and adjust animation
          constants.pacerCurrentTrackPiece = constants.currentTrackPiece;
          document.getElementById('pacer-speed').value = this.pacerPhysics.getSpeed();
          this.pacer.avatarEntity.removeAttribute("animation__1");
          this.pacer.avatarEntity.setAttribute("animation__1", `property: position; to: ${constants.trackPoints[constants.currentTrackPiece].x + 0.5} ${constants.trackPoints[constants.currentTrackPiece].y} ${constants.trackPoints[constants.currentTrackPiece].z}; dur: ${this.rider.avatarEntity.getAttribute("animation__1").dur}; easing: linear; loop: false; autoplay:true;`);
          this.pacer.avatarEntity.setAttribute("position", pacerSyncPos);
        }
        if (this.connected) {
          conn.send({name: "syncPlayers", data: {}});
        }
      });
    
      if (this.peerState!=0) {
        pacerSyncBtn.innerHTML = "Sync Players";
      }
    
      // Calorie reset button
      const caloriesResetBtn = getElement("calories-reset-btn");
      caloriesResetBtn.addEventListener("click", () => {
        constants.riderState.calories = 0;
      });
    
      // For testing: export some internals
      return {
        getScene: ()=>this.scene,
        getHud: ()=>this.hud,
        strava,
        getPacer: ()=>this.pacer,
        getRiderState: () => riderState,
        getRideHistory: () => rideHistory.samples,
        setRiderState: (state) => {
          riderState = state;
        },
        setKeyboardMode: (mode) => {
          this.keyboardMode = mode;
        },
        getKeyboardMode: () => this.keyboardMode,
        setPacerStarted: (val) => {
          pacerStarted = val;
        },
        getPacerStarted: () => pacerStarted,
        setLastTime: (val) => {
          lastTime = val;
        },
        getLastTime: () => lastTime,
        setLastHistorySecond: (val) => {
          rideHistory.lastSecond = val; },
        getLastHistorySecond: () => rideHistory.lastSecond,
      };
    }
}