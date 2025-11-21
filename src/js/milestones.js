import { units } from "./units/index.js";

export class MilestoneTracker {
  constructor(workoutSession, workoutStorage) {
    this.workoutSession = workoutSession;
    this.workoutStorage = workoutStorage;

    // distance milestones in km and mi
    this.milestoneValues = {
      km: [10, 25, 50, 100],
      mi: [10, 25, 50, 100],
    };

    // time milestones
    this.timeMilestones = [
      //{ value: 15, label: "15 seconds" }, // 15 sec for testing
      //{ value: 30, label: "30 seconds" }, // 30 sec for testing
      //{ value: 60, label: "1 minute" }, // 1 min for testing
      { value: 1800, label: "30 minutes" }, // 30 min
      { value: 3600, label: "1 hour" }, // 1 hour
      { value: 7200, label: "2 hours" }, // 2 hours
    ];

    // day streak milestones
    this.streakMilestones = [3, 5, 7, 10, 14, 20, 30];

    // cumulative rides (ever)
    this.cumulativeMilestones = [10, 25, 50, 100];

    // track session milestones
    this.triggeredDistance = new Set();
    this.triggeredTime = new Set();
    this.streakChecked = false; // Only check streak once per day
    this.cumulativeChecked = false; //can check multiple times per day
  }

  check() {
    const stats = this.workoutSession.getCurrentStats();

    // check distance milestones
    const distanceMilestone = this.checkDistance(stats.totalDistance);
    if (distanceMilestone) return distanceMilestone;

    // check time milestones
    const timeMilestone = this.checkTime(stats.totalTime);
    if (timeMilestone) return timeMilestone;

    // check streak milestones (only once when workout is at least 10 min)
    const streakMilestone = this.checkStreak(stats.totalTime);
    if (streakMilestone) return streakMilestone;

    // check cumulative rides
    const cumulativeMilestone = this.checkCumulative(stats.totalTime);
    if (cumulativeMilestone) return cumulativeMilestone;

    return null;
  }

  checkDistance(currentDistanceKm) {
    //get current user's unit preference
    const userUnit = units.distanceUnit.name;
    // convert current dist to user's preferred unit
    const currentDistance = units.distanceUnit.convertTo(currentDistanceKm);

    // get milestones for user's preferred unit
    const milestones = this.milestoneValues[userUnit];

    for (const milestone of milestones) {
      const reached = currentDistance >= milestone;
      const alreadyTriggered = this.triggeredDistance.has(
        `${userUnit}-${milestone}`
      );

      if (reached && !alreadyTriggered) {
        this.triggeredDistance.add(`${userUnit}-${milestone}`);
        return {
          type: "distance",
          value: milestone,
          unit: userUnit,
          isSpecial: milestone === 100,
          message: `${milestone} ${userUnit} completed!`,
        };
      }
    }

    return null;
  }

  checkTime(currentTimeSeconds) {
    //console.log("Checking time milestones. Current time:", currentTimeSeconds);

    for (const milestone of this.timeMilestones) {
      const reached = currentTimeSeconds >= milestone.value;
      const alreadyTriggered = this.triggeredTime.has(milestone.value);

      if (reached && !alreadyTriggered) {
        this.triggeredTime.add(milestone.value);
        //console.log(`Triggering: ${milestone.label}`);
        return {
          type: "time",
          value: milestone.value,
          isSpecial: false,
          message: `${milestone.label} completed!`,
        };
      }
    }

    return null;
  }

  checkStreak(currentTimeSeconds) {
    if (this.streakChecked) return null;
    //if (currentTimeSeconds < 15) return null; //15 sec to test
    if (currentTimeSeconds < 600) return null; // When less than 10 min

    this.streakChecked = true;

    // this calculates what the streak will be when current workout ends
    const projectedStreak = this.calculateProjectedStreak();

    // check if projection is a milestone
    for (const milestone of this.streakMilestones) {
      if (projectedStreak === milestone) {
        return {
          type: "streak",
          value: milestone,
          isSpecial: false,
          message: `${milestone} day streak!`,
        };
      }
    }

    return null;
  }

  calculateProjectedStreak() {
    const today = this.getDateString(new Date());
    const lastDate = this.workoutStorage.data.lastWorkoutDate;
    const currentStreak = this.workoutStorage.getCurrentStreak();

    if (!lastDate) {
      // first workout ever
      return 1;
    }

    const yesterday = this.getDateString(
      new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    if (lastDate === today) {
      // stays the same if already had workout today
      return currentStreak;
    } else if (lastDate === yesterday) {
      // otherwise increase
      return currentStreak + 1;
    } else {
      // if ther is a gap between days it becomes 1
      return 1;
    }
  }

  getDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  checkCumulative(currentTimeSeconds) {
    if (this.cumulativeChecked) return null;
    if (currentTimeSeconds < 2) return null; // for testing
    //if (currentTimeSeconds < 600) return null; //ride has a min of 10 min

    this.cumulativeChecked = true;

    const projectedCount = this.workoutStorage.getCumulativeRideCount() + 1;

    for (const milestone of this.cumulativeMilestones) {
      if (projectedCount === milestone) {
        return {
          type: "cumulative",
          value: milestone,
          isSpecial: milestone === 100,
          message: `${milestone} total rides completed!`,
        };
      }
    }

    return null;
  }

  reset() {
    this.triggeredDistance.clear();
    this.triggeredTime.clear();
    this.streakChecked = false;
    this.cumulativeChecked = false;
  }
}
