/*
  Creates the path the rider travels and circular patterns superimposed on the road.
  Neither the road nor the pattern are added into the array used to update the scene as the rider moves.
*/
import { constants } from "../../constants.js";
import { getPos, setPos } from '../core/util.js';

export class Track {

  constructor({ sceneEl }) {
    this.sceneEl = sceneEl;

    // Create a-entity for the path and set ID
    // MAY NOT NEED THIS ANYMORE
    const path_element = document.createElement('a-entity');
    path_element.setAttribute('id','track');
    this.path_element = path_element;
    sceneEl.appendChild(path_element);


    // Get rider and pacer entities
    this.rider = document.getElementById('rider');
    this.pacer = document.getElementById('pacer');

    //const sphere = document.createElement('a-sphere');
    //sphere.setAttribute('color', 'red');
    //sphere.setAttribute('radius', '0.25');
    //sphere.setAttribute('position', '0 0 0');
    //sphere.setAttribute('alongpath', 'path:2,2,-5 -2,1,-2.5 0,1,-1; closed:true; dur:5000; delay:4000;');
    //this.sceneEl.appendChild(sphere);


    // ALONGPATH FUNCTIONS AS EXPECTED BUT NEEDS THE RIGHT PATH AND SPEED ADJUSTMENTS
    this.rider.setAttribute('alongpath', 'path: 0,2,0 0,2,-15 0,2,-20; dur: 0; loop: false; delay:5000;');





    
    //const track1 = document.createElement('a-entity');
    //track1.setAttribute('id','track1');




    //const point1 = document.createElement('a-curve-point');
    //point1.setAttribute('position', '0 0 -15');
    //track1.appendChild(point1);

    //const point2 = document.createElement('a-curve-point');
    //point2.setAttribute('position', '0 5 -30');
    //track1.appendChild(point2);


    //const point3 = document.createElement('a-curve-point');
    //point3.setAttribute('position', '0 10 -45');
    //track1.appendChild(point3);


    //console.log(track1)

    //this.sceneEl.appendChild(track1);


    //this.rider.setAttribute('alongpath', 'curve: #track1');


    

  }

  straightSpline(spawnZ) {
    // Spawn a series of points defining the track
    



    // Add to follow-spline for the rider


    // See what happens?!

    // CAN PROBABLY UPDATE CAMERA POSITION BASED ON RIDER POSITION



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
}