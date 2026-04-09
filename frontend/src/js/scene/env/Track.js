/*
  Creates the path the rider travels and circular patterns superimposed on the road.
  Neither the road nor the pattern are added into the array used to update the scene as the rider moves.
*/
import * as THREE from "three";
import {Tween} from 'https://unpkg.com/@tweenjs/tween.js@23.1.3/dist/tween.esm.js'
import { constants } from "../../constants.js";
import {getSign} from '../core/util.js';
import  {activatePacer} from '../../main.js'

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

    this.update_rider_animation = this.update_rider_animation.bind(this);
    this.update_pacer_animation = update_pacer_animation.bind(this);

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
    if (this._initTimer) clearTimeout(this._initTimer);

    this.path_element.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
            obj.material.dispose();
        }
      }
    });

      this.path_element.parent?.remove(this.path_element);
  }

  // Initialize rider animation attribute using a very short section of track to avoid division by zero
  // Pacer starts when rider starts. Delay ensures pacer finishes loading
  initialize_animation() {
    const rider = this._getRider();
    const pacer = this._getPacer();

    if (!rider || !pacer) {
      // Retry if avatars haven't loaded yet
      setTimeout(() => this.initialize_animation(), 1000);
      return;
    }

    this.update_rider_animation();
    update_pacer_animation(this.scene);
    activatePacer();
  }

  // Update animation speed and target based on current track piece
  update_rider_animation() {
    if (constants.riderState.speed === 0) {
      setTimeout(() => this.update_rider_animation(), 500);
      return;
    }

    const avatar = this._getRider();
    if (!avatar) return;

    const BUFFER_POINTS = 10;
    if (constants.currentTrackPiece + BUFFER_POINTS >= constants.trackPoints.length) {
      spawn_track(this);
    }

    // Guard against out-of-range and undefined track points
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

    // Increment current track piece, define start- and endpoints, and calculate rider's duration
    constants.currentTrackPiece += 1;
    let coords = { x: -0.5, y: 0, z: 0 };
    
    if (constants.currentTrackPiece > 0) {
      const prev = constants.trackPoints[constants.currentTrackPiece - 1];
      coords = { x: prev.x - 0.5, y: prev.y, z: prev.z };
    }

    const next = constants.trackPoints[constants.currentTrackPiece];
    if (!next) return;

    const endpoint = { x: next.x - 0.5, y: next.y, z: next.z };
    const riderDuration = Math.round((next.length / constants.riderState.speed) * 1500);

    // If the rider tween has not been initialized, create it
    if (!constants.riderTween){
      const animateRider = new Tween(coords, false).to(endpoint, riderDuration).onUpdate(() => {
          avatar.position.set(coords.x, coords.y, coords.z);

          // Manage camera
          const rig = this._getCamera();
          if (rig) {
              rig.position.set(
                  avatar.position.x,
                  avatar.position.y + 4,
                  avatar.position.z + 8
              );
          }
          })
          .onComplete(() => {
            this.update_rider_animation();
          }).start();
          
          // Store as a constant to allow for reuse
          constants.riderTween = animateRider;
          constants.riderStart = Date.now();
        }
        
    // If the tween does exist, update it
    else {
      constants.riderTween.stop();
      constants.riderTween.to(endpoint, riderDuration).start();
      constants.riderStart = Date.now();
    }

    // Helper function animating using time
    function animate(time) {
      constants.riderTween.update(time);
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    if (avatar.position.z < constants.trackPoints[constants.trackPoints.length - 1].z + 200) {
      spawn_track(this);
    }
}

  // Helper to find rider and camera in the scene
  _getRider() {
    return this.scene.getObjectByName("rider");
  }

  _getCamera() {
    // Look for the rig first, fall back to any camera
    return this.scene.getObjectByName("rig");
  }

  _getPacer() {
    return this.scene.getObjectByName("pacer-entity");
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
    } else if (random % 15 === 0 && !getSign()) {
      straightPiece(trackSystem);
      curve_180_left(trackSystem);
      straightPiece(trackSystem);
    } else {
      straightPiece(trackSystem);
      straightPiece(trackSystem);
      straightPiece(trackSystem);
      }
    }

  // Shorten track element array every time it exceeds 200 elements
  let track_elements = trackSystem.path_element.children;
  if (track_elements.length > 200) {
    const riderObj = trackSystem.scene.getObjectByName("rider");
    const riderZ = riderObj?.position.z ?? 0;
    let removed = 0;
    while (track_elements.length > 100 && removed < 100) {
      const obj = track_elements[0];
      // Only remove pieces that are behind the rider
      if (obj.position.z > riderZ + 20) {
        obj.parent.remove(obj);
        removed++;
      } else {
        break; // stop if we've reached pieces the rider hasn't passed
      }
    }
  }
}

export function update_pacer_animation(scene, update=false, bridge=false) {
  if ((constants.pacerState.speed || 0) === 0) {
    setTimeout(() => update_pacer_animation(scene, update, bridge), 500);
    return;
  }
  const pacer = scene.getObjectByName("pacer-entity");
  if (!pacer) return;

  const BUFFER_POINTS = 10;
  if (constants.pacerCurrentTrackPiece + BUFFER_POINTS >= constants.trackPoints.length) {
    spawn_track(this);
  }

  const tp = constants.trackPoints[constants.pacerCurrentTrackPiece];
  if (!tp) {
    console.warn("[Track] Missing pacer track point:", constants.pacerCurrentTrackPiece);
    return;
  }

  // Get pacer and pacer speed and determine next endpoint
  const pacerSpeed = constants.pacerState.speed || 0;
  if (pacerSpeed <= 0) return;
  // Increment track piece if not syncing players
  if (!update) {
    constants.pacerCurrentTrackPiece += 1;
  }

  let coords = { x: pacer.position.x, y: pacer.position.y, z: pacer.position.z };
  const endpoint = { x: tp.x + 0.5, y: tp.y, z: tp.z };
  let pacerDuration = Math.round((tp.length / pacerSpeed) * 1500);

  // If pacer was synced immediately prior to this loop, calculate remaining duration
  if (bridge) {
    pacerDuration = Math.round((tp.length / pacerSpeed) * 1500) * (1-((Date.now() - constants.riderStart)/constants.riderTween._duration))
  }

  // If the tween governing the pacer doesn't exist, create it and store in constants
  if (!constants.pacerTween) {
    const animatePacer = new Tween(coords, false).to(endpoint, pacerDuration).onUpdate(() => {
      pacer.position.set(coords.x, coords.y, coords.z);
  }).onComplete(() => {
    update_pacer_animation(scene);
  }).start();

  constants.pacerTween = animatePacer;
  }

  // If syncing pacer/players, move pacer to the rider's position using tween and trigger bridge animation
  else if (update) {
    const rider = scene.getObjectByName("rider");
    constants.pacerTween.stop();
    constants.pacerTween.to({ x: rider.position.x + 1, y: rider.position.y, z: rider.position.z }, 1).onComplete(() => {
      update_pacer_animation(scene, false, true);
    }).start();
  }

  // If the tween does exist, update it and check to see if more track is needed
  else {
      constants.pacerTween.stop();
      constants.pacerTween.to(endpoint, pacerDuration).onComplete(() => {
        update_pacer_animation(scene);
      }).start();

      if (pacer.position.z < constants.trackPoints[constants.trackPoints.length - 1].z + 200) {
        spawn_track(this);
      }
    }

  // Helper function to animate pacer
  function animate(time) {
    constants.pacerTween.update(time);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}