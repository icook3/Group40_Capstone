/*
  Creates the path the rider travels and circular patterns superimposed on the road.
  Neither the road nor the pattern are added into the array used to update the scene as the rider moves.
*/
import * as THREE from "three";
import { constants } from "../../constants.js";
import {getPos, getSign} from '../core/util.js';
import  {activatePacer } from '../../main.js'

export class Track {
  constructor({ scene }) {
    // ---- SINGLETON GUARD / CLEANUP PREVIOUS INSTANCE ----
    if (window.__zlowTrackInstance) {
      window.__zlowTrackInstance.destroy?.();
    }
    window.__zlowTrackInstance = this;
    this.scene = scene;

    let path_element = scene.getObjectByName("track");
    this._ownsPath = !path_element;

    if (!path_element) {
      path_element = new THREE.Group();
      path_element.name = "track";
      scene.add(path_element);
    }
    this.path_element = path_element;

    this.trackTexture = new THREE.TextureLoader().load("../../resources/textures/Track.jpeg");

    // Get entities needed to create the timeline animation
    this.rider = document.getElementById('rider');
    this.pacer = document.getElementById('pacer-entity');
    this.update_rider_animation = this.update_rider_animation.bind(this);
    this.update_pacer_animation = this.update_pacer_animation.bind(this);

    const geometry = new THREE.BoxGeometry(
      constants.pathWidth,
      constants.pathHeight,
        15
    );

    const material = new THREE.MeshStandardMaterial({
      map: this.trackTexture
    });

    const track = new THREE.Mesh(geometry, material);
    track.position.set(0, 0, 4);
    this.path_element.add(track);
    constants.trackPoints.push({ x: 0, y: 1, z: -1, length: 1 });

    spawn_track(this);

    this._initTimer = setTimeout(() => this.initialize_animation(), 5000);
  }

  destroy() {
    this.path_element.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();

      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    });

    this.path_element.parent?.remove(this.path_element);
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
    spawn_track(this);
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
    spawn_track(this);
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
    spawn_track(this);
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
  pacer.setAttribute("animation__2", `property: position; to: ${tp.x} ${tp.y} ${tp.z}; dur: ${pacerDuration}; easing: linear; loop: false; autoplay: true;`);

  // If rider is within 200 units of the end, spawn some more track pieces
  // (this can stay as-is; it’s your "keep ahead" logic)
  if (getPos(pacer).z < constants.trackPoints[constants.trackPoints.length - 1].z + 200) {
    spawn_track(this);
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

  // Create and append a track piece curving to the right
  function curve_180_right(trackSystem) {
    const path_element = trackSystem.path_element;
    const pointZ = -1 * (constants.farthestSpawn);

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
    const geometry = new THREE.RingGeometry(
      25,
      35,
      32,
      1,
      THREE.MathUtils.degToRad(270),
      THREE.MathUtils.degToRad(180)
    );

    const material = new THREE.MeshStandardMaterial({
      map: trackSystem.trackTexture,
      side: THREE.DoubleSide
    });

    const track = new THREE.Mesh(geometry, material);
    track.position.set(-3.5, constants.pathHeight, pointZ-30);
    track.rotation.x = -Math.PI/2;

    path_element.add(track);
  }

  // Create and append a track piece curving to the left
  function curve_180_left(trackSystem) {
    const path_element = trackSystem.path_element;
    const pointZ = -1 * (constants.farthestSpawn);

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
    const geometry = new THREE.RingGeometry(
      25,
      35,
      32,
      1,
      THREE.MathUtils.degToRad(90),
      THREE.MathUtils.degToRad(180)
    );

      const material = new THREE.MeshStandardMaterial({
          map: trackSystem.trackTexture,
          side: THREE.DoubleSide
      });

      const track = new THREE.Mesh(geometry, material);
      track.position.set(3.5, constants.pathHeight, pointZ-30);
      track.rotation.x = -Math.PI/2;

      path_element.add(track);
  }

function straightPiece(trackSystem) {
  const path_element = trackSystem.path_element;
  const pointZ = -1 * (constants.farthestSpawn + 5);
  const trackZ = (-1 * constants.farthestSpawn) - constants.pathDepth;
  constants.farthestSpawn += 5;
  constants.trackPoints.push({ x: 0, y: 1, z: pointZ, length: 5 });

  const geometry = new THREE.BoxGeometry(
    constants.pathWidth,
    constants.pathHeight,
    constants.pathDepth
  );

  const material = new THREE.MeshStandardMaterial({
    map: trackSystem.trackTexture
  });

  const track = new THREE.Mesh(geometry, material);

   track.position.set(
     constants.pathPositionX,
     constants.pathPositionY,
     trackZ
   );

   path_element.add(track);
}

  // Spawn track pieces in
  export function spawn_track(trackSystem) {
    for (let i = 0; i < 80; i++) {
      // Spawn straight pieces in sets of three and more often than curved pieces
      let random = Math.floor(Math.random() * (15 - 1 + 1)) + 1;

      if (random % 15 === 0 && getSign()) {
        straightPiece(trackSystem);
        curve_180_right(trackSystem);
        straightPiece(trackSystem);
      }
      else if (random % 15 === 0 && !getSign()) {
        straightPiece(trackSystem);
        curve_180_left(trackSystem);
        straightPiece(trackSystem);
      }

      else {
        straightPiece(trackSystem);
        straightPiece(trackSystem);
        straightPiece(trackSystem);
      }
    }

    // Shorten track element array every time it exceeds 200 elements
    let track_elements = trackSystem.path_element.children;
    if (track_elements.length > 200) {
      for (let i = 0; i < 100; i++) {
        const obj = track_elements[0];
        if (obj?.parent) {
          obj.parent.remove(obj);
        }
      }
    }
  }