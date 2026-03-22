export class PacerController {
  constructor() {
    this.mode = "manual";   // later: manual, sync, targetWatts
    this.currentSpeed = 0;
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
}