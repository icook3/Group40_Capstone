import { constants } from "../../constants.js";

export class Cloud {

  constructor({ sceneEl }) {
    this.sceneEl = sceneEl;
    
    // Zone 1: z = 0 through -120; y = 20 through 100; x = 190 through -190
    // Zone 2: z = -121 through -240; y = 20 through 200; x = 400 through -400
    // Zone 3: z = -141 through -360; y = 30 through 300; x = 345 through -345
    // Zone 4: Used to spawn clouds in the farther section of Zone 3 as the rider moves

    // Create a-entity for the clouds and set ID
    this.clouds = document.createElement('a-entity');
    this.clouds.setAttribute('id','clouds');

    // Spawn clouds in zones 1-3
    for (let i = 0; i < 15; i++) {
      this.clouds.appendChild(spawnCloud(1));
    }

    for (let i = 0; i < 10; i++) {
      this.clouds.appendChild(spawnCloud(2));
      this.clouds.appendChild(spawnCloud(3));
    }

    // Add clouds to scene
    sceneEl.appendChild(this.clouds);

    // Determine how fast clouds will move (10 to 30 MPH)
    constants.cloudSpeed = Math.floor(Math.random() * (30 - 10 + 1)) + 10;
    constants.updateEvery = (1/constants.cloudSpeed) * 1000;
  }
}

// Spawn a single cloud based on input provided
export function spawnCloud(zone) {
  let maxX;
  let minX;
  let maxY;
  let minY;
  let maxZ;
  let minZ;

  // Establish minima and maxima for the relevant zone
  if (zone === 1) {
    minX = 0;
    maxX = 190;
    minY = 20;
    maxY = 80;
    minZ = 20;
    maxZ = 120;
  }
  
  else if (zone === 2) {
    minX = 0;
    maxX = 400;
    minY = 20;
    maxY = 150;
    minZ = 121;
    maxZ = 240;
  }

  else if (zone === 3) {
    minX = 0;
    maxX = 345;
    minY = 30;
    maxY = 170;
    minZ = 141;
    maxZ = 360;
  }

  else if (zone === 4) {
    minX = 0;
    maxX = 345;
    minY = 30;
    maxY = 170;
    minZ = 300;
    maxZ = 360;
  }

  // Get x and determine sign
  let cloudX;
  if (getSign()) {
    cloudX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
  }

  else {
    cloudX = -(Math.floor(Math.random() * (maxX - minX + 1)) + minX);
  }

  // Get y
  let cloudY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

  //Get z and multiply by -1
  let cloudZ = -(Math.floor(Math.random() * (maxZ - minZ + 1)) + minZ);

  // Create a-entity, set attributes, and return to caller
  const cloud = document.createElement('a-entity')

  // Decide what kind of cloud to create and set position
  let cloudType = "cloud" + (Math.floor(Math.random() * (constants.totalCloudTypes)) + 1);
  cloud.setAttribute('gltf-model',`#${cloudType}`);
  cloud.setAttribute('position', `${cloudX} ${cloudY} ${cloudZ}`);

  // Flip cloud on the y-axis to add more variation based on getSign()
  if (getSign()) {
    cloud.setAttribute('rotation', `0 180 0`);
  }

  return cloud;
}

// Decide whether the number should be positive or negative
function getSign() {
    let randomNo = Math.floor(Math.random() * 10);
    return randomNo % 2 === 0;
  }