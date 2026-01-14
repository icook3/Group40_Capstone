When starting the main Zlow program, the user goes to Zlow.html. There are 10 script tags here. 

The first 5 script tags serve to introduce libraries that are used throughout zlow.html. The 6th script tag calls general JavaScript libraries to set some variables that are used in the next script tag. 

The 7th script tag does a lot more. It starts by importing the constants class from constants.js. Then, it uses 2 of the variables in the class in a pair of nested for loops. Next, it creates an A-entity tag, appending it to one of the variables from the previous script tag, and setting some of its attributes using more member variables of the constants class. All of these variables that are used are constants that do not change, and this script tag creates the ground below the track. 

Script tag 8 imports main.js, and script tag 9 calls initZlowApp. This is the most important flow for startup. 

initZlowApp starts by checking if you are running peer-to-peer. If you are connecting to a peer, it uses peerJS's libraries to connect, alongside calling the method recieveData(data). This method has a switch-case block. The first case is the only one called here, and it starts by creating a new AvatarMovement using AvatarMovement.js. Afterwards, it calls AvatarCreator.loadOtherData, which does not use any other methods. The AvatarMovement constructor calls new AvatarCreator from avatarCreator.js. This calls the method loadPlayerData, which is the end of its tree, and createEntity, which calls further methods. createEntity first calls createPlayerModel, which calls applyPlayerColors, setInitialPose, and an inner function checkReady. All of these only use default libraries. createEntity also calls createBikeModel, which then calls applyBikeColors and its own version of checkReady. 

After setting up multiplayer, initZlowApp sets up the units properly, using the methods units.setUnits, and a native setUnits method. It calls the native method multiple times to set all the units properly. Both of these methods do not call any other methods

The final script tag creates a new NotificationManager, in order to better handle notifications. 