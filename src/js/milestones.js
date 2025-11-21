export class MilestoneTracker {
  constructor(workoutSession) {
    this.workoutSession = workoutSession;

    // distance milestones (km)
    this.distanceMilestones = [10, 25, 50, 100];

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
    for (const milestone of this.distanceMilestones) {
      const reached = currentDistanceKm >= milestone;
      const alreadyTriggered = this.triggeredDistance.has(milestone);

      if (reached && !alreadyTriggered) {
        this.triggeredDistance.add(milestone);
        return {
          type: "distance",
          value: milestone,
          message: `${milestone} km completed!`,
        };
      }
    }

    return null;
  }

  reset() {
    this.triggeredDistance.clear();
  }
}
