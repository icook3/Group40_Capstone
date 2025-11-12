export class WorkoutSession {
  constructor() {
    this.isActive = false;
    this.startTime = null;
    this.endTime = null;

    // start with 0
    this.totalDistance = 0; // km
    this.totalCalories = 0; // kcal

    // keep track of maximum values (which will be updated every couple of sec)
    this.maxSpeed = 0; // km/h
    this.maxPower = 0; // watts

    // to keep track of average as well
    this.samples = [];

    // How often we will capture workout data in the current session
    this.sampleInterval = 2000; // 2 seconds
    this.lastSampleTime = 0;
  }

  //start session
  start() {
    this.isActive = true;
    this.startTime = Date.now();
    this.endTime = null;
    this.totalDistance = 0;
    this.totalCalories = 0;
    this.maxSpeed = 0;
    this.maxPower = 0;
    this.samples = [];
    this.lastSampleTime = this.startTime;
  }

  update(currentStats) {
    if (!this.isActive) return;

    const now = Date.now();
    const { speed, power, distance, calories } = currentStats;

    this.totalDistance = distance || 0;
    this.totalCalories = calories || 0;

    // update max stats
    if (speed !== undefined && speed > this.maxSpeed) {
      this.maxSpeed = speed;
    }
    if (power !== undefined && power > this.maxPower) {
      this.maxPower = power;
    }

    // sample at given interval
    if (now - this.lastSampleTime >= this.sampleInterval) {
      this.samples.push({
        timestamp: now,
        speed: speed || 0,
        power: power || 0,
      });
      this.lastSampleTime = now;
    }
  }

  // end workout

  end() {
    if (!this.isActive) {
      throw new Error("No active workout session to end");
    }

    this.isActive = false;
    this.endTime = Date.now();

    return this.calculateStats();
  }

  calculateStats() {
    const totalTime = this.getTotalTime();
    const avgSpeed = this.calculateAverage("speed");
    const avgPower = this.calculateAverage("power");

    return {
      totalTime, // in seconds
      totalDistance: this.totalDistance, // in km
      totalCalories: this.totalCalories, // in kcal
      avgSpeed, // in km/h
      avgPower, // in watts
      maxSpeed: this.maxSpeed, // in km/h
      maxPower: this.maxPower, //in watts
    };
  }

  calculateAverage(field) {
    if (this.samples.length === 0) return 0;

    const sum = this.samples.reduce((acc, sample) => acc + sample[field], 0);
    return sum / this.samples.length;
  }

  getTotalTime() {
    if (!this.startTime) return 0;

    const endTime = this.endTime || Date.now();
    return Math.floor((endTime - this.startTime) / 1000);
  }

  getCurrentStats() {
    return {
      totalTime: this.getTotalTime(),
      totalDistance: this.totalDistance,
      totalCalories: this.totalCalories,
      avgSpeed: this.calculateAverage("speed"),
      avgPower: this.calculateAverage("power"),
      maxSpeed: this.maxSpeed,
      maxPower: this.maxPower,
    };
  }

  isWorkoutActive() {
    return this.isActive;
  }
  // cancel workout session without saving stats
  cancel() {
    this.isActive = false;
    this.startTime = null;
    this.endTime = null;
    this.totalDistance = 0;
    this.totalCalories = 0;
    this.maxSpeed = 0;
    this.maxPower = 0;
    this.samples = [];
  }
}
