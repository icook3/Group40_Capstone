/*
  Creates the path the rider travels and circular patterns superimposed on the road.
  Neither the road nor the pattern are added into the array used to update the scene as the rider moves.
*/
import {Tween, Easing} from 'https://unpkg.com/@tweenjs/tween.js@23.1.3/dist/tween.esm.js'
import { constants } from "../../constants.js";
import { getPos, setPos } from '../core/util.js';
import  {activatePacer } from '../../main.js'

export class Track {

  constructor({ sceneEl }) {
    // ---- SINGLETON GUARD / CLEANUP PREVIOUS INSTANCE ----
    if (window.__zlowTrackInstance) {
      window.__zlowTrackInstance.destroy?.();
    }
    window.__zlowTrackInstance = this;
    this.sceneEl = sceneEl;

    // Create a-entity for the path and set ID
    let path_element = document.getElementById('track');
    this._ownsPath = !path_element;

    if (!path_element) {
      path_element = document.createElement('a-entity');
      path_element.setAttribute('id','track');
      sceneEl.appendChild(path_element);
    }
    this.path_element = path_element;

    // Spawn decorative track behind the rider and pacer and initial track point, then call main spawn function
    const track = document.createElement('a-entity');
    track.setAttribute('geometry',`primitive: box; width: ${constants.pathWidth}; height: ${constants.pathHeight}; depth: 15`);
    track.setAttribute('material', `src: #track-texture; repeat: 1 1`);
    track.setAttribute('position', `0 0 4`);
    this.path_element.appendChild(track);
    constants.trackPoints.push({x: 0, y: 1, z: -1, length: 1});
    spawn_track();
    

  this._initTimer = setTimeout(() => this.update_rider_animation(), 5000);
  }

  destroy() {
  // 1) Remove event listener we added
  if (this.rider && this.update_rider_animation) {
    this.rider.removeEventListener("animationcomplete__1", this.update_rider_animation);
  }

  // 2) Clear the delayed init timer
  if (this._initTimer) {
    clearTimeout(this._initTimer);
    this._initTimer = null;
  }

  // 3) If you want to fully remove the track entity from DOM, do it here.
  //    Only do this if THIS instance owns it; otherwise you might break others.
  //    (See “ownsPath” note below.)
  if (this._ownsPath && this.path_element) {
    disposeAFrameEl(this.path_element);
    this.path_element.parentNode?.removeChild(this.path_element);
  }

  // 4) Clear singleton pointer if it's us
  if (window.__zlowTrackInstance === this) {
    window.__zlowTrackInstance = null;
  }

  straightPool = [];
  straightPoolIndex = 0;
  poolReady = false;
}


// Update animation speed and target based on current track piece
update_rider_animation() {
  constants.currentTrackPiece += 1;

  // Works to  find avatar
  const avatar = document.getElementById("scene").object3D.getObjectByName('rider');

  // ✅ guard: if rider/pacer aren't there, bail (prevents util.js crash)
  if (!avatar) return; 

  // ---- NEW: ensure we have enough track points before reading the next one ----
  // If we're close to the end of the array, spawn more now (before indexing).
  const BUFFER_POINTS = 10; // small buffer; raise if you still hit edge cases
  if (constants.currentTrackPiece + BUFFER_POINTS >= constants.trackPoints.length) {
    spawn_track();
  }

  // ---- NEW: guard against out-of-range / undefined ----
  const tp = constants.trackPoints[constants.currentTrackPiece];
  if (!tp) {
    console.warn(
      "[Track] Missing track point:",
      constants.currentTrackPiece,
      "trackPoints length:",
      constants.trackPoints.length
    );
    return;
  }

  //ADD TWEEN
  let coords = {x: 0, y: 0, z: 0};
  let endpoint = {x: tp.x, y: tp.y, z: -20}
  console.log(endpoint)
  

  const animateRider = new Tween(coords, false) // Create a new tween that modifies 'coords'.
		.to(endpoint, 1000) // Move to (300, 200) in 1 second.
		.onUpdate(() => {
			// Called after tween.js updates 'coords'.
			// Move 'box' to the position described by 'coords' with a CSS translation.
      avatar.position.set(coords.x, coords.y, coords.z)
			console.log("DID SOMETHING")
		})
		.start() // Start the tween immediately.

    function animate(time) {
		animateRider.update(time)
		requestAnimationFrame(animate)
	}

	requestAnimationFrame(animate)


    const riderDuration = Math.round((tp.length / constants.riderState.speed) * 1500);
    const pacerSpeed = Number(document.getElementById('pacer-speed').value) || 0;





  // If rider is within 200 units of the end, spawn some more track pieces
  // (this can stay as-is; it’s your "keep ahead" logic)
  //if (getPos(avatar).z < constants.trackPoints[constants.trackPoints.length - 1].z + 200) {
    //spawn_track();
  //}
}




  // Create an append a track piece curving to the right
  curve_180_right(spawnZ) {
    const track = document.createElement('a-entity');
    track.setAttribute('id', 'curve')
    track.setAttribute('geometry',`primitive: ring; radiusInner: 25; radiusOuter: 35; thetaLength: 180; thetaStart: 270`);
    track.setAttribute('material', `src: #track-texture; repeat: 7.5 7.5`);
    track.setAttribute('configuration', `curve_right_180`);
    track.setAttribute('position', `-3.5 ${constants.pathHeight} ${spawnZ}`);
    track.setAttribute('rotation', '-90 0 0');
    track.setAttribute('parametric-curve', `xyzFunctions: -18*cos(t), 2, -18*sin(t); tRange: 4.7, 1.5;`);
    this.path_element.appendChild(track);
    return track.getAttribute("configuration");
  }
}

function disposeAFrameEl(el) {
  if (!el) return;

  // A-Frame keeps the THREE object tree at el.object3D
  const root = el.object3D;
  if (!root) return;

  root.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose?.();

    if (obj.material) {
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (const m of mats) {
        // dispose common texture slots
        m.map?.dispose?.();
        m.normalMap?.dispose?.();
        m.roughnessMap?.dispose?.();
        m.metalnessMap?.dispose?.();
        m.aoMap?.dispose?.();
        m.emissiveMap?.dispose?.();
        m.dispose?.();
      }
    }
  });
}

const STRAIGHT_POOL_SIZE = 220;   // keep > 200 since you cap children at 200
let straightPool = [];
let straightPoolIndex = 0;
let poolReady = false;

function initStraightPool() {
  if (poolReady) return;
  const pathEl = document.getElementById("track");
  if (!pathEl) return;

  for (let i = 0; i < STRAIGHT_POOL_SIZE; i++) {
    const track = document.createElement("a-entity");
    track.setAttribute(
      "geometry",
      `primitive: box; width: ${constants.pathWidth}; height: ${constants.pathHeight}; depth: ${constants.pathDepth}`
    );
    track.setAttribute("material", `src: #track-texture; repeat: 1 0.25`);
    track.setAttribute("configuration", `straight_vertical`);

    // put them somewhere harmless initially
    track.setAttribute("position", `0 -9999 0`);

    pathEl.appendChild(track);
    straightPool.push(track);
  }

  poolReady = true;
}


function straightPiece() {
  initStraightPool();

  // Spawn track pieces in 5 unit increments
  const pointZ = -1 * (constants.farthestSpawn + 5);

  // Adjust Z spawn position to correct for centering of the box geometry
  const trackZ = (-1 * constants.farthestSpawn) - constants.pathDepth;

  constants.farthestSpawn += 5;
  constants.trackPoints.push({ x: 0, y: 1, z: pointZ, length: 5 });

  // ---- CAP TRACK POINTS (PREVENT HEAP LEAK) ----
  const MAX_TRACK_POINTS = 2000;
  if (constants.trackPoints.length > MAX_TRACK_POINTS) {
    const drop = constants.trackPoints.length - MAX_TRACK_POINTS;
    constants.trackPoints.splice(0, drop);
    constants.currentTrackPiece = Math.max(0, constants.currentTrackPiece - drop);
    constants.pacerCurrentTrackPiece = Math.max(0, constants.pacerCurrentTrackPiece - drop);
  }

  // ---- REUSE ENTITY FROM POOL ----
  const el = straightPool[straightPoolIndex];
  straightPoolIndex = (straightPoolIndex + 1) % straightPool.length;

  // move it to new Z
  el.setAttribute("position", `${constants.pathPositionX} ${constants.pathPositionY} ${trackZ}`);
}


  // Spawn track pieces in
  export function spawn_track() {
  // make sure pool exists
  initStraightPool();

  // spawn a smaller batch; you're just repositioning now, so this is cheap
  for (let i = 0; i < 80; i++) {
    straightPiece();
  }
}