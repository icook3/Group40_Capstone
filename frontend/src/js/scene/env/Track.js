/*
  Creates the path the rider travels and circular patterns superimposed on the road.
  Neither the road nor the pattern are added into the array used to update the scene as the rider moves.
*/
import { constants } from "../../constants.js";
import {getPos, getSign} from '../core/util.js';
import  {activatePacer } from '../../main.js'
import {Tween, Easing, Group, add, remove} from 'https://unpkg.com/@tweenjs/tween.js@23.1.3/dist/tween.esm.js'

export class Track {
  constructor({ scene }) {
    // ---- SINGLETON GUARD / CLEANUP PREVIOUS INSTANCE ----
    if (window.__zlowTrackInstance) {
      window.__zlowTrackInstance.destroy?.();
    }
    window.__zlowTrackInstance = this;
    this.scene = scene;

    let path_element = scene.getObjectByName("track");
    this._ownsPath = !path_element;

    if (!path_element) {
      path_element = new THREE.Group();
      path_element.name = "track";
      scene.add(path_element);
    }
    this.path_element = path_element;

    this.trackTexture = new THREE.TextureLoader().load("../../resources/textures/Track.jpeg");

    // Get entities needed to create the timeline animation
    //this.rider = document.getElementById('rider');
    //this.pacer = document.getElementById('pacer-entity');
    //this.update_rider_animation = this.update_rider_animation.bind(this);
    //this.update_pacer_animation = this.update_pacer_animation.bind(this);

    const geometry = new THREE.BoxGeometry(
      constants.pathWidth,
      constants.pathHeight,
        15
    );

    const material = new THREE.MeshStandardMaterial({
      map: this.trackTexture
    });

    const track = new THREE.Mesh(geometry, material);
    track.position.set(0, 0, 4);
    this.path_element.add(track);
    constants.trackPoints.push({ x: 0, y: 1, z: -1, length: 1 });

    spawn_track(this);

    this._initTimer = setTimeout(() => this.update_rider_animation(), 5000);
    update_pacer_animation(this.scene);
  }

  destroy() {
    this.path_element.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();

      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    });

    this.path_element.parent?.remove(this.path_element);
  }

// Update animation speed and target based on current track piece
update_rider_animation() {

  // Busywait if the rider is not moving
  if (constants.riderState.speed === 0) {
    setTimeout(() => { 
    this.update_rider_animation();
    }, 500);
    return;
  }

  // Find avatar and camera
  // Update camera call when it transitions to three.js


  const avatar = this.scene.getObjectByName('rider');
  let camera = this.scene.getObjectByName('camera');
  
  // Check for rider to prevent util.js crash and ensure at least 10 track points left
  if (!avatar) return; 

  const BUFFER_POINTS = 10;
  if (constants.currentTrackPiece + BUFFER_POINTS >= constants.trackPoints.length) {
    spawn_track();
  }

  // Guard against out-of-range and undefined track points
  const tp = constants.trackPoints[constants.currentTrackPiece];
  if (!tp) {
    console.warn(
      "[Track] Missing track point: ",
      constants.currentTrackPiece,
      "trackPoints length: ",
      constants.trackPoints.length
    );
    return;
  }
  
  // Increment current track piece and define starting and ending coordinates
  constants.currentTrackPiece += 1;
  let coords = {x: -0.5, y: 0, z: 0};
  if (constants.currentTrackPiece > 0) {
    coords = { x: constants.trackPoints[constants.currentTrackPiece - 1].x - 0.5, y: constants.trackPoints[constants.currentTrackPiece - 1].y, z: constants.trackPoints[constants.currentTrackPiece - 1].z }
  }
  
  let endpoint = { x: constants.trackPoints[constants.currentTrackPiece].x - 0.5, y: constants.trackPoints[constants.currentTrackPiece].y, z: constants.trackPoints[constants.currentTrackPiece].z };
  let riderDuration = Math.round((constants.trackPoints[constants.currentTrackPiece].length / constants.riderState.speed) * 1500);

  // Animate rider's position over time
  const animateRider = new Tween(coords, false)
		.to(endpoint, riderDuration)
		.onUpdate(() => {
      avatar.position.set(coords.x, coords.y, coords.z)
      
      // Have camera follow the rider's position. Rider starts at 0 0 0; camera at -0.5 6 5
      
      //camera.setAttribute('position', `${avatar.position.x} ${avatar.position.y + 4} ${avatar.position.z + 8}`);
      camera.position.x = avatar.position.x;
      camera.position.y = avatar.position.y + 1;
      camera.position.z = avatar.position.z + 8;
    })
    .onComplete(() => {
      // Recall this function as long as the program is in use.
      this.update_rider_animation();
    
    })

    // It is assumed the rider is moving as this function busywaits if speed is 0
		.start()

    // Helper function to move rider
    function animate(time) {
      animateRider.update(time)
      requestAnimationFrame(animate)
	}

	requestAnimationFrame(animate)

  // If rider is within 200 units of the end, spawn some more track pieces
  // (this can stay as-is; it’s your "keep ahead" logic)
  //if (getPos(avatar).z < constants.trackPoints[constants.trackPoints.length - 1].z + 200) {
    //spawn_track();
  //}
}

  // Helper function to check for an element's existance
  waitForElement(selector, callback) {
    const observer = new MutationObserver((mutations, observer) => {
        const element = document.querySelector(selector);
        if (element) {
            observer.disconnect();
            callback(element);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
  }
}

  // Create and append a track piece curving to the right
  function curve_180_right(trackSystem) {
    const path_element = trackSystem.path_element;
    const pointZ = -1 * (constants.farthestSpawn);

    // Add necessary points based on current farthest spawn
    constants.trackPoints.push({x: 15, y: 1, z: pointZ-7, length: 16.55});
    constants.trackPoints.push({x: 23, y: 1, z: pointZ-15, length: 11.31});
    constants.trackPoints.push({x: 25, y: 1, z: pointZ-24, length: 9.22});
    constants.trackPoints.push({x: 27, y: 1, z: pointZ-33, length: 9.22});
    constants.trackPoints.push({x: 21, y: 1, z: pointZ-48, length: 16.16});
    constants.trackPoints.push({x: 15, y: 1, z: pointZ-55, length: 9.22});
    constants.trackPoints.push({x: 7, y: 1, z: pointZ-58, length: 8.54});
    constants.trackPoints.push({x: 0, y: 1, z: pointZ-61, length: 7.61});

    // Update farthestSpan
    constants.farthestSpawn += 62;

    // Add graphical track representation
    const geometry = new THREE.RingGeometry(
      25,
      35,
      32,
      1,
      THREE.MathUtils.degToRad(270),
      THREE.MathUtils.degToRad(180)
    );

    const material = new THREE.MeshStandardMaterial({
      map: trackSystem.trackTexture,
      side: THREE.DoubleSide
    });

    const track = new THREE.Mesh(geometry, material);
    track.position.set(-3.5, constants.pathHeight, pointZ-30);
    track.rotation.x = -Math.PI/2;

    path_element.add(track);
  }

  // Create and append a track piece curving to the left
  function curve_180_left(trackSystem) {
    const path_element = trackSystem.path_element;
    const pointZ = -1 * (constants.farthestSpawn);

    // Add necessary points based on current farthest spawn
    constants.trackPoints.push({x: -15, y: 1, z: pointZ-7, length: 16.55});
    constants.trackPoints.push({x: -23, y: 1, z: pointZ-15, length: 11.31});
    constants.trackPoints.push({x: -25, y: 1, z: pointZ-24, length: 9.22});
    constants.trackPoints.push({x: -27, y: 1, z: pointZ-33, length: 9.22});
    constants.trackPoints.push({x: -21, y: 1, z: pointZ-48, length: 16.16});
    constants.trackPoints.push({x: -15, y: 1, z: pointZ-55, length: 9.22});
    constants.trackPoints.push({x: -7, y: 1, z: pointZ-58, length: 8.54});
    constants.trackPoints.push({x: 0, y: 1, z: pointZ-61, length: 7.62});

    // Update farthestSpan
    constants.farthestSpawn += 62;

    // Add graphical track representation
    const geometry = new THREE.RingGeometry(
      25,
      35,
      32,
      1,
      THREE.MathUtils.degToRad(90),
      THREE.MathUtils.degToRad(180)
    );

      const material = new THREE.MeshStandardMaterial({
          map: trackSystem.trackTexture,
          side: THREE.DoubleSide
      });

      const track = new THREE.Mesh(geometry, material);
      track.position.set(3.5, constants.pathHeight, pointZ-30);
      track.rotation.x = -Math.PI/2;

      path_element.add(track);
  }

function straightPiece(trackSystem) {
  const path_element = trackSystem.path_element;
  const pointZ = -1 * (constants.farthestSpawn + 5);
  const trackZ = (-1 * constants.farthestSpawn) - constants.pathDepth;
  constants.farthestSpawn += 5;
  constants.trackPoints.push({ x: 0, y: 1, z: pointZ, length: 5 });

  const geometry = new THREE.BoxGeometry(
    constants.pathWidth,
    constants.pathHeight,
    constants.pathDepth
  );

  const material = new THREE.MeshStandardMaterial({
    map: trackSystem.trackTexture
  });

  const track = new THREE.Mesh(geometry, material);

   track.position.set(
     constants.pathPositionX,
     constants.pathPositionY,
     trackZ
   );

   path_element.add(track);
}

// Update animation speed and target based on current track piece
  export function update_pacer_animation(scene, newCoords = null, riderSpeed = null, sync = false) {

    // Busywait if the rider is not moving
    if (constants.riderState.speed === 0) {
      setTimeout(() => { 
        update_pacer_animation(scene);
      }, 500);
      return;
    }

    // Find pacer avatar
    const pacer = scene.getObjectByName('pacer-entity');
    
    // Check for rider to prevent util.js crash and ensure at least 10 track points left
    if (!pacer) return; 

    const BUFFER_POINTS = 10;
    if (constants.pacerCurrentTrackPiece + BUFFER_POINTS >= constants.trackPoints.length) {
      spawn_track();
    }

    // Guard against out-of-range and undefined track points
    const tp = constants.trackPoints[constants.pacerCurrentTrackPiece];
    if (!tp) {
      console.warn(
        "[Track] Missing track point: ",
        constants.pacerCurrentTrackPiece,
        "trackPoints length: ",
        constants.trackPoints.length
      );
      return;
    }
    
    // Increment current track piece and define starting and ending coordinates
    let coords;
    let pacerSpeed;

    if (!sync) {
      constants.pacerCurrentTrackPiece += 1;
      pacerSpeed = Number(document.getElementById('pacer-speed').value) || 0;
      coords = {x: -0.5, y: 0, z: 0};
      if (constants.pacerCurrentTrackPiece > 0) {
        coords = { x: constants.trackPoints[constants.pacerCurrentTrackPiece - 1].x - 0.5, y: constants.trackPoints[constants.pacerCurrentTrackPiece - 1].y, z: constants.trackPoints[constants.pacerCurrentTrackPiece - 1].z }
      }
    }

    else {
      coords = newCoords;
      pacerSpeed = riderSpeed;
    }

    let endpoint = { x: constants.trackPoints[constants.pacerCurrentTrackPiece].x - 0.5, y: constants.trackPoints[constants.pacerCurrentTrackPiece].y, z: constants.trackPoints[constants.pacerCurrentTrackPiece].z };
    
    // May mess up pacer speed a little
    let pacerDuration = Math.round((constants.trackPoints[constants.pacerCurrentTrackPiece].length / pacerSpeed) * 1500);

    // Animate pacer's position over time
    const animatePacer = new Tween(coords, false)
      .to(endpoint, pacerDuration)
      .onUpdate(() => {
        pacer.position.set(coords.x, coords.y, coords.z)
      })
      .onComplete(() => {
        // Recall this function as long as the program is in use.
        update_pacer_animation(scene);
      })
      .start()

      // Helper function to move pacer
      function animate(time) {
        animatePacer.update(time)
        requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)

    // If rider is within 200 units of the end, spawn some more track pieces
    // (this can stay as-is; it’s your "keep ahead" logic)
    //if (getPos(avatar).z < constants.trackPoints[constants.trackPoints.length - 1].z + 200) {
      //spawn_track();
    //}
  }

  // Spawn track pieces in
  export function spawn_track(trackSystem) {
    for (let i = 0; i < 80; i++) {
      // Spawn straight pieces in sets of three and more often than curved pieces
      let random = Math.floor(Math.random() * (15 - 1 + 1)) + 1;

      if (random % 15 === 0 && getSign()) {
        straightPiece(trackSystem);
        curve_180_right(trackSystem);
        straightPiece(trackSystem);
      }
      else if (random % 15 === 0 && !getSign()) {
        straightPiece(trackSystem);
        curve_180_left(trackSystem);
        straightPiece(trackSystem);
      }

      else {
        straightPiece(trackSystem);
        straightPiece(trackSystem);
        straightPiece(trackSystem);
      }
    }

    // Shorten track element array every time it exceeds 200 elements
    let track_elements = trackSystem.path_element.children;
    if (track_elements.length > 200) {
      const riderZ = document.getElementById('rider')?.object3D?.position.z ?? 0;
      let removed = 0;
      while (track_elements.length > 100 && removed < 100) {
      const obj = track_elements[0];
      // Only remove pieces that are behind the rider
      if (obj.position.z > riderZ + 20) {
        obj.parent.remove(obj);
        removed++;
      } else {
        break; // stop if we've reached pieces the rider hasn't passed
      }
      }
    }
  }