import { units } from "./units/index.js";

export class MilestoneTracker {
  constructor(workoutSession) {
    this.workoutSession = workoutSession;

    // distance milestones in km and mi
    this.milestoneValues = {
      km: [10, 25, 50, 100],
      mi: [10, 25, 50, 100],
    };

    // time milestones
    this.timeMilestones = [
      { value: 15, label: "15 seconds" }, // 15 sec for testing
      { value: 30, label: "30 seconds" }, // 30 sec for testing
      { value: 60, label: "1 minute" }, // 1 min for testing
      { value: 1800, label: "30 minutes" }, // 30 min
      { value: 3600, label: "1 hour" }, // 1 hour
      { value: 7200, label: "2 hours" }, // 2 hours
    ];

    // track session milestones
    this.triggeredDistance = new Set();
    this.triggeredTime = new Set();
  }

  check() {
    const stats = this.workoutSession.getCurrentStats();

    // check distance milestones
    const distanceMilestone = this.checkDistance(stats.totalDistance);
    if (distanceMilestone) return distanceMilestone;

    // check time milestones
    const timeMilestone = this.checkTime(stats.totalTime);
    if (timeMilestone) return timeMilestone;

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

  reset() {
    this.triggeredDistance.clear();
    this.triggeredTime.clear();
  }
}
