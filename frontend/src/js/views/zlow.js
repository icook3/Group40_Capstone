import { TrainerBluetooth } from "../bluetooth.js";
import { ZlowScene } from "../scene/index.js";
import { HUD } from "../hud.js";
import { Strava } from "../strava.js";
import {constants, features} from "../constants.js";
import { AvatarMovement } from "../avatarMovement.js";
import { KeyboardMode } from "../keyboardMode.js";
import { StandardMode } from "../standardMode.js";
import { simulationState } from "../simulationstate.js";
import { PauseCountdown } from "../pause_countdown.js";
import { units } from "../units/index.js";
import { RampTestController } from "../workouts/RampTestController.js";
import { SprintIntervalController } from "../workouts/SprintIntervalController.js";
import { rideHistory } from "../rideHistoryStore.js";
import { WorkoutStorage } from "../workoutStorage.js";
import { WorkoutSession } from "../workoutSession.js";
import { WorkoutSummary, showStopConfirmation } from "../workoutSummary.js";
import { MilestoneTracker } from "../milestones.js";
import { NotificationManager } from "../notifications.js";
import {initCrashReporter} from "../crashReporter.js";
import { PhysicsEngine } from "../PhysicsEngine.js";
import { exportToStrava, saveTCX } from "../main.js";
import { update_pacer_animation } from "../scene/env/Track.js";
import { TrainerCalibration } from "../trainerCalibration.js";
import { initCalibration } from "../trainerCalibration.js";
import { achievementManager } from "../achievements/achievementManager.js";

export class zlowScreen {
    content;
    ready=false;

    //other variables used in the main zlow app
    /**
     * @type {WorkoutStorage}
     */
    workoutStorage;
    /**
     * @type {WorkoutSession}
     */
    workoutSession;
    /**
     * @type {NotificationManager}
     */
    notificationManager;
    /**
     * @type {MilestoneTracker}
     */
    milestoneTracker;
    /**
     * @type {AvatarMovement}
     */
    rider;
    /**
     * @type {AvatarMovement}
     */
    pacer;
    /**
     * @type {PhysicsEngine}
     */
    physics;
    /**
     * @type {PhysicsEngine}
     */
    pacerPhysics;
    /**
     * @type {KeyboardMode}
     */
    keyboardMode;
    /**
     * @type {StandardMode}
     */
    standardMode;
    /**
     * @type {ZlowScene}
     */
    scene;
    /**
     * @type {HUD}
     */
    hud;
    /**
     * Can actually be any type of workout controller
     * They all have the same methods
     * @type {RampTestController}
     */
    workoutController;
    /**
     * @type {string}
     */
    selectedWorkout;
    /**
     * @type {string}
     */
    workoutName;
    
    isRecording = false;
    rideElapsedMs=0;
    /**
     * @type {WorkoutSummary}
     */
    workoutSummary;
    /**
     * @type {PauseCountdown}
     */
    countdown;
    //0: not in peer-peer mode
    //1: host
    //2: peer
    peerState=0;
    connected = false;
    /**
     * @type {Peer}
     */
    peer;
    /**
     * @type {Connection}
     */
    conn;

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
        //the first time you do a Zlow ride, unlock the welcome achievement
        achievementManager.obtainAchievement("Welcome");
        this.initZlowApp();
        window.testNotifications = new NotificationManager();
    }

    reset() {
        this.loopRunning=false;
        constants.riderTween?.stop?.();
        constants.pacerTween?.stop?.();
        constants.riderState={power: 0,speed: 0,calories: 0, distanceMeters: 0};
        constants.pacerStarted = false;
        constants.pacerState={speed: 0, targetWatts: null};
        constants.farthestSpawn=1;
        constants.currentTrackPiece=0;
        constants.pacerCurrentTrackPiece=0;
        constants.trackPoints=[];
        constants.lastTime=Date.now();
        constants.worldZ=0;

        constants.lastCloud = Date.now();
        constants.cloudSpeed = 0;
        constants.updateEvery=0;
        
        constants.riderTween = null;
        constants.pacerTween = null;
        constants.riderStart = 0;
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
    
    setPacerTargetWatts(watts) {
      constants.pacerState.targetWatts = watts;
    }


    //used for frequent updates in update method
    sendPeerDataOver(speed) {
      //console.log("sending data: "+this.connected);
      if (this.connected&&this.conn.open) {
        this.conn.send({name:"speed",data:speed})
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
              scene: this.scene.scene
          });
          this.pacer.creator.loadOtherData(data.data);
          this.pacerPhysics = new PhysicsEngine();
          if (this.peerState==1) {
            this.conn.send({name:"playerData", data:localStorage.getItem('playerData')});
          }
          //Unlock the peer-to-peer achievement
          achievementManager.obtainAchievement("PeerToPeer");
          break;
        case "speed":
          //console.log("Set pacer speed to "+data.data);
          if (this.pacer==null) {
            return;
          }
          this.activatePacer();
          this.pacer.setSpeed(Number(data.data));
          this.pacerPhysics.setSpeed(Number(data.data));
          //console.log(this.pacer.speed);
          break;
        case "syncPlayers":
          if (this.scene && this.rider && this.pacer) {
      
            // Set pacer constants to rider constants and adjust animation
            constants.pacerCurrentTrackPiece = constants.currentTrackPiece;
            document.getElementById('pacer-speed').value = constants.riderState.speed;
            update_pacer_animation(this.scene.scene, true)
          }
          break;
      }
    }

    createCrashReporter() {
        // Initialize crash reporter to collect game related data
        initCrashReporter(async () => {
            const rideSamples = rideHistory.samples || [];
            const lastSample = rideSamples.at(-1);
            const elapsedMs = lastSample ? lastSample.elapsedMs : 0;
            const workoutSeconds = Math.floor(elapsedMs / 1000);
    
            let riderPos = null;
            let pacerPos = null;
    
            try {
                const rider = this.scene?.scene?.getObjectByName("rider");
                const pacer = this.scene?.scene?.getObjectByName("pacer-entity");

                if (rider) riderPos = { x: rider.position.x, y: rider.position.y, z: rider.position.z };
                if (pacer) pacerPos = { x: pacer.position.x, y: pacer.position.y, z: pacer.position.z };
            } catch {}
    
            let rendererStats = null;
    
            try {
                const renderer = this.scene?.renderer;
                const info = renderer?.info;

                if (info) {
                    rendererStats = {
                        geometries: info.memory?.geometries,
                        textures: info.memory?.textures,
                        programs: info.programs?.length,
                        drawCalls: info.render?.calls,
                        triangles: info.render?.triangles,
                        sceneObjects: this.scene?.scene?.children?.length,
                    };
                }
            } catch (e) {
                rendererStats = { error: "failed to read renderer stats" };
            }

            let tempPeerState = this.peerState;

            return {
                workout: sessionStorage.getItem("SelectedWorkout") || "free",
                samples: rideHistory.samples?.length,
                workoutSeconds: workoutSeconds,
    
                speed: lastSample?.speed ?? 0,
                power: lastSample?.power ?? 0,
                riderPosition: riderPos,
                pacerPosition: pacerPos,
    
                renderer: rendererStats,
    
                testMode: localStorage.getItem("testMode"),
                trainerConnected: !!this.standardMode?.trainer?.isConnected,
    
                tempPeerState,
                peerConnected: this.connected,
                peerOpen: this.conn?.open,
                peerId: this.peer?.id,
            };
        });
    }

    initPeerToPeer() {
      // if you are the peer
      if (sessionStorage.getItem('SelectedWorkout')=="peerServer") {
        this.peerState = 2;
        console.log("connecting to peer");
        this.peer = new Peer({host: constants.peerHost, port: constants.peerPort, path: constants.peerPath});
        this.peer.on('open', id => {
            this.conn = this.peer.connect(sessionStorage.getItem("peer"));
            console.log("ID="+id);
    
            setTimeout(() => {
                if (!this.connected) {
                    alert("Connection timed out. Host offline, \nhost lobby is full \nor lobby does not exist");
                    try { this.conn.close(); } catch {}
                    this.peerState = 0;
                    viewManager.setView(viewManager.views.mainMenu)
                }
            }, 1500);
    
            //console.log("Peer: "+peer);
            this.conn.on('open', () => {
              console.log("connected!");
              console.log(this.conn);
              this.connected = true;
              // initially send over JSON of character design
              // when you recieve data
              this.conn.on("data", data => {
                  if (data.name === "error") {
                      this.connected = false;
                      alert(data.data);
                      this.conn.close();
                      this.peerState = 0;
                      return;
                  }
    
                  this.recieveData(data);
              });
              this.conn.send({name:"playerData", data:localStorage.getItem('playerData')});
            });
            this.conn.on('error', function(err) {
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
        this.peer.on('error', function(err) {
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
        this.peer = new Peer(localStorage.getItem("Name"), {host: constants.peerHost, port: constants.peerPort, path: constants.peerPath});
        this.peer.on('open', function(id) {
            console.log("ID="+id);        
        });
        this.peer.on("connection", connection => {
            if (this.connected) {
                // reject second player
                connection.send({
                    name: "error",
                    data: "This lobby is full."
                });
                connection.close()
                return
            }
    
            this.conn = connection;
            this.connected = true;
    
            console.log("Peer JOINED lobby:", connection.peer);
    
            // Immediately listen for messages
            this.conn.on("data", data => this.recieveData(data));
    
            // Send host's player data back
            this.conn.send({
                name: "playerData",
                data: localStorage.getItem("playerData")
            });
    
            this.conn.on("error", err => {
                console.error("Connection error:", err);
            });
        });
        this.peer.on('error', function(err) {
    
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
    }

    initializeScene() {
        this.scene = new ZlowScene();
    }

    initializePacerSpeedInput() {
      if (localStorage.getItem("testMode") == "true") {
        const pacerSpeedInput = document.getElementById("pacer-speed");
        pacerSpeedInput.addEventListener("input", () => {
          const val = Number(pacerSpeedInput.value);
          this.setPacerSpeed(val);
        });

        this.setPacerSpeed(Number(pacerSpeedInput.value));
        pacerSpeedInput.addEventListener("input", () => {
          const val = Number(pacerSpeedInput.value);
          this.setPacerSpeed(val);
        });
      } else {
        if (localStorage.getItem("pacer-speed") !== null) {
          const val = Number(localStorage.getItem("pacer-speed"));
          this.scene = new ZlowScene(val);
          this.setPacerSpeed(val);
        } else {
          const val = 20;
          this.setPacerSpeed(val);
        }
      }
    }

    initializeWorkouts() {
      // Set up ramp test controller if applicable
      if (this.selectedWorkout === "ramp") {
        const now = Date.now();
        let tempHud=this.hud;
        this.workoutController = new RampTestController({
          hud: tempHud,
          nowMs: now,
          warmupSeconds: 5 * 60, // 5-minute warmup
          startWatts: 100,
          stepWatts: 20,
          stepSeconds: 60,
          ftpFactor: 0.75,
        });
      } else if (this.selectedWorkout==="sprint") {
        const now = Date.now();
        let tempHud=this.hud;
        this.workoutController = new SprintIntervalController({
          hud: tempHud,
          nowMs: now,
          warmupSeconds: 10 * 60,
          secondOn: 2*60,
          useWatts: 1.05*this.workoutStorage?.data?.personalRecords?.highestFtp?.value||120,
          secondsOff: 2*60,
          wattsOff: 0.95*this.workoutStorage?.data?.personalRecords?.highestFtp?.value||10
        });
      } else {
        this.workoutController = null;
      }
    }
    initializeHudCountdown() {
      this.hud.showStartCountdown({
        workoutName: this.workoutName,
        seconds: 5,
        onDone: () => {
          // After 5s, unpause the sim
          simulationState.isPaused = false;
          this.isRecording = true;
          this.rideElapsedMs = 0;
          if (this.workoutController!=null) {
          this.hud.showWarmupCountdown({
              //use the seconds in the workout controller
              seconds:this.workoutController.warmupSeconds,
              onDone: () => {
                this.workoutController?.startWorkout();
              }
            });
          }
        },
      });
    }

    initPauseBtn() {
      const pauseBtn = document.getElementById("pause-btn");
      const resumeBtn = document.getElementById("pause-resume-btn");
      const overlay = document.getElementById("pause-overlay");
      const dialog = overlay.querySelector(".pause-dialog");

      const pauseGame = () => {
        simulationState.isPaused = true;
        this.hud.pause();
        constants.pacerTween.pause();
        constants.riderTween.pause();
        overlay.style.display = "flex";
        overlay.setAttribute("aria-hidden", "false");
        dialog.classList.remove("zoom-out");
        dialog.classList.add("zoom-in");
      };

      const resumeGame = () => {
        dialog.classList.remove("zoom-in");
        dialog.classList.add("zoom-out");

        // This block helps with pause overlay animation finishing before hiding away
        dialog.addEventListener("animationend", function handler() {
          dialog.removeEventListener("animationend", handler);
          overlay.style.display = "none";
          overlay.setAttribute("aria-hidden", "true");
          dialog.classList.remove("zoom-out");
        });

        simulationState.isPaused = false;
        constants.lastTime = Date.now();
        this.hud.resume();
        constants.pacerTween.resume();
        constants.riderTween.resume();
      };

      pauseBtn.addEventListener("click", () => {
        if (!simulationState.isPaused) {
          pauseGame();
        }
      });

      resumeBtn.addEventListener("click", () => {
        resumeGame();
      });
    }
    setupStopButton() {
      const stopBtn = document.getElementById("stop-btn");
      stopBtn.addEventListener("click", () => {
        // Show confirmation dialog
        showStopConfirmation(
          // On Confirm - end workout and show summary
          () => {
            // End the session and get final stats
            const finalStats = this.workoutSession.end();
            this.isRecording = false;
            if (this.selectedWorkout==="ramp") {
              const result = this.workoutController.computeFtpFromHistory(rideHistory.samples);
              // After you compute finalStats from workoutSession / history, etc.
              if (result) {
                  // Flatten FTP numbers into stats for summary + records
                  finalStats.ftp = Math.round(result.ftp);
                  finalStats.peakMinutePower = Math.round(result.peakMinute);
    
                  this.hud.showWorkoutMessage({
                    text: `${this.selectedWorkout} Test FTP ≈ ${finalStats.ftp} W`,
                    seconds: 8,
                  });
              }
            }
            
    
            // Save workout and check for records
            const { newRecords, streak } = this.workoutStorage.saveWorkout(finalStats);
    
            // Show the summary!
            this.workoutSummary.show(finalStats, newRecords, streak);
    
            // Reset everything
            simulationState.isPaused = false;
            this.countdown.cancel();
            constants.riderState.power = 0;
            constants.riderState.distanceMeters = 0;
            this.rideElapsedMs = 0;
            this.physics.setSpeed(0);
            this.hud.resetWorkOut();
            const pauseBtn = document.getElementById("pause-btn");
                
            // Reset pacer
            this.setPacerSpeed(0);
            this.pacer.avatarEntity.position.set(0.5, 1, -2);
            constants.pacerStarted = false;
    
            // Start a new session for next workout
            this.workoutSession.start();
            this.milestoneTracker.reset();
          },
          // On Cancel
          () => {
            console.log("❌ Stop cancelled - continuing workout");
            this.isRecording = true;
          }
        );
      });
    }

    setupTrainerButtons() {
      const connectBtn = document.getElementById("connect-btn");
      connectBtn.addEventListener("click", async () => {
        await this.standardMode.connectTrainer();
        const ok = await this.standardMode.trainer.connect();
        if (ok) connectBtn.disabled = true;
      });
      // Calibration modal button
      const calibrateModalBtn = document.getElementById("calibrate-trainer-modal-btn");
      if (calibrateModalBtn) {
        calibrateModalBtn.addEventListener("click", () => {
          const modal = document.getElementById("calibration-modal");
          if (modal) {
            modal.classList.add("show");
            modal.setAttribute("aria-hidden", "false");
            initCalibration({ trainer: this.standardMode.trainer });
          }
        });
      }
    }
    
    setupPacerSyncButton() {
      const pacerSyncBtn = document.getElementById("pacer-sync-btn");
      pacerSyncBtn.addEventListener("click", () => {
        //Set pacer's z to rider's z
        if (this.scene && this.rider && this.pacer) {
    
          // Set pacer constants to rider constants and adjust animation
          const riderSpeed = constants.riderState.speed || 0;

          constants.pacerCurrentTrackPiece = constants.currentTrackPiece;
          constants.pacerState.speed = riderSpeed;
          this.setPacerSpeed(riderSpeed);

          const pacerSpeedInput = document.getElementById("pacer-speed");
          if (pacerSpeedInput) {
            pacerSpeedInput.value = riderSpeed;
          }

          update_pacer_animation(this.scene.scene, true);
        }
        if (this.connected) {
          this.conn.send({name: "syncPlayers", data: {}});
        }
      });
      if (this.peerState!=0) {
        pacerSyncBtn.innerHTML = "Sync Players";
      }
    }

    setRiderWeight() {
      if (localStorage.getItem("rider-weight")!=null) {
        let weightNum = Number(localStorage.getItem("rider-weight"));
        //ensure that it is a number
        if (!isNaN(weightNum)) {
          constants.riderMass = units.weightUnit.convertFrom(weightNum);
        }
      }
    }
    checkIfAchievementsUnlocked() {
        if(this.hud.totalDistance>=25) {
          achievementManager.obtainAchievement("DistanceMilestone1");
        }
        if(this.hud.totalDistance>=50) {
          achievementManager.obtainAchievement("DistanceMilestone2");
        }
        if(this.hud.totalDistance>=100) {
          achievementManager.obtainAchievement("DistanceMilestone2");
        }
        if (constants.riderState.power>=75) {
          achievementManager.obtainAchievement("PowerMilestone1");
        }
        if (constants.riderState.power>=150) {
          achievementManager.obtainAchievement("PowerMilestone2");
        }
        if (constants.riderState.power>=300) {
          achievementManager.obtainAchievement("PowerMilestone3");
        }
        if (constants.riderState.calories>=400) {
          achievementManager.obtainAchievement("CaloriesMilestone1");
        }
        if (constants.riderState.calories>=800) {
          achievementManager.obtainAchievement("CaloriesMilestone2");
        }
        if (constants.riderState.calories>=1500) {
          achievementManager.obtainAchievement("CaloriesMilestone3");
        }
        if (this.workoutStorage.getCurrentStreak()>=7) {
          achievementManager.obtainAchievement("StreakMilestone1");
        }
        if (this.workoutStorage.getCurrentStreak()>=14) {
          achievementManager.obtainAchievement("StreakMilestone2");
        }
        if (this.workoutStorage.getCurrentStreak()>=30) {
          achievementManager.obtainAchievement("StreakMilestone3");
        }
        //time
        const elapsed = Math.floor((Date.now() - this.hud.startTime) / 1000);
        if (elapsed>=30*60) {
          achievementManager.obtainAchievement("TimeMilestone1");
        }
        if (elapsed>=1*60*60) {
          achievementManager.obtainAchievement("TimeMilestone2");
        }
        if (elapsed>=2*60*60) {
          achievementManager.obtainAchievement("TimeMilestone3");
        }
    }
    
    /**
     * MAIN ZLOW FLOW
     * 
     * separated from the rest of this for improved readability
     * 
     * 
     */

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
      if (owner.isRecording) {
          owner.rideElapsedMs+=dt*1000;
      }
      const currentPower = constants.riderState.power || 0;
      constants.riderState.speed = owner.physics.update(currentPower, dt);

      const speedMs = constants.kmhToMs(constants.riderState.speed);
      constants.riderState.distanceMeters += speedMs * dt;
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
        if (owner.workoutController&&this.selectedWorkout==="ramp") {
          owner.workoutSession.addFTPResult(owner.workoutController.ftpResult);
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
        if (owner.workoutController) {
          const targetWatts = owner.workoutController.getCurrentTargetWatts();
          owner.setPacerTargetWatts(targetWatts);
          
          if (targetWatts == null) {
            // Warmup or finished:
            // Pacer exactly matches the rider so it stays beside you.
            pacerSpeed = constants.riderState.speed;
            owner.pacerPhysics.setSpeed(pacerSpeed);
            constants.pacerState.speed = pacerSpeed;
          } else {
            // Active workout:
            // Pacer behaves like an ideal rider holding target watts,
            // using the same physics as the real rider for smooth changes.
            pacerSpeed = owner.pacerPhysics.update(targetWatts, dt);
          }
        } else {
          owner.setPacerTargetWatts(null);
        }
        // If workoutController is null (free ride, peer-to-peer),
        // pacerSpeed stays whatever was set elsewhere (test mode slider, etc.).
    
        // Apply the computed speed to the pacer avatar

        constants.pacerState.speed = pacerSpeed;

        owner.pacer.setSpeed(pacerSpeed);
        owner.pacerPhysics.setSpeed(pacerSpeed);
        owner.pacer.update(dt);
      }
    
      // Let the ramp controller advance its state
      if (owner.workoutController) {
        const power = constants.riderState.power || 0;
        owner.workoutController.update(now, power);
    
        const target = owner.workoutController.getCurrentTargetWatts();
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
    
      // Add new sample to rideHistory if time is recording and simulation isn't paused
      if (owner.isRecording && !simulationState.isPaused) {
        rideHistory.pushSample(
          owner.rideElapsedMs,
          constants.riderState.power || 0,           // watts
          constants.riderState.speed || 0,           // m/s
          constants.riderState.distanceMeters || 0 // meters
        );
      }
      owner.checkIfAchievementsUnlocked();
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
      this.reset();

      window.__zlow = window.__zlow || {};
      window.__zlow.constants = constants;
      this.peerState=0;
      this.loopRunning=false;
      this.connected=false;
      /*AFRAME.registerComponent("no-cull", {
        init() {
          this.el.addEventListener("model-loaded", () => {
            this.el.object3D.traverse((obj) => (obj.frustumCulled = false));
          });
        },
      });*/
      
      window.__zlowInitCount = (window.__zlowInitCount || 0) + 1;
      console.log("initZlowApp count:", window.__zlowInitCount);
      
      if (features.crashReporterEnabled) {
          this.createCrashReporter();
      }
      // initialize peer-to-peer connection
      this.initPeerToPeer();
      this.selectedWorkout = sessionStorage.getItem("SelectedWorkout") || "free";
      console.log("Selected workout:", this.selectedWorkout);
    
      // set up units properly
      units.setUnits();
      this.setUnits(units.speedUnit.name, "speed-unit");
      this.setUnits(units.weightUnit.name, "weight-unit");
      //this.setUnits(units.powerUnit.name,"power-unit");
      this.setUnits(units.distanceUnit.name, "distance-unit");
    
      // start tracking current workout stats
      this.workoutStorage = new WorkoutStorage();
      this.workoutSession = new WorkoutSession();
    
      // start notification manager and milestone tracker
      this.notificationManager = new NotificationManager();
      this.milestoneTracker = new MilestoneTracker(this.workoutSession, this.workoutStorage);
      this.setRiderWeight();
      //let tempWorkoutStorage=this.workoutStorage;
      this.workoutSummary = new WorkoutSummary({
        workoutStorage: this.workoutStorage,
        onClose: () => {
          this.cleanup();
          viewManager.setView(viewManager.views.mainMenu);
        },
      });
      
      this.workoutSession.start();
      this.milestoneTracker.reset();
    
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
    
      this.countdown = new PauseCountdown({ getElement, limit: 10 });

      this.initializeScene();

      this.rider = new AvatarMovement("rider", {
        position: { x: -0.5, y: 1, z: 0 },
        isPacer: false,
        scene: this.scene.scene
      });
      this.physics = new PhysicsEngine();
    
      if (this.peerState == 0) {
        this.pacer = new AvatarMovement("pacer-entity", {
          position: { x: 0.5, y: 1, z: -2 },
          isPacer: true,
          scene: this.scene.scene
        });
        this.pacerPhysics = new PhysicsEngine();
        this.pacer.creator.setPacerColors();
      }
      this.keyboardMode = new KeyboardMode();
      this.standardMode = new StandardMode();
    
      // Show/hide dev hud based on testMode
      console.log("testMode value:", localStorage.getItem("testMode"));
      const devWrapper = getElement("dev-controls-wrapper");
      const devHud = getElement("dev-controls-hud");

      if (devWrapper) {
        if (localStorage.getItem("testMode") === "true") {
          devWrapper.removeAttribute("hidden");
        } else {
          devWrapper.setAttribute("hidden", "");
        }
      }

      const devToggleBtn = getElement("dev-toggle-btn");
      if (devToggleBtn && devHud) {
        devToggleBtn.addEventListener("click", () => {
          devHud.hidden = !devHud.hidden;
        });
      }
      this.hud = new HUD({ getElement });
      this.hud.initTrainerToggle();
      this.initializePacerSpeedInput();

      // Dismiss trainer and dev menus when clicking outsideof their pop up
      document.addEventListener("click", (e) => {
        // Trainer menu
        const trainerControls = document.querySelector(".trainer-controls");
        const trainerMenu = document.querySelector(".trainer-menu");
        if (trainerMenu && !trainerMenu.hidden && !trainerControls.contains(e.target)) {
          trainerMenu.hidden = true;
        }

        // Dev menu
        const devWrapper = document.getElementById("dev-controls-wrapper");
        const devHud = document.getElementById("dev-controls-hud");
        if (devHud && !devHud.hidden && devWrapper && !devWrapper.contains(e.target)) {
          devHud.hidden = true;
        }
      });
    
    
      // Map workout keys to user-facing labels
      const workoutLabels = {
        free: "Free Ride",
        ramp: "Ramp Test",
        sprint: "Sprint Intervals",
      };
    
      this.workoutName = workoutLabels[this.selectedWorkout] || "Free Ride";
      this.initializeWorkouts();
      this.initializeHudCountdown();
    
      const strava = new Strava();
    
      //for testing purposes
      window.testHud = this.hud;
      window.testStorage = this.workoutStorage;
      window.testMilestones = this.milestoneTracker;
    
      this.initPauseBtn();
    
      document.addEventListener("click", async (e) => {
        if (e.target && e.target.id === "summary-export-tcx") {
          saveTCX();
        }
    
        if (e.target && e.target.id === "summary-export-strava") {
          await exportToStrava();
        }
      });
      this.setupStopButton();
      
      document.addEventListener("keydown", (e) => {
        if (!this.keyboardMode.keyboardMode) return;
        this.keyboardMode.keyboardInputActive(e.key);
      });
      document.addEventListener("keyup", (e) => {
        if (!this.keyboardMode.keyboardMode) return;
        this.keyboardMode.stopKeyboardMode(e.key.toLowerCase());
      });
      this.setupTrainerButtons();
      this.standardMode.init();
      this.loopRunning=true;
      this.loop();
      this.setupPacerSyncButton();

      const menuBtn = getElement("menu-btn");
      menuBtn.addEventListener("click", () => {
        if (confirm("Return to Main Menu? Gameplay data will be lost.")) {
          this.cleanup();
          viewManager.setView(viewManager.views.mainMenu);
          }
        });


    
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

    cleanup() {
        // Stop the loop first
        this.loopRunning = false;

        // Destroy the scene (renderer, ground, track, clouds, scenery)
        this.scene?.destroy();
        this.scene = null;

        // Remove the Three.js canvas from the DOM
        const canvas = document.querySelector('canvas');
        if (canvas) canvas.remove();

        // Clear singleton guards so fresh instances are created
        window.__zlowSceneInstance = null;
        window.__zlowTrackInstance = null;

        // Null out references so nothing carries over
        this.rider = null;
        this.pacer = null;
        this.physics = null;
        this.pacerPhysics = null;
        this.hud = null;
        this.rampController = null;
        this.workoutSession = null;
        this.workoutStorage = null;
        this.milestoneTracker = null;
        this.notificationManager = null;
        this.keyboardMode = null;
        this.standardMode = null;
        this.countdown = null;
        this.workoutSummary = null;
    }
}