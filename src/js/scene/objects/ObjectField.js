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

    // Get rider and pacer entities
    this.rider = document.getElementById('rider');
    this.pacer = document.getElementById('pacer');

    
    
    // weights parallel KINDS (keep 50/50 for identical behavior)
    this.weights = [1, 1];
    this.totalWeight = this.weights.reduce((a, b) => a + b, 0);
    this.path_element = document.getElementById('track');

    // Add track pieces for initial testing. You need about 5 pieces to get to the horizon
    // You can't start with a curved piece, because you'll start right in the middle of the ring
    // NOTE: Be sure to create the array from smallest to largest or else track respawning will break!!
    
    
    this.spawnScenery(this.track.straightPiece(0), 0);
    this.track.curve_180_right(-60);
    this.spawnScenery(this.track.straightPiece(-120), -120);
    this.spawnScenery(this.track.straightPiece(-180), -180);
    this.spawnScenery(this.track.straightPiece(-240), -240);

    //if (document.getElementById("curve")) {this.rider.setAttribute("curve-follow", 'curveData: #curve; type: parametric-curve; duration: 10; loop: false; enabled: false');}

    // Add curve-follow capability
    
    //this.pacer.setAttribute("curve-follow", 'curveData: #curve; type: parametric-curve; duration: 10; loop: false; enabled: false');

    //this.track.test(0,0);
    //this.track.track_visualizer();
    // Test marking a specific location in-scene
    //this.track.test(0, -25);
    //this.test_thing = document.getElementById('test_thing');
    //this.visualizer = document.getElementById('visualizer');
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
    //console.log("Placing object at (" + getPos(entity).x + ", " + getPos(entity).y + ", " + getPos(entity).z + "). This is in ObjectField");
  }

  // Initializes items that move with the rider (buildings and trees)
  init() {
    if (this.initialized) return;
    this.initialized = true;
  }

  // Advances the scene. Recycles items more than 10 units in front of the rider
  advance(riderSpeed, dt) {
    if (!this.initialized || (riderSpeed, dt) === 0) return;
    let dz = 0;

    // Advance scenery on z axis unless on a curve
    if (this.path_element.children[1].getAttribute("configuration") == "straight_vertical" && this.path_element.children[1].getAttribute("position").z > -25 && constants.worldZ > 0) {

      // Turn off curve-follow if within 25 units of a straight piece
       this.rider.setAttribute("curve-follow", "enabled", "false");
       console.log(this.rider.getAttribute("curve-follow").enabled)

      dz = riderSpeed * dt;
    }

    // Follow curve if beginning a curved element
    if (((this.path_element.children[1].getAttribute("configuration") == "curve_right_180" && this.path_element.children[1].getAttribute("position").z > -25) || (this.path_element.children[0].getAttribute("configuration") == "curve_right_180" && this.path_element.children[0].getAttribute("position").z < 30)) && constants.worldZ > 0) {
      
      // Turn on curve-follow if within 25 units of a curved piece
      this.rider.setAttribute("curve-follow", "enabled", "true");
      console.log(this.rider.getAttribute("curve-follow").enabled)

      //console.log("TIME: " + 220/riderSpeed)

      // CALCULATE WHAT CLIP YOU OUGHT TO GO AROUND THE CURVE BASED ON HOW LONG IT OUGHT TO TAKE TO FINISH
      // FOR SOME REASON ANY DZ THAT ISN'T RIDER SPEED * DT MESSES UP TRACK GENERATION?? -- Pulling the last element too fast? Could be the test sphere.

      //OK SO - THE CURVE IS 220 UNITS LONG. THEREFORE THE TIME NEEDED TO GET ALL THE WAY AROUND IS 220/RIDER SPEED AND DZ IS Z OF WHEREVER THE RIDER HAPPENS TO BE THEN

     dz = 0;
    }

    // If something goes wrong, default to original dz
    else {
      dz = riderSpeed * dt;
    }

    // Handles all objects currently part of the items array
    for (const obj of this.items) {
      const pos = getPos(obj);
      pos.z += dz;

      if (pos.z > 10) {
        // recycle in front of farthest
        const farthestZ = Math.min(...this.items.map(o => getPos(o).z));
        pos.z = farthestZ - 5;

        // resample X per-kind (keeps trees closer than buildings)
        const kind = detectKind(obj);
        pos.x = kind.resampleX();

      }
        setPos(obj, pos);
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
      setPos(obj, pos);
    }
  }

  // Advance track
  for (let segment of this.path_element.children) {
    const pos = getPos(segment);
    pos.z += dz;
    setPos(segment, pos);

    // Not sure why rotation reverts to 0 0 0 in case of curved pieces? Probably inheritance
    if (segment.getAttribute("configuration") == "curve_right_180") {
      segment.setAttribute('rotation', '-90 0 0');
    }
  }

  // Advance track visualizer
  //console.log("VISUALIZER" + this.visualizer)
  //const pos = getPos(this.visualizer);
    //pos.z += dz;
    //setPos(this.visualizer, pos);


  // END TRACK VISUALIZER

  // Spawn new track section if the farthest piece of track is under 240 units in front of worldZ
  if (constants.worldZ > constants.trackLastUpdate + 60) {
    constants.trackLastUpdate += 60;
    // Get location of the last piece in the chain and spawn the next piece 60 units in front of it; delete completed section if no longer visible
    const lastPiece = getPos(this.path_element.children[this.path_element.children.length-1]).z - 60
    this.spawnScenery(this.track.straightPiece(lastPiece), lastPiece);

    if (getPos(this.path_element.children[0]).z > 30) {
      this.path_element.removeChild(this.path_element.children[0]);
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

  spawnScenery(trackPiece, initialZ) {
    // initialz refers to the central point of a 60-unit segment
    if (trackPiece == "straight_vertical") {
      for (let z = initialZ+30; z > initialZ-30; z -= 5) {
        this._spawnAtZ(z);
        if (Math.random() < 0.7) this._spawnAtZ(z); // original density
      }
    }
  }
}