/*
  Creates the path the rider travels and circular patterns superimposed on the road.
  Neither the road nor the pattern are added into the array used to update the scene as the rider moves.
*/
import { constants } from "../../constants.js";

export class Track {

  // parseFloat(getElement("distance").textContent) <- HOPEFULLY WORKS TO GET TOTAL DISTANCE TRAVELED
  
  constructor({ sceneEl }) {
    this.sceneEl = sceneEl;

    // Create a-entity for the path and set ID
    const path_element = document.createElement('a-entity');
    path_element.setAttribute('id','dirt-pattern');

    // Create and append track
    const track = document.createElement('a-entity');
    //track.setAttribute('geometry',`primitive: box; width: ${constants.pathWidth}; height: ${constants.pathHeight}; depth: ${constants.pathDepth}`);
    //track.setAttribute('material', `src: #track-texture; repeat: 1 1250`);
    //track.setAttribute('position', `${constants.pathPositionX} ${constants.pathPositionY} ${constants.pathPositionZ}`);
    //path_element.appendChild(track);

    // Add circular patterns to path_element
  }
}
