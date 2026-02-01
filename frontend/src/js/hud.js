// hud.js
import { constants } from "./constants.js"
import { units } from "./units/index.js";

export class HUD {
  constructor({ getElement = (id) => document.getElementById(id) } = {}) {
    this.power = getElement("power");
    this.speed = getElement("speed");
    this.distance = getElement("distance");
    this.time = getElement("time");
    this.startTime = null;
    this.totalDistance = 0;
    this.calories = getElement("calories");

    // Added for pausing
    this.pausedAtMs = null;

    // NEW: workout overlay for countdowns / messages
    this.workoutOverlay = document.getElementById("workout-overlay");
    this.workoutDialog = this.workoutOverlay
      ? this.workoutOverlay.querySelector(".workout-dialog")
      : null;
    this.workoutCountdownId = null;
  }

  // Toggle trainer menu visibility
initTrainerToggle() {
  const trainerToggleBtn = document.getElementById("trainer-toggle-btn");
  const trainerBackBtn = document.getElementById("trainer-back-btn");
  const mainControls = document.querySelector(".main-controls");
  const trainerControls = document.querySelector(".trainer-controls");
  
  if (trainerToggleBtn && trainerBackBtn && mainControls && trainerControls) {
    // Show trainer view
    trainerToggleBtn.addEventListener("click", () => {
      mainControls.hidden = true;
      trainerControls.hidden = false;
    });
    
    // Back to main view
    trainerBackBtn.addEventListener("click", () => {
      trainerControls.hidden = true;
      mainControls.hidden = false;
    });
  }
}

  // 5-second pre-start countdown
  showStartCountdown({ workoutName, seconds = 5, onDone } = {}) {
      if (!this.workoutOverlay || !this.workoutDialog) {
        if (onDone) onDone();
        return;
      }

      if (this.workoutCountdownId != null) {
        clearInterval(this.workoutCountdownId);
        this.workoutCountdownId = null;
      }

      // dim the screen for the start countdown
      this.workoutOverlay.classList.add("dim");
      this.workoutOverlay.classList.remove("clear");

      let remaining = seconds;
      const tick = () => {
        this.workoutDialog.textContent =
          `${workoutName} starts in ${remaining}`;
      };

      this.workoutOverlay.style.display = "flex";
      tick();

      this.workoutCountdownId = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearInterval(this.workoutCountdownId);
          this.workoutCountdownId = null;
          this.workoutOverlay.style.display = "none";
          if (onDone) onDone();
          return;
        }
        tick();
      }, 1000);
    }

  skipWarmupCountdownEarly() {
    if (!this.workoutOverlay) return;

    // stop countdown timer
    if (this.workoutCountdownId != null) {
      clearInterval(this.workoutCountdownId);
      this.workoutCountdownId = null;
    }

    // prevent the warmup from finishing normally
    this.warmupOnDone = null;

    // hide overlay
    this.workoutOverlay.style.display = "none";
    this.workoutOverlay.classList.remove("dim", "clear");
  }


    // 5-minute warmup countdown – ONLY visual
    showWarmupCountdown({ seconds = 300, onDone } = {}) {
      if (!this.workoutOverlay || !this.workoutDialog) {
        if (onDone) onDone();
        return;
      }

      // show text WITHOUT dimming
      this.workoutOverlay.classList.add("clear");
      this.workoutOverlay.classList.remove("dim");

      if (this.workoutCountdownId != null) {
        clearInterval(this.workoutCountdownId);
        this.workoutCountdownId = null;
      }

      let remaining = seconds;
      const tick = () => {
        const min = Math.floor(remaining / 60);
        const sec = remaining % 60;
        this.workoutDialog.innerHTML = `
          Warmup: ${min}:${sec.toString().padStart(2, "0")}
          <div style="font-size: 0.6em; opacity: 0.8; margin-top: 8px;">
            Hold >120W for 30s to skip warmup
          </div>
        `;
      };

      this.workoutOverlay.style.display = "flex";
      tick();

      this.workoutCountdownId = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearInterval(this.workoutCountdownId);
          this.workoutCountdownId = null;
          this.workoutOverlay.style.display = "none";
          if (onDone) onDone();
          return;
        }
        tick();
      }, 1000);
    }
  


  pause() {
    if (this.pausedAtMs === null) {
      this.pausedAtMs = Date.now();
    }
  }

  resume() {
    if (this.pausedAtMs !== null) {
      const timeDiff = Date.now() - this.pausedAtMs;
      this.pausedAtMs = null;
      this.startTime += timeDiff; // Adjust start time to exclude paused duration
    }
  }

  resetWorkOut() {
    this.startTime = Date.now();
    this.totalDistance = 0;
    this.totalPausedMs = 0;
    this.pausedAtMs = null;

    // Reset HUD
    if (this.power) this.power.textContent = "0";
    if (this.speed) this.speed.textContent = "0.0";
    if (this.distance) this.distance.textContent = "0.00";
    if (this.time) this.time.textContent = "00:00";
    if (this.calories) this.calories.textContent = "0";
  }

    /**
   * Show a temporary workout message in the center overlay.
   * Reuses the same area as the countdown.
   */
  showWorkoutMessage({ text, seconds = 4 } = {}) {
    if (!this.workoutOverlay || !this.workoutDialog) return;

    // clear any previous hide timer
    if (this.workoutMessageTimeoutId) {
      clearTimeout(this.workoutMessageTimeoutId);
      this.workoutMessageTimeoutId = null;
    }

    this.workoutDialog.textContent = text;
    this.workoutOverlay.style.display = "flex";

    this.workoutMessageTimeoutId = window.setTimeout(() => {
      this.workoutOverlay.style.display = "none";
      this.workoutMessageTimeoutId = null;
    }, seconds * 1000);
  }

  update({ power, speed, calories, targetWatts }, dt) {
    // ----- color-code power vs ramp target -----
    if (this.power) {
      // clear any previous state
      this.power.classList.remove("power-above-target", "power-below-target");

      const hasTarget =
        typeof targetWatts === "number" && Number.isFinite(targetWatts) && targetWatts > 0;
      const hasPower =
        typeof power === "number" && Number.isFinite(power);

      if (hasTarget && hasPower) {
        // compare in raw watts (both are in W)
        if (power >= targetWatts) {
          this.power.classList.add("power-above-target");
        } else {
          this.power.classList.add("power-below-target");
        }
      }
      // if no target, we leave it with no extra class → default white color
    }

    // ----- existing numeric updates -----
    const fields = [
      {
        el: this.power,
        val: power,
        format: (v) => {
          v = units.powerUnit.convertTo(v);
          return v.toFixed(0);
        },
      },
      {
        el: this.speed,
        val: speed,
        format: (v) => {
          v = units.speedUnit.convertTo(v);
          return v?.toFixed(1);
        },
      },
      { el: this.calories, val: calories, format: (v) => v?.toFixed(0) },
    ];

    fields.forEach(({ el, val, format }) => {
      if (val !== undefined) el.textContent = format(val);
    });

    if (speed !== undefined) {
      this.totalDistance += (speed * dt) / 3600; // km
      this.distance.textContent = units.distanceUnit
        .convertTo(this.totalDistance)
        .toFixed(2);
    }

    if (!this.startTime) this.startTime = Date.now();
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const min = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const sec = String(elapsed % 60).padStart(2, "0");
    this.time.textContent = `${min}:${sec}`;
  }


  setPacerDiff(diff) {
    // No longer used: pacerDiff HUD element removed
  }
}
