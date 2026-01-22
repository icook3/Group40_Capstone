/*
  Creates the path the rider travels and circular patterns superimposed on the road.
  Neither the road nor the pattern are added into the array used to update the scene as the rider moves.
*/
import { constants } from "../../constants.js";

export class Track {

  constructor({ sceneEl }) {
    this.sceneEl = sceneEl;

    // Create a-entity for the path and set ID
    // Will deprecate when
    const path_element = document.createElement('a-entity');
    path_element.setAttribute('id','track');
    this.path_element = path_element;
    sceneEl.appendChild(path_element);

    // Get entities needed to create the timeline animation
    this.rider = document.getElementById('rider');

    // Spawn track pieces - maybe add some before so it doesn't look so weird
    const track = document.createElement('a-entity');
    track.setAttribute('geometry',`primitive: box; width: ${constants.pathWidth}; height: ${constants.pathHeight}; depth: 15`);
    track.setAttribute('material', `src: #track-texture; repeat: 1 1`);
    track.setAttribute('position', `0 0 4`);
    this.path_element.appendChild(track);

    constants.trackPoints.push({x: 0, y: 2, z: -1, length: 1});
    this.spawn_track();

    // As each animation completes, start the next one
    this.rider.addEventListener('animationcomplete', this.update_animation);
    this.initialize_animation();

  }

  // Update animation speed and target based on current track piece
  update_animation() {

    // Can probably fix lack of restarting bug by removing and adding back the animation property, but is not ideal
    // Alternatively, add a function that will add a "bridge" track piece to finish the stretch the rider paused on
    constants.currentTrackPiece += 1;
    let avatar = document.getElementById('rider')
    let duration = constants.trackPoints[constants.currentTrackPiece].length / (constants.riderState.speed) * 1000;

    //console.log("DURATION CALCULATED AS " + duration);
    //console.log("SPEED CALCULATED AS " + constants.riderState.speed);
    //console.log("LENGTH CALCULATED AS " + constants.trackPoints[constants.currentTrackPiece].length);
    avatar.setAttribute("animation__1", `property: position; to: ${constants.trackPoints[constants.currentTrackPiece].x} ${constants.trackPoints[constants.currentTrackPiece].y} ${constants.trackPoints[constants.currentTrackPiece].z}; dur: ${duration}; easing: linear; loop: false; startEvents: riderStarted; pauseEvents: riderStopped; resumeEvents: riderResumed;`);
  
  }

  // Initialize rider animation attribute using a very short section of track to avoid division by zero
  initialize_animation() {
    this.rider.setAttribute("animation__1", `property: position; to: ${constants.trackPoints[0].x} ${constants.trackPoints[0].y} ${constants.trackPoints[0].z}; dur: 1; delay: 5000; easing: linear; loop: false; startEvents: riderStarted; pauseEvents: riderStopped; resumeEvents: riderResumed;`);
  }

  // Create and append track straight track piece
  straightPiece() {

    // Spawn track pieces in 30 unit increments for now; correct to more like 5 to make coasting less choppy
    let pointZ = -1 * (constants.farthestSpawn + 5);

    // Adjust Z spawn position to correct for centering of the box geometry
    let trackZ = (-1 * constants.farthestSpawn) - constants.pathDepth;

    constants.farthestSpawn += 5;
    constants.trackPoints.push({x: 0, y: 2, z: pointZ, length: 5});

    const track = document.createElement('a-entity');
    track.setAttribute('geometry',`primitive: box; width: ${constants.pathWidth}; height: ${constants.pathHeight}; depth: ${constants.pathDepth}`);
    track.setAttribute('material', `src: #track-texture; repeat: 1 0.25`);
    track.setAttribute('configuration', `straight_vertical`);
    track.setAttribute('position', `${constants.pathPositionX} ${constants.pathPositionY} ${trackZ}`);
    this.path_element.appendChild(track);
    //return track.getAttribute("configuration");
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

  // Spawn track pieces in
  spawn_track() {
    for (let i = 0; i < 80; i++) {
      this.straightPiece();
    }
  }
}