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
- `index.html` — Main entry point, loads A-Frame scene and UI.
- `js/bluetooth.js` — Handles Bluetooth device connection and data polling.
- `js/scene.js` — Sets up and updates the A-Frame 3D world.
- `js/hud.js` — Renders the heads-up display overlay.
- `js/strava.js` — Handles Strava OAuth and activity upload.
- `js/main.js` — App entry, state management, and module coordination.

## Stretch Goals
- Local/cloud session storage
- Terrain/route selection
- Support for additional Bluetooth fitness devices

---

## Quick Start
1. Open `index.html` in a modern browser (Chrome/Edge recommended).
2. Click "Connect Trainer" to pair with your smart trainer.
3. Start pedaling to see your avatar move and HUD update.
4. After your ride, export to Strava.

---

## Development Notes
- Modular ES6 code, no build step required.
- See each JS file for further documentation.

You can find a live example at https://gioandjake.com/zlow (recommend to use Chrome)

# Surviving on your donations
[Donations help keep the server up](https://paypal.me/jsimonson2013) :smile:
