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
- `resources` — Contains various resources.
	- `favicons` — Stores the program favicon.
		- `favicon.ico` — The main favicon used for the program.
		- `ZlowFavicon-dark.svg` — A variant of the favicon used when the browser is in dark mode for better readability.
		- `ZlowFavicon.svg` — A variant of the favicon used when the browser is in light mode.
	- `fonts` — Stores a number fonts used for HUD elements and the main menu.
		- `FugazOne-Regular.ttf` — The font Fugaz One.
		- `Nunito-Italic-VariableFont_wght.ttf` — The font Nunito Italic.
		- `Nunito-VariableFont_wght.ttf` — The font Nunito.
		- `OFL 2.txt` — The license for the font Nunito.
		- `OFL.txt` — The license for the font Fugaz One.
	- `images` — Contains a number of important images for different pages.
		- `achievementImages` — The images for various achievements.
			- `Basic Achievement Outline.png` — A basic outline for achievement images, that is easy to copy and paste around.
			- `CaloriesMilestone1.png` — The achievement image for "Burned 400 Calories!"
			- `CaloriesMilestone2.png` — The achievement image for "Burned 800 Calories!"
			- `CaloriesMilestone3.png` — The achievement image for "Burned 1,500 Calories!"
			- `CreateACharacter.png` — The achievement image for "Created A Character"
			- `DistanceMilestone1.png` — The achievement image for "Rode 25 km!"
			- `DistanceMilestone2.png` — The achievement image for "Rode 50 km!"
			- `DistanceMilestone3.png` — The achievement image for "Rode 100 km!"
			- `PeerToPeer.png` — The achievement image for "Ride Together!"
			- `PowerMilestone1.png` — The achievement image for "Reached 75 Watts!"
			- `PowerMilestone2.png` — The achievement image for "Reached 150 Watts!"
			- `PowerMilestone3.png` — The achievement image for "Reached 300 Watts!"
			- `StreakMilestone1.png` — The achievement image for "Rode For 7 Days in a Row!"
			- `StreakMilestone2.png` — The achievement image for "Rode For 14 Days in a Row!"
			- `StreakMilestone3.png` — The achievement image for "Rode For 30 Days in a Row!"
			- `TCSExport.png` — The achievement image for "Better Shared!"
			- `TimeMilestone1.png` — The achievement image for "Rode For 30 Minutes!"
			- `TimeMilestone2.png` — The achievement image for "Rode For 1 Hour!"
			- `TimeMilestone3.png` — The achievement image for "Rode For 2 Hours!"
			- `Welcome.png` — The achievement image for "Welcome to Zlow!"
		- `back.svg` — An icon to indicate going back to a previous page.
		- `background.png` — The background for the peer menu and the changelog (temporary).
		- `backgroundA.png` - The background used for the peer menu and changelog
		- `calibrateTrainer.svg` — An icon used for the calibrate trainer button.
		- `calories.svg` — The icon used to represent calories in the hud.
		- `center-hud.svg` — A mask to shape the center of the hud, alongside some buttons on other pages.
		- `connectTrainer.svg` — An icon used for the connect to peer button.
		- `dev.svg` - Icon used for a toggle button
		- `exit.svg` — An icon used for the exit to main menu button.
		- `license.pdf` — The license for the calories and time images.
		- `pacer.svg` — An icon used for the pacer speed input.
		- `pause.svg` — An icon used for the pause button.
		- `resetCalories.svg` — An icon used for the Reset Calories button.
		- `stop.svg` — An icon used for the stop workout button.
		- `sync.svg` — An icon used for the Sync Pacer button.
		- `time.svg` — The icon used to represent time on the hud.
		- `trainer.svg` — An icon used for the connect trainer button.
		- `weight.svg` — An icon used for the weight input. 
	- `models` — Stores various 3D models.
		- `bgmodels` — Stores 3D models that appear in the background of the scene.
			- `bush1.glb` — A bush that can appear in the background.
			- `cloud1.glb` — One version of a cloud that appears in the sky.
			- `cloud2.glb` — A second cloud that appears in the sky.
			- `cloud3.glb` — A third cloud that also appears in the sky.
			- `house.glb` — A house that appears in the background.
			- `tallBuilding.glb` — A tall building that appears in the background.
			- `tree1.glb` — A tree model that appears in the background.
			- `tree2.glb` — A second tree model that appears in the background.
			- `tree3.glb` — A third tree model that can appear in the background.
			- `Trees-License.txt` — The license for the tree models.
			- `wideBuilding.glb` — A wider building model that appears in the background.
			- `winterTree.glb` — A tree model that appears in the snowy terrain.
		- `playermodels` — Stores the models of the player and the bike.
			- `bikeV4.glb` — The 3D model of the bike.
			- `femaleV6.glb` — The female character model.
			- `helmet.glb` — The model used for the helmet.
			- `maleV5.glb` — The male character model.
	- `textures` — Stores image textures.
		- `Grass.jpeg` — The image texture for the grass.
		- `Snow.JPG` — The image texture for the snowy terrain.
		- `Track.jpeg` — The image texture for the track.
- `src` — Stores all source code for the project.
	- `css` — Stores CSS source code.
		- `achievementsPage.css` — Handles CSS styles for the achievements page.
		- `cameraPref.css` — Handles CSS styles for the camera position selection page.
		- `changelog.css` — Handles CSS styles for the changelog page.
		- `generalCSS.css` — A set of useful CSS styles used throughout Zlow
		- `hud.css` — Handles CSS styles for the modern HUD.
		- `lobbyBrowser.css` — Handles CSS styles for the lobby browser.
		- `lobbyRoom.css` — Handles CSS styles for the lobby room.
		- `menu.css` — Handles CSS styles for the main menu.
		- `peerToPeer.css` — Handles CSS styles for the peer-to-peer menu.
		- `playerCustomization.css` — Handles CSS styles for the player customization screen.
		- `strava.css` — Handles CSS styles for the strava connection screen.
		- `style.css` — Handles general CSS styles for the program.
		- `terrainSwitcher.css` — Handles CSS styles for the terrain selection screen.
		- `workoutSummary.css` — Handles CSS styles for the workout summary popup.
	- `html` — Stores HTML source code.
		- `achievements.html` — Screen for viewing achievements
		- `cameraPref.html` — Screen for selecting between camera views
		- `changelog.html` — Screen for the Zlow changelog
		- `connectToPeers.html` — Screen for connecting via the peer-to-peer network
		- `index.html` — The page that is loaded, and is filled in by the other pages to create a Single-Page application. 
		- `LobbyBrowser.html` — Screen for browsing available multiplayer lobbies
		- `lobbyRoom.html` — Screen for when you are in a multiplayer lobby
		- `mainMenu.html` — Main entry point, allows connecting the trainer, and provides access to various settings.
		- `playerCustomization.html` — Screen for customizing the player.
		- `terrainSwitcher.html` — Screen for selecting different terrains
		- `zlow.html` — Loads A-Frame scene and UI.
	- `js` — Contains JavaScript code.
		- `achievements` — Directory for files related to the achievements system
			- `achievement.js` — Defines a class template for different achievements
			- `achievementManager.js` — Handles saving, retrieving them, and unlocking achievements.
		- `config` — Directory for configuration files
			- `config.js` — Configuration file
			- `configLoader.js` — Handles loading the configuration file
		- `multiplayer` — Handles the full multiplayer implementation
			- `gameClient.js` — Connects to the game service
			- `gameDecoder.js` — Reads the values returned from the multiplayer servers
			- `lobbyClient.js` — Connects to the multiplayer lobbies. 
			- `multiplayerAuth.js` — Authenticates frontend users with the multiplayer backend
			- `multiplayerConstants.js` — Stores important constants related to the multiplayer
			- `multiplayerManager.js` — Controls the position of other players when you are in multiplayer
		- `scene` — Handles scene generation.
			- `core` — core utilities for scene generation.
				- `Terrain.js` — An empty class, originally intended to handle terrain generation. 
				- `util.js` — Contains several utilities for scene generation.
			- `env` — Handles the overall environment.
				- `Cloud.js` — Handles creating the clouds above the scene.
				- `GroundInstanced.js` - An instanced version of the ground plane
				- `SceneryBand.js` — Handles creating the bands and object placement within.
				- `SceneryManager.js` — Loads the config files from /policy.
				- `Track.js` — Handles creating track template pieces.
			- `objects` — Handles various 3D objects.
				- `kinds` — Stores representations of different 3D objects along the side of the track.
					- `Building.js` — Handles various buildings along the side of the track.
					- `index.js` — Contains various utilities for handling different kinds of elements.
					- `Tree.js` — Handles trees along the side of the track.
				- `ObjectField.js` — Handles creating a set of objects at different locations.
			- `policy` — Contains the config and policies for banding.
				- `BandPolicy.md` — Documentation on policies.
				- `DefaultPolicy.js` — A default policy for setting up custom policies.
				- `edge_default_cfg.js` — Handles the banding on the edges.
				- `old_default_cfg.js` — Recreates the original behavior with the new policy system.
				- `ScenePolicy.js` — Handles turning the config file into a policy.
				- `test_multiband_cfg.js` — A test policy for multiple bands in one config file.
			- `terrains` — Contains various terrains and a terrain switcher
				- `DefaultTerrain.js` — A terrain recreating the prior terrain using the terrain system
				- `SnowTerrain.js` — A snowy terrain with houses, and winter trees
				- `Terrain.md` — Documentation on the terrains interface
				- `terrainSwitcher.js` — A singleton that stores each terrain, and provides methods to switch between them. 
				- `TestTerrain.js` — A test terrain, that flips the grass and the track textures
			- `camera.js` — Handles updating various properties involving the camera.
			- `index.js` — Sets up and updates the A-Frame 3D world.
			- `mainMenuBackground.js` — Sets up the background for the main menu
			- `modelCache.js` — Caches various 3D models so they do not have to be loaded every time. 
		- `units` — Handles various units and unit conversions.
			- `index.js` — Sets up units, and provides references to the currently used unit conversions.
			- `kg.js` — Handles unit conversions for Kilograms - the default weight unit.
			- `km.js` — Handles unit conversions for Kilometers - the default distance unit.
			- `kmh.js` — Handles unit conversions for Kilometers per Hour - the default speed unit.
			- `lb.js` — Handles unit conversions for Pounds.
			- `mi.js` — Handles unit conversions for Miles.
			- `mph.js` — Handles unit conversions for Miles per Hour.
			- `units.md` — Documentation on different units.
			- `W.js` — Handles unit conversions for Watts - the default power unit.
		- `views` — Stores different views, and switching between them.
			- `achievements.js` — Stores the achievements page, and handles getting the achievements to store in it.
			- `cameraPref.js` — Facilitates selecting one of seven camera positions.
			- `changelog.js` — Stores the changelog, and handles setting it up. 
			- `connectToPeers.js` — Stores the peer to peer connection menu, and handles setting it up. 
			- `lobbyBrowser.js` — Stores the lobby browser, and handles setting it up.
			- `lobbyRoom.js` — Stores the lobby rooms page, and handles setting it up for different rooms. 
			- `mainMenu.js` — Stores the main menu, and handles setting it up. 
			- `playerCustomization.js` — Stores the player customization screen, and handles setting it up.
			- `terrainSwitcher.js` — Handles setting up the terrain switcher, and switching between different terrains 
			- `viewManager.js` — Handles switching between different views. 
			- `views.md` — Documentation of how to switch between views, and how views are laid out. 
			- `zlow.js` — Stores the main application, and handles setting it up when workouts are started. 
		- `workouts` — Stores different workouts
			- `RampTestController.js` — Handles a workout involving going up ramps
			- `SprintIntervalController.js` - Handles the sprint interval workout
			- `workouts.md` - Description of the workouts interface
	  	- `avatarCreator.js` — Sets up A-Frame 3D avatar.
		- `avatarMovement.js` — Updates A-Frame 3D avatar.
		- `bluetooth.js` — Handles Bluetooth device connection and data polling.
		- `connectionProtocol.md` — Documentation on the protocol for peer-to-peer connection
		- `constants.js` — Stores important constants for the program execution.
		- `crashReporter.js` — Handles checking for crashes, and reporting them to the backend.
		- `download.js` — Handles downloading TCX files
		- `hud.js` — Renders the heads-up display overlay.
		- `keyboardMode.js` — Handles keyboard mode functionalities and variables.
		- `main.js` — Handles various important functions for the application
		- `milestones.js` — Handles tracking for various milestones.
		- `notifications.js` — Handles displaying notifications on the screen. 
		- `pause_countdown.js` — Handles the countdown when the simulation is paused.
		- `PhysicsEngine.js` - Handles the physics for the simulation
		- `rideFile.js` — Handles creating TCX files. 
		- `rideHistory.js` — Handles storing past ride data.
		- `rideHistoryStore.js` — Creates a singleton rideHistory object for other objects to access. 
		- `simulationstate.js` — Handles tracking the state of the simulation.
		- `standardMode.js` — Handles standard mode functionalities and variables.
		- `strava.js` — Handles Strava OAuth and activity upload.
		- `trainerCalibration.js` — Handles calibrating and connecting the trainer.
		- `workoutChoice.js` — Handles the dropdown menu for choosing workouts
		- `workoutMenu.js` - Handles the menu for workout choice
		- `workoutSession.js` — Handles tracking statistics across a workout
		- `workoutStorage.js` — Handles storing and loading workout data for best/worst
		- `workoutSummary.js` — Handles the workout summary page

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

You can find a live example at https://gioandjake.com/zlow-preview/src/html/mainMenu.html

Zlow is confirmed to work on the following browsers: 
- Google Chrome
- Microsoft Edge
- Safari
- Firefox

# Surviving on your donations
[Donations help keep the server up](https://paypal.me/jsimonson2013) :smile:
