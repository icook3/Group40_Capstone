/*
  Creates the path the rider travels and circular patterns superimposed on the road.
  Neither the road nor the pattern are added into the array used to update the scene as the rider moves.
*/
import { constants } from "../../constants.js";
import { getPos, setPos } from '../core/util.js';
import  {activatePacer } from '../../main.js'

export class Track {

  constructor({ sceneEl }) {
    this.sceneEl = sceneEl;

    // Create a-entity for the path and set ID
    const path_element = document.createElement('a-entity');
    path_element.setAttribute('id','track');
    this.path_element = path_element;
    sceneEl.appendChild(path_element);

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

    setTimeout(() => this.initialize_animation(), 5000);
  }

  // Update animation speed and target based on current track piece
  update_rider_animation() {
    constants.currentTrackPiece += 1;

    let avatar = document.getElementById('rider');
    let pacer = document.getElementById('pacer-entity');

    // Calculate rider's duration and set attributes
    // Remove animation element and reset it to ensure that it runs instead of blocking the animation execution chain
    let riderDuration = Math.round(constants.trackPoints[constants.currentTrackPiece].length / (constants.riderState.speed) * 1500);
    avatar.removeAttribute("animation__1");
    avatar.setAttribute("animation__1", `property: position; to: ${constants.trackPoints[constants.currentTrackPiece].x} ${constants.trackPoints[constants.currentTrackPiece].y} ${constants.trackPoints[constants.currentTrackPiece].z}; dur: ${riderDuration}; easing: linear; loop: false; startEvents: riderStarted; pauseEvents: riderStopped; resumeEvents: riderResumed;`);

    let pacerSpeed = document.getElementById('pacer-speed').value;
    let pacerEndpoint = -(riderDuration / 1500 * pacerSpeed) + getPos(pacer).z;
    pacer.removeAttribute("animation__1");
    pacer.setAttribute("animation__1", `property: position; to: ${constants.trackPoints[constants.currentTrackPiece].x + 0.5} ${constants.trackPoints[constants.currentTrackPiece].y} ${pacerEndpoint}; dur: ${riderDuration}; easing: linear; loop: false; autoplay:true;`);

    // If rider or pacer is within 40 units of the end, spawn some more track pieces
    if (getPos(avatar).z < constants.trackPoints[constants.trackPoints.length - 1].z + 200) {
      spawn_track();
    }
  }

  // Initialize rider animation attribute using a very short section of track to avoid division by zero
  // Pacer starts when rider starts. Delay ensures pacer finishes loading
  initialize_animation() {
    activatePacer();
    this.rider.setAttribute("animation__1", `property: position; to: ${constants.trackPoints[0].x} ${constants.trackPoints[0].y} ${constants.trackPoints[0].z}; dur: 1; delay: 5000; easing: linear; loop: false; startEvents: riderStarted; pauseEvents: riderStopped; resumeEvents: riderResumed;`);
    this.pacer.setAttribute("animation__1", `property: position; to: ${constants.trackPoints[0].x + 0.5} ${constants.trackPoints[0].y} ${constants.trackPoints[0].z}; dur: 1; easing: linear; loop: false; startEvents: pacerStart;`);
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


// Create and append track straight track piece
  function straightPiece() {
    let path_element = document.getElementById('track');
    // Spawn track pieces in 5 unit increments
    let pointZ = -1 * (constants.farthestSpawn + 5);

    // Adjust Z spawn position to correct for centering of the box geometry
    let trackZ = (-1 * constants.farthestSpawn) - constants.pathDepth;
    constants.farthestSpawn += 5;
    constants.trackPoints.push({x: 0, y: 1, z: pointZ, length: 5});

    // ---- CAP TRACK POINTS (PREVENT HEAP LEAK) ----
    const MAX_TRACK_POINTS = 2000;

    if (constants.trackPoints.length > MAX_TRACK_POINTS) {
      const drop = constants.trackPoints.length - MAX_TRACK_POINTS;

      constants.trackPoints.splice(0, drop);

      constants.currentTrackPiece = Math.max(0, constants.currentTrackPiece - drop);
      constants.pacerCurrentTrackPiece = Math.max(0, constants.pacerCurrentTrackPiece - drop);
    }

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
      straightPiece();
    }

    // Shorten track element array every time it exceeds 200 elements
    let track_elements = document.getElementById('track').children;
    const trackEl = document.getElementById("track");
    const riderZ = getPos(document.getElementById("rider")).z;

    while (trackEl.children.length > 200) {
      const first = trackEl.children[0];
      if (!first) break;

      const firstZ = first.getAttribute("position")?.z ?? 0;

      // only remove if safely behind rider
      if (firstZ > riderZ + 20) {
        disposeAFrameEl(first);
        first.parentNode.removeChild(first);
      } else {
        // If the first element isn't removable yet, stop so we don't spin.
        break;
      }
    }
  }