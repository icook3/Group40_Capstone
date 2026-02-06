/*
  Creates the path the rider travels and circular patterns superimposed on the road.
  Neither the road nor the pattern are added into the array used to update the scene as the rider moves.
*/
import { constants } from "../../constants.js";
import { getPos, setPos, getSign } from '../core/util.js';
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
    this.rider.addEventListener('animationcomplete__1', this.update_rider_animation);
    this.pacer.addEventListener('animationcomplete__2', this.update_pacer_animation);
    setTimeout(() => this.initialize_animation(), 5000);
  }

  // Update animation speed and target based on current track piece
  update_rider_animation() {
    constants.currentTrackPiece += 1;
    let avatar = document.getElementById('rider');

    // Calculate rider's duration and set attributes
    // Remove animation element and reset it to ensure that it runs instead of blocking the animation execution chain
    let riderDuration = constants.trackPoints[constants.currentTrackPiece].length / (constants.riderState.speed) * 1000;
    avatar.removeAttribute("animation__1");
    avatar.setAttribute("animation__1", `property: position; to: ${constants.trackPoints[constants.currentTrackPiece].x} ${constants.trackPoints[constants.currentTrackPiece].y} ${constants.trackPoints[constants.currentTrackPiece].z}; dur: ${riderDuration}; easing: linear; loop: false; startEvents: riderStarted; pauseEvents: riderStopped; resumeEvents: riderResumed;`);

    // move the sky properly
    setPos(document.getElementById("sky"),{x:0, y:0, z:constants.trackPoints[constants.currentTrackPiece].z});

    // If rider is within 40 units of the end, spawn some more track pieces
    if (getPos(avatar).z < constants.trackPoints[constants.trackPoints.length - 1].z + 200) {
      spawn_track();
    }

    // If rider is close to the "front" of the pooled tiles, recycle more rows forward
    const TILE_BUFFER = 300; // tune if needed (bigger = recycles earlier)

    // Ensure pool exists (otherwise this condition never fires)
    if (!window.__tilePool) {
      __initTilePool(); // creates pool + sets window.__tilePool + frontZ
    }

    // Advance when rider approaches front edge
    if (window.__tilePool && getPos(avatar).z < (window.__tilePool.frontZ + TILE_BUFFER)) {
      add_tile();
    }
  }

  update_pacer_animation() {
    let pacerSpeed = document.getElementById('pacer-speed').value;
    constants.pacerCurrentTrackPiece += 1;

    let pacer = document.getElementById('pacer-entity');

    // Calculate pacer's duration and set attributes
    let pacerDuration = constants.trackPoints[constants.pacerCurrentTrackPiece].length / pacerSpeed * 1000;
    pacer.removeAttribute("animation__2");
    pacer.setAttribute("animation__2", `property: position; to: ${constants.trackPoints[constants.pacerCurrentTrackPiece].x + 0.5} ${constants.trackPoints[constants.pacerCurrentTrackPiece].y} ${constants.trackPoints[constants.pacerCurrentTrackPiece].z}; dur: ${pacerDuration}; easing: linear; loop: false; autoplay:true;`);
  }

  // Initialize rider animation attribute using a very short section of track to avoid division by zero
  // Pacer starts when rider starts. Delay ensures pacer finishes loading
  initialize_animation() {
    activatePacer();
    this.rider.setAttribute("animation__1", `property: position; to: ${constants.trackPoints[0].x} ${constants.trackPoints[0].y} ${constants.trackPoints[0].z}; dur: 1; delay: 5000; easing: linear; loop: false; startEvents: riderStarted; pauseEvents: riderStopped; resumeEvents: riderResumed;`);
    this.pacer.setAttribute("animation__2", `property: position; to: ${constants.trackPoints[0].x + 0.5} ${constants.trackPoints[0].y} ${constants.trackPoints[0].z}; dur: 1; easing: linear; loop: false; startEvents: pacerStart;`);  
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

  // Create and append a track piece curving to the right
  function curve_180_right() {
    let path_element = document.getElementById('track');
    const track = document.createElement('a-entity');
    let pointZ = -1 * (constants.farthestSpawn);

    // Add necessary points based on current farthest spawn
    constants.trackPoints.push({x: 15, y: 1, z: pointZ-7, length: 8});
    constants.trackPoints.push({x: 23, y: 1, z: pointZ-15, length: 8});
    constants.trackPoints.push({x: 25, y: 1, z: pointZ-24, length: 8});
    constants.trackPoints.push({x: 27, y: 1, z: pointZ-33, length: 8});
    constants.trackPoints.push({x: 21, y: 1, z: pointZ-48, length: 8});
    constants.trackPoints.push({x: 15, y: 1, z: pointZ-55, length: 8});
    constants.trackPoints.push({x: 7, y: 1, z: pointZ-58, length: 8});
    constants.trackPoints.push({x: 0, y: 1, z: pointZ-61, length: 8});

    // Add five units to get to the top edge of the curved track graphic
    constants.trackPoints.push({x: 0, y: 1, z: pointZ-66, length: 5});

    // Update farthestSpan
    constants.farthestSpawn += 62;

    // Add graphical track representation
    track.setAttribute('id', 'curve')
    track.setAttribute('geometry',`primitive: ring; radiusInner: 25; radiusOuter: 35; thetaLength: 180; thetaStart: 270`);
    track.setAttribute('material', `src: #track-texture; repeat: 7.5 7.5`);
    track.setAttribute('configuration', `curve_right_180`);

    // Subract an additional 30 to compensate for centering mismatches
    track.setAttribute('position', `-3.5 ${constants.pathHeight} ${pointZ-30}`);
    track.setAttribute('rotation', '-90 0 0');
    path_element.appendChild(track);
  }

  // Create and append a track piece curving to the left
  function curve_180_left() {
    let path_element = document.getElementById('track');
    const track = document.createElement('a-entity');
    let pointZ = -1 * (constants.farthestSpawn);

    // Add necessary points based on current farthest spawn
    constants.trackPoints.push({x: -15, y: 1, z: pointZ-7, length: 8});
    constants.trackPoints.push({x: -23, y: 1, z: pointZ-15, length: 8});
    constants.trackPoints.push({x: -25, y: 1, z: pointZ-24, length: 8});
    constants.trackPoints.push({x: -27, y: 1, z: pointZ-33, length: 8});
    constants.trackPoints.push({x: -21, y: 1, z: pointZ-48, length: 8});
    constants.trackPoints.push({x: -15, y: 1, z: pointZ-55, length: 8});
    constants.trackPoints.push({x: -7, y: 1, z: pointZ-58, length: 8});
    constants.trackPoints.push({x: 0, y: 1, z: pointZ-61, length: 8});

    // Add five units to get to the top edge of the curved track graphic
    constants.trackPoints.push({x: 0, y: 1, z: pointZ-66, length: 5});

    // Update farthestSpan
    constants.farthestSpawn += 62;

    // Add graphical track representation
    track.setAttribute('id', 'curve')
    track.setAttribute('geometry',`primitive: ring; radiusInner: 25; radiusOuter: 35; thetaLength: 180; thetaStart: 90`);
    track.setAttribute('material', `src: #track-texture; repeat: 7.5 7.5`);
    track.setAttribute('configuration', `curve_right_180`);

    // Subract an additional 30 to compensate for centering mismatches
    track.setAttribute('position', `3.5 ${constants.pathHeight} ${pointZ-30}`);
    track.setAttribute('rotation', '-90 0 0');
    path_element.appendChild(track);
  }

  // Add more ground tiles as the rider moves forward
  function add_tile() {
    // This is replaced by a helper that uses a tile pool to minimize churn
    __advanceTilePool(80);
  }

  // Creating Tile Pool to keep bounded and minimize churn

  let __tilePool = null;

  function __tileWorldZ(zIndex) {
    return (-zIndex + (constants.startZ / constants.tileSize)) * constants.tileSize;
  } 
  
  function __initTilePool() {
    const tilesEntity = document.getElementById('tiles');
    if (!tilesEntity) return;

    const width = constants.gridWidth;

    // Choose a fixed pool size roughly matching your cap.
    // Must be a multiple of gridWidth to keep clean rows.
    const MAX_TILES = 1500;
    const rows = Math.max(1, Math.floor(MAX_TILES / width));
    const poolTiles = rows * width;

    const startZ = constants.gridDepth;

    const rowTiles = new Array(rows);
    const frag = document.createDocumentFragment();

    for (let r = 0; r < rows; r++) {
      rowTiles[r] = new Array(width);

      const zIndex = startZ + r;
      const wz = __tileWorldZ(zIndex);

      for (let x = 0; x < width; x++) {
        const tile = document.createElement('a-entity');
        tile.setAttribute(
          'geometry',
          `primitive: box; width: ${constants.tileSize}; height: ${constants.height}; depth: ${constants.tileSize}`
        );
        tile.setAttribute('material', 'src: #grass-texture');

        // Helpful for debugging:
        tile.setAttribute('zlow-kind', 'tile');

        tile.setAttribute(
          'position',
          `${constants.startX + x * constants.tileSize} 0 ${wz}`
        );

        rowTiles[r][x] = tile;
        frag.appendChild(tile);
      }
    }

    tilesEntity.appendChild(frag);

    // Advance gridDepth to reflect that these rows now exist.
    constants.gridDepth = startZ + rows;

    __tilePool = {
      tilesEntity,
      width,
      rows,
      rowTiles,
      nextRecycleRow: 0,          // ring pointer: which row to reuse next
      nextZIndex: constants.gridDepth // next new zIndex to assign when “extending”
    };

    //Store "front edge" Z for trigger + expose pool for update_rider_animation()
    __tilePool.frontZ = __tileWorldZ(__tilePool.nextZIndex - 1);
    window.__tilePool = __tilePool;

    console.log(`[tilePool] initialized rows=${rows}, tiles=${poolTiles}`);
  }

  function __advanceTilePool(rowsToAdvance) {
    if (!__tilePool || !__tilePool.rowTiles) __initTilePool(); 
    if (!__tilePool) return;

    const { width, rows, rowTiles } = __tilePool;

    // Reuse N rows by moving them to the “front” (new zIndex values).
    const n = Math.min(rowsToAdvance, rows);

    for (let i = 0; i < n; i++) {
      const r = __tilePool.nextRecycleRow;
      const zIndex = __tilePool.nextZIndex++;
      const wz = __tileWorldZ(zIndex);

      for (let x = 0; x < width; x++) {
        // Only update Z (X stays consistent per column)
        rowTiles[r][x].setAttribute(
          'position',
          `${constants.startX + x * constants.tileSize} 0 ${wz}`
        );
      }

      __tilePool.nextRecycleRow = (r + 1) % rows;
    }

    // Keep gridDepth consistent with the old logic (it’s used in the trigger)
    constants.gridDepth += n;

    // Update front edge after recycling rows
    __tilePool.frontZ = __tileWorldZ(__tilePool.nextZIndex - 1);
    window.__tilePool = __tilePool;
  }

  // Spawn track pieces in
  export function spawn_track() {
    for (let i = 0; i < 80; i++) {
      // Spawn straight pieces in sets of three and more often than curved pieces
      let random = Math.floor(Math.random() * (15 - 1 + 1)) + 1;

      if (random % 15 == 0 && getSign()) {
        straightPiece();
        curve_180_right();
        straightPiece();
      }

      else if (random % 15 == 0 && !getSign()) {
        straightPiece();
        curve_180_left();
        straightPiece();
      }

      else {
        straightPiece();
        straightPiece();
        straightPiece();
      }
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