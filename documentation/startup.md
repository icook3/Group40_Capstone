When starting the main Zlow program, the user goes to Zlow.html. There are 10 script tags here. 

The first 5 script tags serve to introduce libraries that are used throughout zlow.html. The 6th script tag calls general JavaScript libraries to set some variables that are used in the next script tag. 

The 7th script tag does a lot more. It starts by importing the constants class from constants.js. Then, it uses 2 of the variables in the class in a pair of nested for loops. Next, it creates an A-entity tag, appending it to one of the variables from the previous script tag, and setting some of its attributes using more member variables of the constants class. All of these variables that are used are constants that do not change, and this script tag creates the ground below the track. 

Script tag 8 imports main.js, and script tag 9 calls initZlowApp. This is the most important flow for startup. 

initZlowApp starts by checking if you are running peer-to-peer. If you are connecting to a peer, it uses peerJS's libraries to connect, alongside calling the method recieveData(data). This method has a switch-case block. The first case is the only one called here, and it starts by creating a new AvatarMovement using AvatarMovement.js. Afterwards, it calls AvatarCreator.loadOtherData, which does not use any other methods. The AvatarMovement constructor calls new AvatarCreator from avatarCreator.js. This calls the method loadPlayerData, which is the end of its tree, and createEntity, which calls further methods. createEntity first calls createPlayerModel, which calls applyPlayerColors, setInitialPose, and an inner function checkReady. All of these only use default libraries. createEntity also calls createBikeModel, which then calls applyBikeColors and its own version of checkReady. 

After setting up multiplayer, initZlowApp sets up the units properly, using the methods units.setUnits, and a setUnits method that is in the same file. It calls this setUnits method multiple times to set all the units properly. Both of these methods do not call any other methods that we defined. 

Next, it creates a new WorkoutStorage. This calls the load method, and the load method will often call the getEmptyData method. After creating a WorkoutStorage, it creates a new WorkoutSession, NotificationManager, MilestoneTracker, and WorkoutSummary. The NotificationManager will call createContainer. 

Next, it calls workoutSession.start and milestoneTracker.reset. After these method calls, it creates a new TrainerBluetooth and new PauseCountdown. Then it creates the main AvatarMovement objects. One for the player, and one for the pacer if you are not in multiplayer mode. This follows the same pathway as shown above during peer-to-peer. Once this is done, it calls setPacerColors to set the pacers colors. This calls applyPlayerColors and applyBikeColors. 

After this, the method creates a new KeyboardMode and a new StandardMode. Then it creates a new ZlowScene. 

To create a new ZlowScene, first, a new SceneryManager is created. This then creates a new ScenePolicy. In the ScenePolicy Constructor, the methods #makeBandPolicy and #computeLayout are called. #makeBandPolicy calls a bunch of methods from DefaultPolicy, meanwhile #computeLayout calls planSide twice. 

After the SceneryManager is created, an if statement is checked, and if it turns out to be true, scenePolicy.logBands is called. This inside itself calls multiple simple methods on multiple bands. Then, a new Track and a new Cloud objects are created. This is folowed by creating a new ObjectField. This calls the spawnScenery method 5 times. After that, the ObjectField is finished, and all that is left is to call attachExternalBands on it, finishing the ZlowScene object. 

spawnScenery then does multiple things before calling _spawnAtZ twice. This method starts by calling _pickKind. Then it calls kind.spawn. That can either call sampleBuildingX or sampleTreeX. These two methods are very similar, and they both call setPos. 

After the creation of the ZlowScene object, the setPacerSpeed method is called. Then, a new HUD object is created. This is followed by if statements to create a new RampTestController. 

To create a new RampTestController, first, the method hud.showWarmupCountdown is called. This has a method parameter onDone, which is called early in the method. In this instance, onDone involves calling rampTestController._startRamp. This calls hud.skipWarmupCountdownEalry, followed by getCurrentTargetWatts and _announceStep. _announceStep calls hud.showWorkoutMessage. After onDone is called, tick is called. onDone is called again, then tick is called again. Finally, the RampTestController constructor calls _startRamp itself. 

After the cration of the RampTestController, hud.showStartCountdown is called. This also has a method parameter onDone, that is called right away. This calls hud.showWarmupCountdown, with its own onDone method. This version matches the previous showWarmupCountdown's onDone method. showStartCountdown also calls tick, followed by onDone again, and tick again. 

After this is all done, a new Strava object is created. Multiple event listeners are subsequently created, to listen for various buttons. Finally, standardMode.init is called, and loop is called. The contents of loop will be discussed in a separate document. 

The final script tag creates a new NotificationManager, in order to better handle notifications. The constructor for NorificationManager then calls createContainer.