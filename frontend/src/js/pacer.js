export class PacerController {
  constructor() {
    this.mode = "manual";
    this.currentSpeed = 0;
    this.currentWatts = 0;
    this.avatar = null;
    this.physics = null;
  }

  attach({ avatar, physics }) {
    this.avatar = avatar;
    this.physics = physics;
  }

  setMode(mode) {
    this.mode = mode;
  }

  getMode() {
    return this.mode;
  }

  setSpeed(speed) {
    const nextSpeed = Number(speed);
    this.currentSpeed = Number.isFinite(nextSpeed) ? nextSpeed : 0;

    if (this.avatar) {
      this.avatar.setSpeed(this.currentSpeed);
    }
    if (this.physics) {
      this.physics.setSpeed(this.currentSpeed);
    }
  }

  getSpeed() {
    return this.currentSpeed;
  }

  setWatts(watts) {
    const nextWatts = Number(watts);
    this.currentWatts = Number.isFinite(nextWatts) ? nextWatts : 0;
  }

  getWatts() {
    return this.currentWatts;
  }
}