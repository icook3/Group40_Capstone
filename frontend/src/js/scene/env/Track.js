/*
  Creates the path the rider travels and circular patterns superimposed on the road.
  Neither the road nor the pattern are added into the array used to update the scene as the rider moves.
*/
import {Tween, Easing} from 'https://unpkg.com/@tweenjs/tween.js@23.1.3/dist/tween.esm.js'
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

    // Spawn decorative track behind the rider and pacer and initial track point, then call main spawn function
    const track = document.createElement('a-entity');
    track.setAttribute('geometry',`primitive: box; width: ${constants.pathWidth}; height: ${constants.pathHeight}; depth: 15`);
    track.setAttribute('material', `src: #track-texture; repeat: 1 1`);
    track.setAttribute('position', `0 0 4`);
    this.path_element.appendChild(track);
    constants.trackPoints.push({x: 0, y: 1, z: -1, length: 1});
    spawn_track();

    // Set camera position when class is initialized
    const avatar = document.getElementById("scene").object3D.getObjectByName('rider');
    let camera = document.getElementById('camera');
    camera.setAttribute('position', `${avatar.position.x} ${avatar.position.y + 4} ${avatar.position.z + 8}`);
    console.log(avatar.position.x)
    console.log()
  this._initTimer = setTimeout(() => this.update_rider_animation(), 5000);
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
}

// Update animation speed and target based on current track piece
update_rider_animation() {

  // Busywait if the rider is not moving
  if (constants.riderState.speed === 0) {
    setTimeout(() => { 
    this.update_rider_animation();
    }, 500);
    return;
  }

  // Find avatar and camera
  // Update camera call when it transitions to three.js
  const avatar = document.getElementById("scene").object3D.getObjectByName('rider');
  let camera = document.getElementById('camera');
  
  // Check for rider to prevent util.js crash and ensure at least 10 track points left
  if (!avatar) return; 

  const BUFFER_POINTS = 10;
  if (constants.currentTrackPiece + BUFFER_POINTS >= constants.trackPoints.length) {
    spawn_track();
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
  
  // Increment current track piece and define starting and ending coordinates
  constants.currentTrackPiece += 1;
  let coords = {x: -0.5, y: 0, z: 0};
  if (constants.currentTrackPiece > 0) {
    coords = { x: constants.trackPoints[constants.currentTrackPiece - 1].x - 0.5, y: constants.trackPoints[constants.currentTrackPiece - 1].y, z: constants.trackPoints[constants.currentTrackPiece - 1].z }
  }
  
  let endpoint = { x: constants.trackPoints[constants.currentTrackPiece].x - 0.5, y: constants.trackPoints[constants.currentTrackPiece].y, z: constants.trackPoints[constants.currentTrackPiece].z };
  let riderDuration = Math.round((constants.trackPoints[constants.currentTrackPiece].length / constants.riderState.speed) * 1500);

  // Animate rider's position over time
  const animateRider = new Tween(coords, false)
		.to(endpoint, riderDuration)
		.onUpdate(() => {
      avatar.position.set(coords.x, coords.y, coords.z)
      
      // Have camera follow the rider's position. Rider starts at 0 0 0; camera at -0.5 6 5
      
      camera.setAttribute('position', `${avatar.position.x} ${avatar.position.y + 4} ${avatar.position.z + 8}`);
    })
    .onComplete(() => {
      // Recall this function as long as the program is in use.
      this.update_rider_animation();
    
    })

    // It is assumed the rider is moving as this function busywaits if speed is 0
		.start()

    // Helper function to move rider
    function animate(time) {
      animateRider.update(time)
      requestAnimationFrame(animate)
	}

	requestAnimationFrame(animate)

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

function straightPiece() {
  let path_element = document.getElementById('track');
    // Spawn track pieces in 5 unit increments
    let pointZ = -1 * (constants.farthestSpawn + 5);

    // Adjust Z spawn position to correct for centering of the box geometry
    let trackZ = (-1 * constants.farthestSpawn) - constants.pathDepth;
    constants.farthestSpawn += 5;
    constants.trackPoints.push({x: 0, y: 1, z: pointZ, length: 5});

    const track = document.createElement('a-entity');
    track.setAttribute('geometry',`primitive: box; width: ${constants.pathWidth}; height: ${constants.pathHeight}; depth: ${constants.pathDepth}`);
    track.setAttribute('material', `src: #track-texture; repeat: 1 0.25`);
    track.setAttribute('configuration', `straight_vertical`);
    track.setAttribute('position', `${constants.pathPositionX} ${constants.pathPositionY} ${trackZ}`);
    path_element.appendChild(track);
}

  // Spawn track pieces in
  export function spawn_track() {
    for (let i = 0; i < 80; i++) {
      // Spawn straight pieces in sets of three and more often than curved pieces
      let random = Math.floor(Math.random() * (15 - 1 + 1)) + 1;

      if (random % 15 == 0 && getSign()) {
        straightPiece();
        curve_180_right();
        straightPiece();
      }
      else if (random % 15 == 0 && !getSign()) {
        straightPiece();
        curve_180_left();
        straightPiece();
      }

      else {
        straightPiece();
        straightPiece();
        straightPiece();
      }
    }

    // Shorten track element array every time it exceeds 200 elements
    let track_elements = document.getElementById('track').children;
    let rider = document.getElementById("scene").object3D.getObjectByName('rider');
    if (track_elements.length > 200) {
      for (let i = 0; i < 100; i++) {
        if (track_elements[0].getAttribute('position').z > rider.position.z + 20) {
          track_elements[0].parentNode.removeChild(track_elements[0]);
        }
      }
    }
  }