

export class Track {
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

        //sceneEl.appendChild(path_element);
    
}

// Believe I can use if worldZ % 60 == then advance?

}