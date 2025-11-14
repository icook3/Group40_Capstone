The connection protocol has 2 elements. name, and data. name is the metadata, to differentiate what is being sent, data is the data itself. 
Different names: 

# playerData
This takes a json String formatted in the same way the player color data is stored in the local storage. 

This connection is done by both sides at the start of the connection, and is used to set up the other character

# speed
This takes a float, for the speed that the player moves

This connection is sent over in the update function, to give an accurate representation of the other player's speed