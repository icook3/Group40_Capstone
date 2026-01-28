// RideHistory class to manage historical ride data samples
// Currently only stores up to 120 minutes of data at 1 sample per second 

export class RideHistory {
  constructor({ maxSamples = 120 * 60 } = {})
  {
    this.maxSamples = maxSamples;
    this.samples = [];
    this.lastSecond = null;

    this.startEpochMs = null;
    this.startNowMs = null;
  }

  get length() {
    return this.samples.length;
  }

  get first() {
    return this.samples[0];
  }

  get last() {
    return this.samples.at(-1);
  }

  get durationSeconds() {
    if (this.samples.length < 2) return 0;
    return (this.last.time - this.first.time) / 1000;
  }

  pushSample(nowMs, power, speed, distance) {
    // initialize anchors on first sample
    if (this.startEpochMs === null) {
      this.startEpochMs = Date.now();
      this.startNowMs = nowMs;
    }

    const elapsedMs = nowMs - this.startNowMs;      // works whether nowMs is performance.now() or your sim clock
    const thisSecond = Math.floor(elapsedMs / 1000);

    if (this.lastSecond === thisSecond) return false;

    this.samples.push({
      elapsedMs,
      epochMs: this.startEpochMs + elapsedMs,
      power,
      speed,
      distance
    });

    this.lastSecond = thisSecond;

    if (this.samples.length > this.maxSamples) {
      this.samples.splice(0, this.samples.length - this.maxSamples);
    }

    return true;
  }



  reset() {
    this.samples.length = 0;
    this.lastSecond = null;
  }
}