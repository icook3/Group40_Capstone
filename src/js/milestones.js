import { units } from "./units/index.js";

export class MilestoneTracker {
  constructor(workoutSession) {
    this.workoutSession = workoutSession;

    // distance milestones in km and mi
    this.milestoneValues = {
      km: [10, 25, 50, 100],
      mi: [10, 25, 50, 100],
    };

    // track session milestones
    this.triggeredDistance = new Set();
  }

  check() {
    // get stats from workoutSession
    const stats = this.workoutSession.getCurrentStats();

    // check distance milestones
    return this.checkDistance(stats.totalDistance);
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

  reset() {
    this.triggeredDistance.clear();
  }
}
