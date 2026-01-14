  // Flow:
  // Call spawnAtZ either once or twice depending on randomly generated number
  // spawnAtZ runs pickKind to decide what to spawn
  // spawnAtZ pushes the entity to items, which are updated as the rider moves.

import { getPos, setPos } from '../core/util.js';
import { constants } from "../../constants.js";
import { spawnCloud } from '../env/Cloud.js';
import { KINDS, detectKind } from './kinds/index.js';

export class ObjectField {

  constructor({ sceneEl, track, policy, clouds }) {
    this.sceneEl = sceneEl;
    this.track = track;
    this.clouds = clouds;
    this.items = [];
    this.initialized = false;
    this.externalGroups = [];
    this.policy = policy;
    
    // weights parallel KINDS (keep 50/50 for identical behavior)
    this.weights = [1, 1];
    this.totalWeight = this.weights.reduce((a, b) => a + b, 0);

    //this.path_element = document.getElementById('track');



    // Add track pieces for initial testing. You need about 5 pieces to get to the horizon
    //straightSpline(0);
    this.rider = document.getElementById('rider');
    this.pacer = document.getElementById('pacer');

    // Rotate rig to face forwards relative to the rider
    this.rig = document.getElementById('rig');
    this.rig.setAttribute('rotation', '0 -105 0'); 
    

  }

  // allow scene to register bands (each with items[] and recyclePolicy)
  // Not currently used
  attachExternalBands(groups) {
    for (const g of groups) {
      if (!g || !Array.isArray(g.items)) continue;
      this.externalGroups.push(g);
    }
  }

  // Creates an object used in the object field (currently a tree or a building)
  _pickKind() {
    // weighted random pick
    let r = Math.random() * this.totalWeight;
    for (let i = 0; i < KINDS.length; i++) {
      r -= this.weights[i];
      if (r <= 0) return KINDS[i];
    }
    return KINDS[KINDS.length - 1];
  }

  _spawnAtZ(z) {
    const kind = this._pickKind();
    const entity = kind.spawn(this.sceneEl, z);
    this.items.push(entity);
  }

  // Initializes items that move with the rider (buildings and trees)
  // May not do anything
  init() {
    if (this.initialized) return;
    this.initialized = true;
  }

  // Advances the scene. Recycles items more than 10 units in front of the rider
  advance(riderSpeed, dt) {

    //DOES FIRE IF YOU ONLY HAVE THE ANIMATION RUNNING AND NOT ANYTHING ELSE
    // CAN YOU HAVE THE THING PAUSE??
    //console.log("TIME: " + dt);
    //console.log("SPEED: " + riderSpeed);





    //console.log(this.rider.getAttribute('position').dur);







    if (!this.initialized || (riderSpeed, dt) === 0) return;
    let dz = 0;

    // Handles all objects currently part of the items array
    for (const obj of this.items) {
      const pos = getPos(obj);
      pos.z += dz;
      
      // SHOULD KEEP RECYCLING IN FRONT OF FARTHEST OBJECT WITHOUT ADVANCING SCENERY
      // MAY NEED TO DEFINE AS A FUNTION OF HOW FAR THE THING IS IN FRONT OF THE RIDER
      if (pos.z > 10) {
        // recycle in front of farthest
        const farthestZ = Math.min(...this.items.map(o => getPos(o).z));
        pos.z = farthestZ - 5;

        // resample X per-kind (keeps trees closer than buildings)
        const kind = detectKind(obj);
        pos.x = kind.resampleX();

      }
        //setPos(obj, pos);
    }

    for (const band of this.externalGroups) {
    if (band?.policy?.isStatic()) continue;
    if (!band?.items?.length) continue;
    for (const obj of band.items) {
      const pos = getPos(obj);
      pos.z += dz;

      if (pos.z > 10) {
        // recycle within THIS band independently
        const farthestZ = Math.min(...band.items.map(o => getPos(o).z));
        pos.z = farthestZ - 5;
        
        // re-roll kind by band policy mix (keeps long-run ratios)
        if (band.policy && typeof band.policy.xAnchor === 'function') {
          const mix = typeof band.policy.mix === 'function' ? band.policy.mix() : { tree: 0.5, building: 0.5 };
          const roll = Math.random();
          const nextIsBuilding = roll < (typeof mix.building === 'number' ? mix.building : 0.5);
          const kindName = nextIsBuilding ? 'building' : 'tree';
          obj.setAttribute('zlow-kind', kindName);

          const sideAttr = obj.getAttribute('zlow-side'); // 'left' | 'right'
          const side = sideAttr === 'left' ? -1 : 1;
          const anchorX = band.policy.xAnchor(kindName, side);
          const jitterAmp = typeof band.policy.jitterX === 'function'
            ? band.policy.jitterX()
            : 0;
          let newX = anchorX + (Math.random() - 0.5) * jitterAmp;
          if (typeof band.policy.clampX === 'function') {
            newX = band.policy.clampX(kindName, side, newX);
          }
          pos.x = newX;            
        } else {
          // fallback: detect and use kind’s own resample
          const kind = this._detectKind(obj);
          pos.x = kind.resampleX();
        }
      }
      //setPos(obj, pos);
    }
  }

    // Advance clouds
    if (Date.now() > constants.lastCloud + constants.updateEvery) {
      constants.lastCloud = Date.now();

      if (this.clouds.clouds.children.length) {
        for (let cloud of this.clouds.clouds.children) {
          const pos = getPos(cloud);
          
          // If the cloud is still in visible range, move it forward
          if ((pos.z + 1) < -20) {
            pos.z += 1;
            setPos(cloud, pos);
          }

          // Otherwise, remove it from the array and respawn in zone 4
          else {
            this.clouds.clouds.removeChild(cloud);
            this.clouds.clouds.appendChild(spawnCloud(4));
          }
        }
      }
    }
  }

  //spawnScenery(trackPiece, initialZ) {
    // initialz refers to the central point of a 60-unit segment
    //if (trackPiece == "straight_vertical") {
      //for (let z = initialZ+30; z > initialZ-30; z -= 5) {
        //this._spawnAtZ(z);
        //if (Math.random() < 0.7) this._spawnAtZ(z); // original density
      //}
    //}
  //}
}