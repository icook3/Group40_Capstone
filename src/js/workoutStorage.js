// workoutStorage.js: manages local storage for workouts

const STORAGE_KEY = "zlowWorkoutData";

export class WorkoutStorage {
  constructor() {
    this.data = this.load();
  }

  //Load data

  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return this.getEmptyData();
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error("Error loading workout data:", error);
      return this.getEmptyData();
    }
  }

  // save workout data

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.error("Error saving workout data:", error);
      // in case unable to save data
      alert("Could not save workout data, please restart and try again.");
    }
  }

  //Start with empty data

  getEmptyData() {
    return {
      workouts: [],
      personalRecords: {
        longestDistance: null,
        longestTime: null,
        mostCalories: null,
        highestAvgSpeed: null,
        highestAvgPower: null,
        highestMaxSpeed: null,
        highestMaxPower: null,
        highestFtp: null,
        highestPeakMinutePower: null,
      },
      lastWorkoutDate: null,
      currentStreak: 0,
    };
  }

  //Save a completed workout

  saveWorkout(workoutStats) {
    const workoutId = `workout_${Date.now()}`;
    const now = new Date();

    const workout = {
      id: workoutId,
      date: now.toISOString(),
      stats: workoutStats,
    };

    // Add to history
    this.data.workouts.push(workout);

    // Update streak (daily)
    const streak = this.updateStreak(now);

    // Check for personal history
    const newRecords = this.checkPersonalRecords(workout);

    // Save to local storage
    this.save();

    return {
      newRecords,
      streak,
    };
  }

  //Update streak relative to date

  updateStreak(workoutDate) {
    const today = this.getDateString(workoutDate);
    const lastDate = this.data.lastWorkoutDate;

    if (!lastDate) {
      // This would be the very first workout
      this.data.currentStreak = 1;
    } else {
      const yesterday = this.getDateString(
        new Date(workoutDate.getTime() - 24 * 60 * 60 * 1000)
      );

      if (lastDate === today) {
        // Does not increase streak if same day
      } else if (lastDate === yesterday) {
        // Increases if next day has a workout
        this.data.currentStreak += 1;
      } else {
        // Otherwise streak gets reset to 1
        this.data.currentStreak = 1;
      }
    }

    this.data.lastWorkoutDate = today;
    return this.data.currentStreak;
  }

  //Get date string from local user
  getDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  //Check if personal records were broken
  checkPersonalRecords(workout) {
    const newRecords = [];
    const { stats } = workout;
    const records = this.data.personalRecords;

    // Personal stats
    const checks = [
      {
        key: "longestDistance",
        value: stats.totalDistance,
        label: "Longest Distance",
      },
      { key: "longestTime", value: stats.totalTime, label: "Longest Time" },
      {
        key: "mostCalories",
        value: stats.totalCalories,
        label: "Most Calories",
      },
      {
        key: "highestAvgSpeed",
        value: stats.avgSpeed,
        label: "Highest Avg Speed",
      },
      {
        key: "highestAvgPower",
        value: stats.avgPower,
        label: "Highest Avg Power",
      },
      {
        key: "highestMaxSpeed",
        value: stats.maxSpeed,
        label: "Highest Max Speed",
      },
      {
        key: "highestMaxPower",
        value: stats.maxPower,
        label: "Highest Max Power",
      },
      {
        key: "highestFtp",
        value: stats.ftp,
        label: "Highest FTP",
      },
      {
        key: "highestPeakMinutePower",
        value: stats.peakMinutePower,
        label: "Highest 1-min Power",
      },
    ];

    checks.forEach(({ key, value, label }) => {
      if (!value || value === 0) return;

      if (!records[key] || value > records[key].value) {
        records[key] = {
          value,
          workoutId: workout.id,
          date: workout.date,
        };
        newRecords.push({ key, label, value });
      }
    });

    return newRecords;
  }

  //Get workout history
  getWorkoutHistory(limit = null) {
    if (limit) {
      return this.data.workouts.slice(-limit);
    }
    return this.data.workouts;
  }

  // Get personal records
  getPersonalRecords() {
    return this.data.personalRecords;
  }

  //Get current streak

  getCurrentStreak() {
    return this.data.currentStreak || 0;
  }

  // Clear all workout records
  clearAll() {
    this.data = this.getEmptyData();
    this.save();
  }

  // Or by ID
  deleteWorkout(workoutId) {
    this.data.workouts = this.data.workouts.filter((w) => w.id !== workoutId);
    this.save();
  }
}
