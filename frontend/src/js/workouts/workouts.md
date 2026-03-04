# Workouts Interface

A class using the **Workouts** interface represents a workout that the player can do. 

## Required methods/fields

- **constructor(object)** → self
    - initializes necessary variables
- **startWorkout()** → void
    - initializes the workout itself
- **computeFTPFromHistory(Array)** → Object
    - Calculates the FTP from the current stats
- **FTPResult** → Object
    - Stores the most recent FTP calculation
- **getCurrentTargetWatts()** → Number
    - Returns the current target watts
- **update(Number, Number)** → void
    - Updates the phase progression

## Notes
- To add new workouts, first edit mainMenu.html
    - This adds the option to the menu
- Once your workout exists, create a workout.js file implementing this interface
- Afterwards, change zlow.js to account for your new workout. 
    - Add a new condition to the initializeWorkouts method.