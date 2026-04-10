import * as THREE from 'three';
import { AvatarMovement } from "../avatarMovement.js";
import { Track } from "../scene/env/Track.js";
import { Cloud } from "../scene/env/Cloud.js";
import { SceneryManager } from "../scene/env/SceneryManager.js";
import { constants } from "../constants.js"
import {GroundInstanced} from "../scene/env/GroundInstanced.js";

export class cameraPref {
  content;
  ready = false;
  initialized = false;

  constructor(setWhenDone) {
    fetch("../html/cameraPref.html")
      .then((r) => r.text())
      .then((content) => {
        this.content = content;
        if (setWhenDone) this.setPage();
        this.ready = true;
      });
      
      this.viewIndex = 0;
      this.viewCoordinates = [];
      this.viewCoordinates.push({x: -6, y: 4, z: 12});
      this.viewCoordinates.push({x: -6, y: 4, z: 8});
      this.viewCoordinates.push({x: 6, y: 4, z: 12});
      this.viewCoordinates.push({x: 6, y: 4, z: 8});
      this.viewCoordinates.push({x: 0, y: 4, z: 5});
      this.viewCoordinates.push({x: 0, y: 4, z: 12});
      this.viewCoordinates.push({x: -0.5, y: 3, z: -0.5});
      this.renderer = null;
  }

  setPage() {
    document.getElementById("mainDiv").innerHTML = this.content;

    // Assign this.viewCoordinates[0] to the relevant local storage variable
    localStorage.setItem("view", JSON.stringify(this.viewCoordinates[0]));

    const camera = new THREE.PerspectiveCamera(
      80,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // Get necessary buttons and add event listeners
    const nextButton = document.getElementById("next");
    const prevButton = document.getElementById("previous");
    const selectButton = document.getElementById("selectButton");

    nextButton.addEventListener("click", () => {
      this.changeView(1, camera);
    });

    prevButton.addEventListener("click", () => {
      this.changeView(-1, camera);
    });

    // Save coordinates associated with view to local storage when selected; then return to main menu
    selectButton.addEventListener("click", () => {
      localStorage.setItem("view", JSON.stringify(this.viewCoordinates[this.viewIndex]));
      this.reset();

      //alert(JSON.parse(localStorage.getItem("view")).x);
      viewManager.setView(viewManager.views.mainMenu);
    });

    // Create new canvas and generate Zlow scene
    const canvas = this.setPageBackground(camera);
    document.getElementById("mainDiv").appendChild(canvas);
  }

  setPageBackground(camera) {
    // Create scene and add sky
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    
    // Create and configure renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer = renderer;

    // Get coordinates and configure camera
    let coords = JSON.parse(localStorage.getItem("view"));
    camera.position.x = coords.x;
    camera.position.y = coords.y;
    camera.position.z = coords.z;

    // Add lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(5, 10, 7);
    scene.add(sun);
    
    // Add scenery, ground, track, and clouds
    this.scenery = new SceneryManager({ scene: scene });
    this.ground = new GroundInstanced(scene);
    this.track = new Track({ scene: scene });
    this.clouds = new Cloud({ scene: scene });

    // Add rider and pacer
    this.rider = new AvatarMovement("camera-rider", {
      position: { x: -0.5, y: 1, z: 0 },
      isPacer: false,
      scene: scene
    });
    
    this.pacer = new AvatarMovement("camera-pacer", {
      position: { x: 0.5, y: 1, z: -2 },
      isPacer: true,
      scene: scene
    });

    // Add animation function
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }

    animate();
    
    // Return final element for attachment to the page
    return renderer.domElement;
  }

  changeView(increment, camera) {

    // Ensure a value to increment by was provided
    if (!increment) {
      alert("No incrementation value has been provided. Cannot reposition camera!");
      return;
    }
    
    // Increment viewIndex
    if ((this.viewIndex + increment) == (this.viewCoordinates.length)) {
      this.viewIndex = 0;
    }

    else if (this.viewIndex + increment < 0) {
      this.viewIndex = this.viewCoordinates.length - 1;
    }

    else {
      this.viewIndex += increment; 
    }

    // Set camera values
    camera.position.x = this.viewCoordinates[this.viewIndex].x;
    camera.position.y = this.viewCoordinates[this.viewIndex].y;
    camera.position.z = this.viewCoordinates[this.viewIndex].z;
  }
    
  reset() {
    if (this.renderer) {
      this.renderer.dispose();
    }

    // Remove the Three.js canvas from the DOM
      const canvas = document.querySelector('canvas');
      if (canvas) canvas.remove();

      // Destroy the scene (renderer, ground, track, clouds, scenery)
      this.scene?.destroy();
      this.scene = null;

      // Clear singleton guards so fresh instances are created
      window.__zlowSceneInstance = null;
      window.__zlowTrackInstance = null;
      
      // Null out references so nothing carries over
      this.rider = null;
      this.pacer = null;

      // Reset all constants
      constants.pacerStarted = false;
      constants.farthestSpawn=1;
      constants.currentTrackPiece=0;
      constants.pacerCurrentTrackPiece=0;
      constants.trackPoints=[];
      constants.lastTime=Date.now();
      constants.worldZ=0;
      constants.lastCloud = Date.now();
      constants.cloudSpeed = 0;
      constants.updateEvery=0;
  } 
}