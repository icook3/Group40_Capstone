// hud.js: Handles the heads-up display overlay
export class HUD {
  constructor({ getElement = (id) => document.getElementById(id) } = {}) {
    this.power = getElement("power");
    this.speed = getElement("speed");
    this.distance = getElement("distance");
    this.time = getElement("time");
    this.startTime = null;
    this.totalDistance = 0;
    this.calories = getElement("calories");
  }

  update({ power, speed }, dt) {
    const fields = [
      { el: this.power, val: power, format: (v) => v },
      { el: this.speed, val: speed, format: (v) => v?.toFixed(1) },
      { el: this.calories, val: this.calories, format: (v) => v?.toFixed(0) },
    ];
    fields.forEach(({ el, val, format }) => {
      if (val !== undefined) el.textContent = format(val);
    });
    if (speed !== undefined) {
      this.totalDistance += (speed * dt) / 3600; // km
      this.distance.textContent = this.totalDistance.toFixed(2);
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
