// js/workouts/RampTestController.js

export class RampTestController {
  constructor({
    hud,
    nowMs = Date.now(),
    warmupSeconds = 5 * 60,
    startWatts = 100,
    stepWatts = 20,
    stepSeconds = 60,
    ftpFactor = 0.75,
    
  } = {}) {
    this.hud = hud;

    this.phase = "warmup";      // "warmup" | "ramp" | "finished"
    this.startWatts = startWatts;
    this.stepWatts = stepWatts;
    this.stepSeconds = stepSeconds;
    this.ftpFactor = ftpFactor;

    this.rampStartTimeMs = null;
    this.lastStepChangeMs = null;
    this.currentStep = -1;

    this.earlyExitWatts = 120;
    this.earlyExitDurationSec = 30;
    this.aboveThresholdAccumSec = 0;
    this.lastUpdateMs = nowMs;

    // Kick off warmup countdown in the overlay
    if (this.hud && typeof this.hud.showWarmupCountdown === "function") {
      this.hud.showWarmupCountdown({
        seconds: warmupSeconds,
        onDone: () => {
          this._startRamp();
        },
      });
    } else {
      // Fallback: if HUD can’t do the countdown, just start ramp immediately
      this._startRamp();
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
          this._startRamp();
          return;
        }
      } else {
        this.aboveThresholdAccumSec = 0;
      }

      return; // <-- ensures no ramp logic until warmup ends/forced
    }

    // --- Ramp phase logic ---
    if (this.phase === "ramp" && this.lastStepChangeMs != null) {
      const sinceStepSec = (nowMs - this.lastStepChangeMs) / 1000;
      if (sinceStepSec >= this.stepSeconds) {
        this.currentStep++;
        this.lastStepChangeMs = nowMs;
        const target = this.getCurrentTargetWatts();
        this._announceStep(this.currentStep + 1, target);
      }
    }
  }




  /**
   * Current ramp target watts, or null during warmup / finished.
   */
  getCurrentTargetWatts() {
    if (this.phase !== "ramp" || this.currentStep < 0) return null;
    return this.startWatts + this.currentStep * this.stepWatts;
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

  _startRamp(nowMs = Date.now()) {
    console.log("Ramp starting");

    // ensure warmup cannot restart
    this.phase = "ramp";
    this.aboveThresholdAccumSec = 0;

    // timestamp ramp init
    this.rampStartTimeMs = nowMs;
    this.lastStepChangeMs = nowMs;
    this.currentStep = 0;

    // make sure warmup countdown can never resume
    if (this.hud?.skipWarmupCountdownEarly) {
      this.hud.skipWarmupCountdownEarly();
    }

    // Show first ramp target
    const target = this.getCurrentTargetWatts();
    this._announceStep(1, target);
  }

  _announceStep(stepNumber, targetWatts) {
    if (!this.hud || typeof this.hud.showWorkoutMessage !== "function") return;

    const label = stepNumber === 1
      ? `Ramp start – target ${targetWatts} W`
      : `Ramp step ${stepNumber} – target ${targetWatts} W`;

    this.hud.showWorkoutMessage({
      text: label,
      seconds: 4,
    });
  }
}
