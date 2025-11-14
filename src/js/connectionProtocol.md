The connection protocol has 2 elements. name, and data. name is the metadata, to differentiate what is being sent, data is the data itself. 
Different names: 

# playerData
This takes a json String formatted in the same way the player color data is stored in the local storage. 

This connection is done by both sides at the start of the connection, and is used to set up the other character

# weight
This takes an integer, for the weight.

This connection is done by both sides at the start of the connection, and is used to set up the weight of the character

# power

This takes a float, for the power outputted by the player

This connection is sent over every time the power changes for one of the characters. It is used to calculate the movement on the other person's screen.