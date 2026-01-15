export class RideHistory {
  constructor({ maxSamples = 60 * 60 } = {}) {
    this.maxSamples = maxSamples;
    this.samples = [];
    this.lastSecond = null;
  }

  pushIfNewSecond(thisSecond, sample) {
    if (this.lastSecond === thisSecond) return false;

    this.samples.push(sample);
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
