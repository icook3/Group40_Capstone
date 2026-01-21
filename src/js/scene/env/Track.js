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
    this.assets = document.getElementById('scene_assets');
    this.rider = document.getElementById('rider');
    this.pacer = document.getElementById('pacer');

    // Spawn track pieces
    constants.trackPoints.push({x: 25, y: 2, z: -50, length: 30});
    constants.trackPoints.push({x: 10, y: 2, z: -100, length: 30});

    // As each animation completes, start the next one
    this.rider.addEventListener('animationcomplete', this.update_animation);
    this.initialize_animation();

  }

  // IDEA - HAVE THE AVATAR CLASS CALCULATE THE DURATION BEFORE IT EMITS THE EVENT TO PREVENT DIVISION BY 0
  update_animation() {
    constants.currentTrackPiece += 1;
    let avatar = document.getElementById('rider')

    let duration;

    if (constants.riderState.speed > 0) {
      duration = (30/constants.riderState.speed) * 1000;
    }

    else {
      duration = 10000
    }

    avatar.setAttribute("animation", `property: position; to: ${constants.trackPoints[constants.currentTrackPiece].x} ${constants.trackPoints[constants.currentTrackPiece].y} ${constants.trackPoints[constants.currentTrackPiece].z}; dur: ${duration}; easing: linear; loop: false; startEvents: riderStarted; pauseEvents: riderStopped; resumeEvents: riderResumed;`);
  
  }

  // Create an animation timeline and make events for the various track points
  initialize_animation() {


    // Initialize rider animation attribute
    this.rider.setAttribute("animation", `property: position; to: ${constants.trackPoints[0].x} ${constants.trackPoints[0].y} ${constants.trackPoints[0].z}; dur: 8000; delay: 5000; easing: linear; loop: false; startEvents: riderStarted; pauseEvents: riderStopped; resumeEvents: riderResumed;`);
    //this.rider.setAttribute("animation", "property: position; to: 25 2 -50; dur: 8000; easing: linear; loop: false");
    //this.rider.setAttribute("animationcomplete", "completiontest");





    // ADD SOMETHING TO RESPAWN AT THE END OF THE LAST POINT
    // PUT IN THE ADVANCE LOGIC







  }

  // Create and append track straight track piece
  straightPiece(spawnZ) {
    const track = document.createElement('a-entity');
    track.setAttribute('geometry',`primitive: box; width: ${constants.pathWidth}; height: ${constants.pathHeight}; depth: ${constants.pathDepth}`);
    track.setAttribute('material', `src: #track-texture; repeat: 1 7.5`);
    track.setAttribute('configuration', `straight_vertical`);
    track.setAttribute('position', `${constants.pathPositionX} ${constants.pathPositionY} ${spawnZ}`);
    this.path_element.appendChild(track);
    return track.getAttribute("configuration");
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

  // Helper function to calculate duration
  calculate_duration(speed, distance) {
    return distance/speed;
  }

}