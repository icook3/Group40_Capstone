export class SprintIntervalController {
  constructor({
    hud,
    nowMs = Date.now(),
    warmupSeconds = 10 * 60,
    secondOn = 60*2,
    useWatts = 120,
    secondsOff = 60*2,
    ftpFactor = 0.75,
    wattsOff = 0
  } = {}) {
    this.hud = hud;

    this.phase = "warmup";      // "warmup" | "on" | "off" | "finished"
    this.secondOn = secondOn;
    this.useWatts = useWatts;
    this.secondsOff = secondsOff;
    this.ftpFactor = ftpFactor;

    this.earlyExitWatts = 120;
    this.earlyExitDurationSec = 30;
    this.aboveThresholdAccumSec = 0;
    this.lastUpdateMs = nowMs;
    this.wattsOff = wattsOff;

    // Kick off warmup countdown in the overlay
    if (this.hud && typeof this.hud.showWarmupCountdown === "function") {
      this.hud.showWarmupCountdown({
        seconds: this.warmupSeconds,
        onDone: () => {
          this._startSprintIntervals();
        },
      });
    } else {
      // Fallback: if HUD can’t do the countdown, just start ramp immediately
      this._startSprintIntervals();
    }
  }


  /**
   * Call this once per frame from the main loop.
   */
  update(nowMs, currentPowerWatts = 0) {
    const dtSec = (nowMs - this.lastUpdateMs) / 1000;
    this.lastUpdateMs = nowMs;

    // --- Warmup phase logic ---
    if (this.phase === "warmup") {
      if (currentPowerWatts > this.earlyExitWatts) {
        this.aboveThresholdAccumSec += dtSec;

        if (this.aboveThresholdAccumSec >= this.earlyExitDurationSec) {
          console.log("Warmup ended early due to power threshold");
          this._startSprintIntervals();
          return;
        }
      } else {
        this.aboveThresholdAccumSec = 0;
      }

      return; // <-- ensures no workout logic until warmup ends/forced
    }

    // --- Sprint on phase logic ---
    if (this.phase === "on" && this.lastStepChangeMs != null) {
      const sinceStepSec = (nowMs - this.lastStepChangeMs) / 1000;
      if (sinceStepSec >= this.secondOn) {
        
        this.phase="off";
        this.lastStepChangeMs = nowMs;
        const target = this.getCurrentTargetWatts();
        this._announceStep(target, false);
      }
    }
    // --- Sprint off phase logic 
    else if (this.phase==="off" && this.lastStepChangeMs!=null) {
      const sinceStepSec = (nowMs - this.lastStepChangeMs) / 1000;
      if (sinceStepSec >= this.secondsOff) {
        
        this.phase="on";
        this.lastStepChangeMs = nowMs;
        const target = this.getCurrentTargetWatts();
        this._announceStep(target, true);
      }        
    }
  }

  /**
   * Current ramp target watts, or null during warmup / finished.
   */
  getCurrentTargetWatts() {
    if (this.phase !== "on" && this.phase !=="off") return null;
    if (this.phase==="off") {
      return this.wattsOff;
    } else if (this.phase==="on") {
      return this.useWatts;
    }
    //return this.startWatts + this.currentStep * this.stepWatts;
  }

  /**
   * Mark the test as finished (e.g., user hit Stop when they blew up).
   * You can call this inside the stop-confirm handler if desired.
   */
  markFinished() {
    this.phase = "finished";
  }

  /**
   * Compute FTP from a rideHistory array:
   *   [{ time, power, speed, distance }, ...]
   * Returns { peakMinute, ftp } or null if not enough data.
   */
  computeFtpFromHistory(history) {
    const windowSize = 60; // 60 seconds
    if (!history || history.length < windowSize) {
      return null;
    }

    let sum = 0;
    for (let i = 0; i < windowSize; i++) {
      sum += history[i].power || 0;
    }
    let bestAvg = sum / windowSize;

    for (let i = windowSize; i < history.length; i++) {
      sum += (history[i].power || 0) - (history[i - windowSize].power || 0);
      const avg = sum / windowSize;
      if (avg > bestAvg) bestAvg = avg;
    }

    const ftp = this.ftpFactor * bestAvg;
    this.ftpResult = { peakMinute: bestAvg, ftp };
    return this.ftpResult;
  }

  startWorkout(nowMs = Date.now()) {
    this._startSprintIntervals(nowMs);
  }
  _startSprintIntervals(nowMs = Date.now()) {
    console.log("Sprint starting");

    // ensure warmup cannot restart
    this.phase = "on";
    this.aboveThresholdAccumSec = 0;

    // timestamp ramp init
    //this.rampStartTimeMs = nowMs;
    this.lastStepChangeMs = nowMs;
    //this.currentStep = 0;

    // make sure warmup countdown can never resume
    if (this.hud?.skipWarmupCountdownEarly) {
      this.hud.skipWarmupCountdownEarly();
    }

    // Show first ramp target
    const target = this.getCurrentTargetWatts();
    this._announceStep(target, this.phase==="on");
  }

  _announceStep(targetWatts, on) {
    if (!this.hud || typeof this.hud.showWorkoutMessage !== "function") return;
    let label;
    if (on) {
        label = `Sprint target ${targetWatts} W`;
    } else {
        label = `Sprint off: target ${targetWatts} W`;
    }
    this.hud.showWorkoutMessage({
      text: label,
      seconds: 8,
    });
  }
}