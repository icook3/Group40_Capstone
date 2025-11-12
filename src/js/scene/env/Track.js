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

    // Repeat does not work as intended
    track.setAttribute('material', `src: #track-texture; repeat: 1 7.5`);
    track.setAttribute('position', `${constants.pathPositionX} ${constants.pathPositionY} ${spawnZ}`);
    this.path_element.appendChild(track);
  }
}
