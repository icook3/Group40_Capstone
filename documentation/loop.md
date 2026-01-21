When the loop functionality is called, a number of things happen

First, some if statements are used to determine if the user has paused the simulation. Then, it caluculates dt, and sets the current power and calories burned. Next, it calls calculateAccelerationSpeed, followed by calculateCoastingSpeed. 

Next, the simulation calls scene.update. This then calls objectField.init and objectField.advance. objectField.advance then calls getPos, detectKind, kind.resampleX, and setPos. 

After scene.update, the loop calls workoutSession.isWorkoutActive. Then it calls workoutSession.addFTPResult, and workoutSession.update. 

Next, it calls milestoneTracker.check. This calls multiple methods: workoutSession.getCurrentStats, checkDistance, checkTime, checkStreak, and checkCumulative. workoutSession.getCurrentStats calls getTotalTime and calculateAverage. checkDistance calls units.distanceUnit.convertTo. checkStreak calls calculateProjectedStreak, which calls getDateString and workoutStorage.getCurrentStreak. checkCumulative calls workoutStorage.getCumulativeRideCount. 

After this check, it calls notificationManager.show, which calls processQueue. 

Next, is rider.setSpeed and rider.setPower. Then, there is rider.update. This calls animatePedalingBike and animatePedalingPerson. animatePedalingPerson then calls cycleInterpolate. 

loop calls rampController.getCurrentTargetWatts, followed by calculateAccelerationSpeed and pacer.setSpeed. Next, it calls pacer.update, which is the same as rider.update, then it calls pacer.setPosition. 

Next is rampController.update. This starts by calling _startRamp, which then calls hud.skipWarmupCountdownEarly, getCurrentTargetWatts, and _announceStep. _announceStep then calls hud.showWorkoutMessage. After _startRamp, rampController.update directly calls getCurrentTargetWatts and _announceStep. 

After this, rampController.getCurrentTargetWatts is directly called, followed by hud.update. Then some code is run to push the ride history, before sendPeerDataOver is called. 

Finally, requestAnimationFrameFn is called, with loop as a parameter, and the entire loop begins again. 