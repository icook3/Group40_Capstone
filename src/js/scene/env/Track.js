/*
  Creates the path the rider travels and circular patterns superimposed on the road.
  Neither the road nor the pattern are added into the array used to update the scene as the rider moves.
*/
import { constants } from "../../constants.js";

export class Track {

  constructor({ sceneEl }) {
    this.sceneEl = sceneEl;

    // Create a-entity for the path and set ID
    const path_element = document.createElement('a-entity');
    path_element.setAttribute('id','track');
    this.path_element = path_element;
    sceneEl.appendChild(path_element);
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
    

    //3.14159, 6.283 -> top half
    //1.57, 0 -> bottom right
    // 4.71, 1.57 -> left side
    // 0 seems to be at the right-hand side, so you need pi/2 through 3pi/2

    // YOU DON'T QUITE HAVE THE EQUATION RIGHT
    track.setAttribute('parametric-curve', `xyzFunctions: -18*cos(t), 2, -18*sin(t); tRange: 4.7, 1.5;`);

    this.path_element.appendChild(track);
    
    return track.getAttribute("configuration");
  }

  test(x, z) {
    const test = document.createElement('a-entity');
    test.setAttribute('id', 'test_thing');
    test.setAttribute('geometry',`primitive: sphere; radius: 2`);
    // TRUE/FALSE SHOULD BE DONE IN THE FOLLOWING ENTITY
    test.setAttribute("curve-follow", 'curveData: #curve; type: parametric-curve; loop: false; enabled: false');
    //test.setAttribute('position', `${x} ${constants.pathHeight} ${z}`);
    //test.setAttribute('rotation', '-90 0 0');
    this.sceneEl.appendChild(test);

    // Shows the path but does not move with the scene; curve-follow is stuck to the track element
    const showPath = document.createElement('a-entity');
    showPath.setAttribute('tube-geometry', 'curveData: #curve; type: parametric-curve; tubeSegments: 200; radius: 0.02; tubeColor: yellow;')
    // UNCLEAR IF YOU NEED TO SET THE PATH POSITION IN ADDITION TO THE PARAMETRIC CURVE?
    showPath.setAttribute('position', `-2 ${constants.pathHeight} -30`);
    //this.sceneEl.appendChild(showPath);
  }
}