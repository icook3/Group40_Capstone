When starting the main Zlow program, the user goes to Zlow.html. There are 3 script tags here. 

The first 5 script tags serve to introduce libraries that are used throughout zlow.html. The 6th script tag calls general JavaScript libraries to set some variables that are used in the next script tag. 

The 7th script tag does a lot more. It starts by importing the constants class from constants.js. Then, it uses 2 of the variables in the class in a pair of nested for loops. Next, it creates an A-entity tag, appending it to one of the variables from the previous script tag, and setting some of its attributes using more member variables of the constants class. All of these variables that are used are constants that do not change, and this script tag creates the ground below the track. 

Script tag 8 imports main.js, and script tag 9 calls initZlowApp. This is the most important flow for startup. 

The final script tag creates a new NotificationManager, in order to better handle notifications. 