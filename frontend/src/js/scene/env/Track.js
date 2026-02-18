/*
  Creates the path the rider travels and circular patterns superimposed on the road.
  Neither the road nor the pattern are added into the array used to update the scene as the rider moves.
*/
import { constants } from "../../constants.js";
import { getPos, setPos, getSign } from '../core/util.js';
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


    // Get entities needed to create the timeline animation
    this.rider = document.getElementById('rider');
    this.pacer = document.getElementById('pacer-entity');

    // Spawn decorative track behind the rider and pacer and initial track point, then call main spawn function
    const track = document.createElement('a-entity');
    track.setAttribute('geometry',`primitive: box; width: ${constants.pathWidth}; height: ${constants.pathHeight}; depth: 15`);
    track.setAttribute('material', `src: #track-texture; repeat: 1 1`);
    track.setAttribute('position', `0 0 4`);
    this.path_element.appendChild(track);
    constants.trackPoints.push({x: 0, y: 1, z: -1, length: 1});
    spawn_track();

    // As each animation completes, start the next one
    this.update_rider_animation = this.update_rider_animation.bind(this);
    this.rider.addEventListener('animationcomplete__1', this.update_rider_animation);
    this.pacer.addEventListener('animationcomplete__2', this.update_pacer_animation);

  this._initTimer = setTimeout(() => this.initialize_animation(), 5000);
  }

  destroy() {
  // 1) Remove event listener we added
  if (this.rider && this.update_rider_animation) {
    this.rider.removeEventListener("animationcomplete__1", this.update_rider_animation);
  }
  if (this.pacer && this.update_pacer_animation) {
    this.pacer.removeEventListener("animationcomplete__2", this.update_pacer_animation);
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
  const avatar = document.getElementById('rider');

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

  // Calculate rider's duration and set attributes
  // Remove animation element and reset it to ensure that it runs instead of blocking the animation execution chain
  const riderDuration = Math.round((tp.length / constants.riderState.speed) * 1500);

  avatar.removeAttribute("animation__1");
  avatar.setAttribute(
    "animation__1",
    `property: position; to: ${tp.x} ${tp.y} ${tp.z}; dur: ${riderDuration}; easing: linear; loop: false; startEvents: riderStarted; pauseEvents: riderStopped; resumeEvents: riderResumed;`
  );

  // If rider is within 200 units of the end, spawn some more track pieces
  // (this can stay as-is; it’s your "keep ahead" logic)
  if (getPos(avatar).z < constants.trackPoints[constants.trackPoints.length - 1].z + 200) {
    spawn_track();
  }
}

update_pacer_animation() {
  constants.pacerCurrentTrackPiece += 1;
  const pacer = document.getElementById('pacer-entity');

  // ✅ guard: if rider/pacer aren't there, bail (prevents util.js crash)
  if (!pacer) return; 

  // ---- NEW: ensure we have enough track points before reading the next one ----
  // If we're close to the end of the array, spawn more now (before indexing).
  const BUFFER_POINTS = 10; // small buffer; raise if you still hit edge cases
  if (constants.pacerCurrentTrackPiece + BUFFER_POINTS >= constants.trackPoints.length) {
    spawn_track();
  }

  // ---- NEW: guard against out-of-range / undefined ----
  const tp = constants.trackPoints[constants.pacerCurrentTrackPiece];
  if (!tp) {
    console.warn(
      "[Track] Missing track point:",
      constants.pacerCurrentTrackPiece,
      "trackPoints length:",
      constants.trackPoints.length
    );
    return;
  }

  // Calculate pacer's duration and set attributes
  // Remove animation element and reset it to ensure that it runs instead of blocking the animation execution chain
  const pacerSpeed = Number(document.getElementById('pacer-speed').value) || 0;
  const pacerDuration = Math.round((tp.length / pacerSpeed) * 1500);
  

  pacer.removeAttribute("animation__2");
  pacer.setAttribute(
    "animation__2",
    `property: position; to: ${tp.x} ${tp.y} ${tp.z}; dur: ${pacerDuration}; easing: linear; loop: false; autoplay: true;`
  );



  // If rider is within 200 units of the end, spawn some more track pieces
  // (this can stay as-is; it’s your "keep ahead" logic)
  if (getPos(pacer).z < constants.trackPoints[constants.trackPoints.length - 1].z + 200) {
    spawn_track();
  }
}

  // Initialize rider animation attribute using a very short section of track to avoid division by zero
  // Pacer starts when rider starts. Delay ensures pacer finishes loading
  initialize_animation() {
    this.waitForElement('#pacer-entity', (element) => {
      this.rider.addEventListener('animationcomplete__1', this.update_rider_animation);
      document.getElementById("pacer-entity").addEventListener('animationcomplete__2', this.update_pacer_animation);
      this.rider.setAttribute("animation__1", `property: position; to: ${constants.trackPoints[0].x} ${constants.trackPoints[0].y} ${constants.trackPoints[0].z}; dur: 1; delay: 5000; easing: linear; loop: false; startEvents: riderStarted; pauseEvents: riderStopped; resumeEvents: riderResumed;`);
      document.getElementById("pacer-entity").setAttribute("animation__2", `property: position; to: ${constants.trackPoints[0].x + 0.5} ${constants.trackPoints[0].y} ${constants.trackPoints[0].z}; dur: 1; easing: linear; loop: false; autoplay:true;`);
      activatePacer();
      
    });
  }

  // Helper function to check for an element's existance
  waitForElement(selector, callback) {
    const observer = new MutationObserver((mutations, observer) => {
        const element = document.querySelector(selector);
        if (element) {
            observer.disconnect();
            callback(element);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
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

  // Create and append a track piece curving to the right
  function curve_180_right() {
    let path_element = document.getElementById('track');
    const track = document.createElement('a-entity');
    let pointZ = -1 * (constants.farthestSpawn);

    // Add necessary points based on current farthest spawn
    constants.trackPoints.push({x: 15, y: 1, z: pointZ-7, length: 16.55});
    constants.trackPoints.push({x: 23, y: 1, z: pointZ-15, length: 11.31});
    constants.trackPoints.push({x: 25, y: 1, z: pointZ-24, length: 9.22});
    constants.trackPoints.push({x: 27, y: 1, z: pointZ-33, length: 9.22});
    constants.trackPoints.push({x: 21, y: 1, z: pointZ-48, length: 16.16});
    constants.trackPoints.push({x: 15, y: 1, z: pointZ-55, length: 9.22});
    constants.trackPoints.push({x: 7, y: 1, z: pointZ-58, length: 8.54});
    constants.trackPoints.push({x: 0, y: 1, z: pointZ-61, length: 7.61});

    // Update farthestSpan
    constants.farthestSpawn += 62;

    // Add graphical track representation
    track.setAttribute('id', 'curve')
    track.setAttribute('geometry',`primitive: ring; radiusInner: 25; radiusOuter: 35; thetaLength: 180; thetaStart: 270`);
    track.setAttribute('material', `src: #track-texture; repeat: 7.5 7.5`);
    track.setAttribute('configuration', `curve_right_180`);

    // Subract an additional 30 to compensate for centering mismatches
    track.setAttribute('position', `-3.5 ${constants.pathHeight} ${pointZ-30}`);
    track.setAttribute('rotation', '-90 0 0');
    path_element.appendChild(track);
  }

  // Create and append a track piece curving to the left
  function curve_180_left() {
    let path_element = document.getElementById('track');
    const track = document.createElement('a-entity');
    let pointZ = -1 * (constants.farthestSpawn);

    // Add necessary points based on current farthest spawn
    constants.trackPoints.push({x: -15, y: 1, z: pointZ-7, length: 16.55});
    constants.trackPoints.push({x: -23, y: 1, z: pointZ-15, length: 11.31});
    constants.trackPoints.push({x: -25, y: 1, z: pointZ-24, length: 9.22});
    constants.trackPoints.push({x: -27, y: 1, z: pointZ-33, length: 9.22});
    constants.trackPoints.push({x: -21, y: 1, z: pointZ-48, length: 16.16});
    constants.trackPoints.push({x: -15, y: 1, z: pointZ-55, length: 9.22});
    constants.trackPoints.push({x: -7, y: 1, z: pointZ-58, length: 8.54});
    constants.trackPoints.push({x: 0, y: 1, z: pointZ-61, length: 7.62});

    // Update farthestSpan
    constants.farthestSpawn += 62;

    // Add graphical track representation
    track.setAttribute('id', 'curve')
    track.setAttribute('geometry',`primitive: ring; radiusInner: 25; radiusOuter: 35; thetaLength: 180; thetaStart: 90`);
    track.setAttribute('material', `src: #track-texture; repeat: 7.5 7.5`);
    track.setAttribute('configuration', `curve_right_180`);

    // Subract an additional 30 to compensate for centering mismatches
    track.setAttribute('position', `3.5 ${constants.pathHeight} ${pointZ-30}`);
    track.setAttribute('rotation', '-90 0 0');
    path_element.appendChild(track);
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
  el.setAttribute("position", `${constants.pathPositionX} ${constants.pathPositionY} ${pointZ}`);
  constants.farthestSpawn += 5;
  constants.trackPoints.push({x: 0, y: 1, z: pointZ, length: 5})
}

  // Spawn track pieces in
  export function spawn_track() {
  // make sure pool exists
  initStraightPool();

  // spawn a smaller batch; you're just repositioning now, so this is cheap
  for (let i = 0; i < 80; i++) {

    let random = Math.floor(Math.random() * (30 - 1 + 1)) + 1;

    if (random % 15 == 0) {
      straightPiece();

      if (getSign()) {
        curve_180_left();
      }

      else {
        curve_180_right();
      }
      straightPiece();

    }
    else {
        straightPiece();
    }
  }

  // Shorten track element array every time it exceeds 200 elements
  let track_elements = document.getElementById('track').children;
  if (track_elements.length > 200) {
    for (let i = 0; i < 100; i++) {
      if (track_elements[0].getAttribute('position').z > getPos(document.getElementById('rider')).z + 20) {
        track_elements[0].parentNode.removeChild(track_elements[0]);
      }
    }
  }
}