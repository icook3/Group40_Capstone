/*
  Creates the path the rider travels and circular patterns superimposed on the road.
  Neither the road nor the pattern are added into the array used to update the scene as the rider moves.
*/
import { constants } from "../../constants.js";

export class DirtPattern {
  
  constructor({ sceneEl }) {
    this.sceneEl = sceneEl;

    // Create a-entity for the path and set ID
    const path_element = document.createElement('a-entity');
    path_element.setAttribute('id','dirt-pattern');

    // Create and append track
    const track = document.createElement('a-entity');
    track.setAttribute('geometry',`primitive: box; width: ${constants.pathWidth}; height: ${constants.pathHeight}; depth: ${constants.pathDepth}`);
    track.setAttribute('material', `src: #track-texture; repeat: 1 1250`);
    track.setAttribute('position', `${constants.pathPositionX} ${constants.pathPositionY} ${constants.pathPositionZ}`);
    path_element.appendChild(track);

    // Add circular patterns to path_element
    const dirtPattern_dimensions = [
      [0.7, 0.35, -2, 1.53, -10],
      [0.5,0.28,2,1.53,-15],
      [0.6,0.32,0,1.53,-20],
      [0.4,0.25,-1.5,1.53,-25],
      [0.8,0.30,1.5,1.53,-30],
      [0.5,0.22,0.5,1.53,-35],
      [0.6,0.27,-2,1.53,-40],
      [0.7,0.33,2,1.53,-45]
    ]

    for (let i = 0; i < dirtPattern_dimensions.length; i++) {
      const circle = document.createElement('a-entity');
      circle.setAttribute('geometry', `primitive: sphere; radius: ${dirtPattern_dimensions[i][0]}`);
      circle.setAttribute('material', `color: #a0895a; opacity: ${dirtPattern_dimensions[i][1]}`);
      circle.setAttribute('position', `${dirtPattern_dimensions[i][2]} ${dirtPattern_dimensions[i][3]} ${dirtPattern_dimensions[i][4]}`);
      circle.setAttribute('rotation', `-90 0 0`);
      console.log(circle);
      path_element.appendChild(circle);
    }

    // Add the path into the scene
    sceneEl.appendChild(path_element);

    // Assign to pattern variable to facilitate updating scene
    this.patternEl = document.getElementById("dirt-pattern");
  }

  // Returns children of DirtPattern
  getChildren() {
    return this.patternEl ? Array.from(this.patternEl.children) : [];
  }
}
