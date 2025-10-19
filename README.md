![ZlowGif](https://github.com/user-attachments/assets/82ad9bf2-1d07-419f-b6dd-87fa9ebbbbb5)

# Zlow: Browser-Based Cycling Simulator Prototype

A modular, browser-based cycling simulator. Built with JavaScript, A-Frame, and Bluetooth APIs, with Strava export integration.

## Features
- **Bluetooth Connectivity:** Connect to Wahoo-compatible smart trainers, poll real-time power, cadence, and speed.
- **3D Environment:** Rendered with A-Frame, includes terrain, scenery, and a simple avatar.
- **Pacer Rider:** Fixed-power pacer for comparison.
- **HUD Overlay:** Shows power, cadence, speed, distance, time, and position vs. pacer.
- **Strava Export:** Upload ride data to Strava via API after each session.

## Structure
- `resources` — Contains various resources
	- `favicons` — Stores the program favicon
	- `images` — Contains a number of important images for different pages
	- `textures` — Stores image textures
	- `mainMenu.html` — Main entry point, allows connecting the trainer, and provides access to settings
	- `menuSettings.html` — Contains settings page for changing more general settings
- `index.html` — Loads A-Frame scene and UI.
- `style.css` — Handles various CSS styles for the program
- `js` — Contains JavaScript code
	- `scene` - Handles scene generation
		- `core` — core utilities for scene generation
			- `Terrain.js` — Handles Terrain generation
			- `util.js` — Contains several utilities for scene generation
		- `env` — Handles the overall environment
			- `Cloud.js` — Handles creating the clouds above the scene
			- `DirtPattern.js` — Handles creating the track and the dirt pattern on it
			- `EdgeBand.js` — Handles the objects on the side of the track
			- `EdgeLineBand.js` — Handles the objects far away from the track
		- `objects` — Handles various 3D objects
			- `kinds` — Stores representations of different 3D objects along the side of the track
				- `Building.js` — Handles various buildings along the side of the track
				- `index.js` — Contains various utilities for handling different kinds of elements
				- `Tree.js` — Handles trees along the side of the track
			- `ObjectField.js` — Handles creating a set of objects at different locations
		- `index.js` — Sets up and updates the A-Frame 3D world.
	- `avatar.js` — Sets up and updates A-Frame 3D avatar.
	- `bluetooth.js` — Handles Bluetooth device connection and data polling.
	- `hud.js` — Renders the heads-up display overlay.
	- `keyboardMode.js` — Handles keyboard mode functionalities and variables
	- `main.js` — Main app entry point
	- `menu.js` — Handles event listeners on the main menu
	- `menuSettings.js` — Handles event listeners on the settings page
	- `pause_countdown.js` — Handles the countdown when the simulation is paused
	- `simulationstate.js` — Handles tracking the state of the simulation
	- `standardMode.js` — Handles standard mode functionalities and variables
	- `strava.js` — Handles Strava OAuth and activity upload.

## Stretch Goals
- Local/cloud session storage
- Terrain/route selection
- Support for additional Bluetooth fitness devices

---

## Quick Start
1. Open `resources/mainMenu.html` in a modern browser (Chrome/Edge recommended).
2. Click "Connect Trainer" to pair with your smart trainer.
3. Click "Start" to start the simulation.
4. Start pedaling to see your avatar move and HUD update.
5. After your ride, export to Strava.

---

## Development Notes
- Modular ES6 code, no build step required.
- See each JS file for further documentation.

You can find a live example at https://gioandjake.com/zlow (recommend to use Chrome)

# Surviving on your donations
[Donations help keep the server up](https://paypal.me/jsimonson2013) :smile:
