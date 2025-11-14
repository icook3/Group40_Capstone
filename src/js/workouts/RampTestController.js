// js/workouts/RampTestController.js

export class RampTestController {
  constructor({
    hud,
    nowMs = Date.now(),

    // protocol tuning knobs:
    warmupSeconds = 5 * 60,  // 5-minute warmup
    startWatts = 100,        // starting ramp power
    stepWatts = 20,          // +20 W per step
    stepSeconds = 60,        // 1 minute per step
    ftpFactor = 0.75,        // FTP ≈ 75% of peak 1-min power
  } = {}) {
    this.hud = hud;

    this.phase = "warmup";         // "warmup" | "ramp" | "finished"
    this.startTimeMs = nowMs;
    this.lastStepChangeMs = nowMs;
    this.currentStep = -1;         // -1 = no ramp yet

    this.warmupSeconds = warmupSeconds;
    this.startWatts = startWatts;
    this.stepWatts = stepWatts;
    this.stepSeconds = stepSeconds;
    this.ftpFactor = ftpFactor;

    // Optional: store calculated FTP result
    this.ftpResult = null;

    // Kick off warmup message
    if (this.hud && typeof this.hud.showWorkoutMessage === "function") {
      this.hud.showWorkoutMessage({
        text: `Warmup – ride easy for ${(warmupSeconds / 60).toFixed(0)}:00`,
        seconds: 5,
      });
    }
  }

  /**
   * Call this once per frame from the main loop.
   */
  update(nowMs) {
    if (this.phase === "finished") return;

    const elapsedSec = (nowMs - this.startTimeMs) / 1000;

    if (this.phase === "warmup") {
      if (elapsedSec >= this.warmupSeconds) {
        // Switch into ramp mode
        this.phase = "ramp";
        this.currentStep = 0;
        this.lastStepChangeMs = nowMs;

        const target = this.getCurrentTargetWatts();
        this._announceStep(1, target);
      }
      return;
    }

    if (this.phase === "ramp") {
      const sinceStepSec = (nowMs - this.lastStepChangeMs) / 1000;

      if (sinceStepSec >= this.stepSeconds) {
        this.currentStep += 1;
        this.lastStepChangeMs = nowMs;

        const stepNumber = this.currentStep + 1;
        const target = this.getCurrentTargetWatts();
        this._announceStep(stepNumber, target);
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
