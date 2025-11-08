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
		- `favicon.ico` — The main favicon used for the program
		- `ZlowFavicon-dark.svg` — A variant of the favicon used when the browser is in dark mode for better readability
		- `ZlowFavicon.svg` — A variant of the favicon used when the browser is in light mode
	- `fonts` — Stores a number fonts used for HUD elements and the main menu
		- `FugazOne-Regular.ttf` — The font Fugaz One
		- `Nunito-Italic-VariableFont_wght.ttf` — The font Nunito Italic
		- `Nunito-VariableFont_wght.ttf` — The font Nunito
		- `OFL 2.txt` — The license for the font Nunito
		- `OFL.txt` — The license for the font Fugaz One
	- `images` — Contains a number of important images for different pages
		- `backgroung.png` — The background for the main menu
		- `calories.svg` — The icon used to represent calories in the hud
		- `center-hud.svg` — A mask to shape the center of the hud, alongside some buttons on other pages
		- `license.pdf` — The license for the calories and time images
		- `Thumbs.db` — TODO: Find who created this, and what its purpose is
		- `time.svg` — The icon used to represent time on the hud
	- `models` — Stores various 3D models
		- `bgmodels` — Stores 3D models that appear in the background of the scene
			- `bush1.glb` — A bush that can appear in the background
			- `cloud1.glb` — One version of a cloud that appears in the sky
			- `cloud2.glb` — A second cloud that appears in the sky
			- `cloud3.glb` — A third cloud that also appears in the sky
			- `House.glb` — A house that appears in the background
			- `TallBuilding.glb` — A tall building that appears in the background
			- `tree1.glb` — A tree model that appears in the background
			- `tree2.glb` — A second tree model that appears in the background
			- `tree3.glb` — A third tree model that can appear in the background
			- `Trees-License.txt` — The license for the tree models
			- `WideBuilding.glb` — A wider building model that appears in the background
		- `playermodels` — Stores the models of the player and the bike
			- `bikeV4.glb` — The 3D model of the bike
			- `femaleV6.glb` — The female character model
			- `maleV5.glb` — The male character model
	- `textures` — Stores image textures
		- `Grass.jpeg` — The image texture for the grass
		- `Track.jpeg` — The image texture for the track
- `src` — Stores all source code for the project
	- `css` — Stores CSS source code
		- `hud.css` — Handles CSS styles for the modern HUD
		- `menu.css` — Handles CSS styles for the main menu
		- `playerCustomization.css` — Handles CSS styles for the player customization screen
        - 'strava.css' — Handles CSS styles for the strava connections screen
		- `style.css` — Handles general CSS styles for the program
	- `html` — Stores HTML source code
		- `mainMenu.html` — Main entry point, allows connecting the trainer, and provides access to various settings
		- `playerCustomization.html` — Screen for customizing the player
		- `zlow.html` — Loads A-Frame scene and UI.
	- `js` — Contains JavaScript code
		- `scene` - Handles scene generation
			- `core` — core utilities for scene generation
				- `Terrain.js` — Handles Terrain generation
				- `util.js` — Contains several utilities for scene generation
			- `env` — Handles the overall environment
				- `Cloud.js` — Handles creating the clouds above the scene
				- `DirtPattern.js` — Handles creating the track and the dirt pattern on it
				- `SceneryBand.js` — Handles creating the bands and object placement within
				- `SceneryManager.js` — Loads the config files from /policy
			- `objects` — Handles various 3D objects
				- `kinds` — Stores representations of different 3D objects along the side of the track
					- `Building.js` — Handles various buildings along the side of the track
					- `index.js` — Contains various utilities for handling different kinds of elements
					- `Tree.js` — Handles trees along the side of the track
				- `ObjectField.js` — Handles creating a set of objects at different locations
			- `policy` — Contains the config and policies for banding
				- `BandPolicy.md` — Documentation on policies
				- `DefaultPolicy.js` — A default policy for setting up custom policies
				- `edge_default_cfg.js` — Handles the banding on the edges
				- `old_default_cfg.js` — Recreates the original behavior with the new policy system
				- `ScenePolicy.js` — Handles turning the config file into a policy
				- `test_multiband_cfg.js` — A test policy for multiple bands in one config file
			- `index.js` — Sets up and updates the A-Frame 3D world.
		- `units` — Handles various units and unit conversions
			- `index.js` — Sets up units, and provides references to the currently used unit conversions
			- `kg.js` — Handles unit conversions for Kilograms - the default weight unit
			- `km.js` — Handles unit conversions for Kilometers - the default distance unit
			- `kmh.js` — Handles unit conversions for Kilometers per Hour - the default speed unit
			- `lb.js` — Handles unit conversions for Pounds
			- `mi.js` — Handles unit conversions for Miles
			- `mph.js` — Handles unit conversions for Miles per Hour
			- `units.md` — Documentation on different units
			- `W.js` — Handles unit conversions for Watts - the default power unit
	    - `avatarCreator.js` — Sets up A-Frame 3D avatar.
		- `avatarMovement.js` — Updates A-Frame 3D avatar.
		- `bluetooth.js` — Handles Bluetooth device connection and data polling.
		- `constants.js` — Stores important constants for the program execution
		- `hud.js` — Renders the heads-up display overlay.
		- `keyboardMode.js` — Handles keyboard mode functionalities and variables
		- `main.js` — Main app entry point
		- `menu.js` — Handles event listeners on the main menu
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
1. Open `src/html/mainMenu.html` in a modern browser (Chrome/Edge recommended).
2. Click "Connect Trainer" to pair with your smart trainer.
3. If needed, click "Settings", and customize any needed settings in the new popup menu.
4. Click "Start" to start the simulation.
5. Start pedaling to see your avatar move and HUD update.
6. After your ride, export to Strava.

---

## Development Notes
- Modular ES6 code, no build step required.
- See each JS file for further documentation.

You can find a live example at https://gioandjake.com/zlow (recommend to use Chrome)

# Surviving on your donations
[Donations help keep the server up](https://paypal.me/jsimonson2013) :smile:
