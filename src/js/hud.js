// hud.js: Handles the heads-up display overlay
import { constants } from "./constants.js"
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

  update({ power, speed, calories }, dt) {
    const fields = [
      { el: this.power, val: power, format: (v) => v },
      {
          el: this.speed, val: speed, format: (v) => {
              switch (sessionStorage.getItem("SpeedUnit")) {
                  case "mph":
                      v = constants.kmhToMph(v);
                      break;
                  default:
                      break;
              }
              return v?.toFixed(1);
              //console.log("formatting speed: " + speed + ". v=" + v);
              
          }
      },
      { el: this.calories, val: calories, format: (v) => v?.toFixed(0) },
    ];
    fields.forEach(({ el, val, format }) => {
        if (val !== undefined) el.textContent = format(val);
    });
    if (speed !== undefined) {
      this.totalDistance += (speed * dt) / 3600; // km
      switch (sessionStorage.getItem("SpeedUnit")) {
          case "mph":
              this.distance.textContent = constants.kmToMi(this.totalDistance).toFixed(2);
              break;
          default:
              this.distance.textContent = this.totalDistance.toFixed(2);
      }
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
