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

    // INITIAL CURVATURE TESTING
    constants.trackPoints.push({x: 15, y: 1, z: -7, length: 8});

    // INITIAL CURVATURE TESTING
    constants.trackPoints.push({x: 23, y: 1, z: -15, length: 8});

    // CENTER
    constants.trackPoints.push({x: 27, y: 1, z: -33, length: 15.7});

    // TOP RETURN
    constants.trackPoints.push({x: 21, y: 1, z: -48, length: 8});


    constants.trackPoints.push({x: 15, y: 1, z: -55, length: 8});

    //EXIT
    constants.trackPoints.push({x: 0, y: 1, z: -61, length: 15.7});


    // PLUS 5 GETS YOU EXACTLY TO THE TOP EDGE
    constants.trackPoints.push({x: 0, y: 1, z: -66, length: 5});
    
    this.curve_180_right(-2);
    straightPiece();
    
    
    
    //spawn_track();

    // As each animation completes, start the next one
    this.rider.addEventListener('animationcomplete__1', this.update_rider_animation);
    setTimeout(() => this.initialize_animation(), 5000);
  }


  // Create an append a track piece curving to the right
  curve_180_right(spawnZ) {
    const track = document.createElement('a-entity');

    // UPDATE FARTHEST SPAWN FOR 1 ONLY -- SHOULD BE 60?? MIGHT BE 30
    constants.farthestSpawn += 63;


    // SO I DID THIS AS 2 15s
    //MEANING YOU GO FROM WHERE YOU ARE, TO EDGE, AND BACK
    // START WITH ONE POINT AT FAR RIGHT IN THE MIDDLE - x:30, y:1, z:-15
    // BACK IS x:0, y:1, z:-30
    // LENGTH IS 62.8 total, so 31.4 per quarter
    track.setAttribute('id', 'curve')
    track.setAttribute('geometry',`primitive: ring; radiusInner: 25; radiusOuter: 35; thetaLength: 180; thetaStart: 270`);
    track.setAttribute('material', `src: #track-texture; repeat: 7.5 7.5`);
    track.setAttribute('configuration', `curve_right_180`);

    // Subract an additional 15 to compensate for goofy centering
    track.setAttribute('position', `-3.5 ${constants.pathHeight} ${spawnZ-30}`);
    track.setAttribute('rotation', '-90 0 0');
    //track.setAttribute('parametric-curve', `xyzFunctions: -18*cos(t), 2, -18*sin(t); tRange: 4.7, 1.5;`);


    this.path_element.appendChild(track);
    //return track.getAttribute("configuration");
  }

  // Update animation speed and target based on current track piece
  update_rider_animation() {
    constants.currentTrackPiece += 1;

    
    let avatar = document.getElementById('rider');
    
    let pacer = document.getElementById('pacer-entity');

    // Calculate rider's duration and set attributes
    // Remove animation element and reset it to ensure that it runs instead of blocking the animation execution chain
    let riderDuration = Math.round(constants.trackPoints[constants.currentTrackPiece].length / (constants.riderState.speed) * 1500);
    console.log("HIT: " + riderDuration)

    avatar.removeAttribute("animation__1");
    avatar.setAttribute("animation__1", `property: position; to: ${constants.trackPoints[constants.currentTrackPiece].x} ${constants.trackPoints[constants.currentTrackPiece].y} ${constants.trackPoints[constants.currentTrackPiece].z}; dur: ${riderDuration}; easing: linear; loop: false; startEvents: riderStarted; pauseEvents: riderStopped; resumeEvents: riderResumed;`);

    let pacerSpeed = document.getElementById('pacer-speed').value;

    // WORK OUT WHERE PACER WOULD USING TRACK PIECE ARRAY SO THE PACER ISN'T JUST DOING WHATEVER THE RIDER IS
    let pacerEndpoint = -(riderDuration / 1500 * pacerSpeed) + getPos(pacer).z;


    pacer.removeAttribute("animation__1");
    pacer.setAttribute("animation__1", `property: position; to: ${constants.trackPoints[constants.currentTrackPiece].x + 0.5} ${constants.trackPoints[constants.currentTrackPiece].y} ${pacerEndpoint}; dur: ${riderDuration}; easing: linear; loop: false; autoplay:true;`);



    


    // If rider or pacer is within 40 units of the end, spawn some more track pieces
    if (getPos(avatar).z < constants.trackPoints[constants.trackPoints.length - 1].z + 200) {
      //spawn_track();
    }

    // If rider is about to run out of ground, add some more tiles
    if (getPos(avatar).z < (-constants.gridDepth * 10) + 300) {
      add_tile();
    }
  }

  // Initialize rider animation attribute using a very short section of track to avoid division by zero
  // Pacer starts when rider starts. Delay ensures pacer finishes loading
  initialize_animation() {
    activatePacer();
    this.rider.setAttribute("animation__1", `property: position; to: ${constants.trackPoints[0].x} ${constants.trackPoints[0].y} ${constants.trackPoints[0].z}; dur: 1; delay: 5000; easing: linear; loop: false; startEvents: riderStarted; pauseEvents: riderStopped; resumeEvents: riderResumed;`);
    this.pacer.setAttribute("animation__1", `property: position; to: ${constants.trackPoints[0].x + 0.5} ${constants.trackPoints[0].y} ${constants.trackPoints[0].z}; dur: 1; easing: linear; loop: false; startEvents: pacerStart;`);
  }

  
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

    const track = document.createElement('a-entity');
    track.setAttribute('geometry',`primitive: box; width: ${constants.pathWidth}; height: ${constants.pathHeight}; depth: ${constants.pathDepth}`);
    track.setAttribute('material', `src: #track-texture; repeat: 1 0.25`);
    track.setAttribute('configuration', `straight_vertical`);
    track.setAttribute('position', `${constants.pathPositionX} ${constants.pathPositionY} ${trackZ}`);
    path_element.appendChild(track);
  }

  // Add more ground tiles as the rider moves forward
  function add_tile() {
    let tilesEntity = document.getElementById('tiles');
    let delete_tiles = tilesEntity.children;
    let start = constants.gridDepth;
    constants.gridDepth += 80;

    for (let z = start; z < constants.gridDepth; z++) {
      for (let x = 0; x < constants.gridWidth; x++) {
        const tile = document.createElement("a-entity");
        tile.setAttribute("geometry", `primitive: box; width: ${constants.tileSize}; height: ${constants.height}; depth: ${constants.tileSize}`);
            tile.setAttribute("material", "src: #grass-texture");
            tile.setAttribute("position",
              `${constants.startX + x * constants.tileSize} 0 ${
                (-z + (constants.startZ/constants.tileSize)) * constants.tileSize
              }`
            );
            tilesEntity.appendChild(tile);
          }
        }
    
    // Delete tiles behind the rider
    if (delete_tiles.length > 1500) {
      for (let i = 0; i < 500; i++) {
        delete_tiles[0].parentNode.removeChild(delete_tiles[0]);
      }
  }
}

  // Spawn track pieces in
  export function spawn_track() {
    for (let i = 0; i < 80; i++) {
      straightPiece();
    }

    // Shorten track element array every time it exceeds 200 elements
    let track_elements = document.getElementById('track').children;
    if (track_elements.length > 200) {
      for (let i = 0; i < 100; i++) {
        if (track_elements[0].getAttribute('position').z > getPos(document.getElementById('rider')).z + 20) {
          track_elements[0].parentNode.removeChild(track_elements[0]);
        }
      }
    }
  }