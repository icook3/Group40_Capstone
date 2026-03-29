export class PacerController {
  constructor() {
    this.mode = "manual";
    this.currentSpeed = 0;
    this.currentWatts = 0;
    this.riderSpeed = 0;
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

  setRiderSpeed(speed) {
    const nextSpeed = Number(speed);
    this.riderSpeed = Number.isFinite(nextSpeed) ? nextSpeed : 0;
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

  update(dt) {
    if (!this.physics) {
      return this.currentSpeed;
    }

    let nextSpeed = this.physics.getSpeed();

    if (this.mode === "match-rider") {
      nextSpeed = this.riderSpeed;
      this.physics.setSpeed(nextSpeed);
    } else if (this.mode === "target-watts") {
      nextSpeed = this.physics.update(this.currentWatts, dt);
    }
    // manual mode intentionally leaves current speed alone

    this.currentSpeed = nextSpeed;

    if (this.avatar) {
      this.avatar.setSpeed(nextSpeed);
    }
    if (this.physics) {
      this.physics.setSpeed(nextSpeed);
    }

    return nextSpeed;
  }
}