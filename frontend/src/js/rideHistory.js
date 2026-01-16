// RideHistory class to manage historical ride data samples
// Currently only stores up to 60 minutes of data at 1 sample per second

export class RideHistory {
  constructor({ maxSamples = 60 * 60 } = {}) {
    this.maxSamples = maxSamples;
    this.samples = [];
    this.lastSecond = null;
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

  pushSample(time, power, speed, distance) {
    const thisSecond = Math.floor(time); // or Math.floor(time / 1000) if time is ms

    if (this.lastSecond === thisSecond) return false;

    this.samples.push({ time, power, speed, distance });
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
