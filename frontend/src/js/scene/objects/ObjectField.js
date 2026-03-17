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

    // Rotate rig to face forwards relative to the rider
    this.rig = document.getElementById('rig');
    this.rig.setAttribute('rotation', '0 -105 0'); 
  }

  // allow scene to register bands (each with items[] and recyclePolicy)
  // Not currently used?
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

    // CAP HERE (right after push)
    const MAX_ITEMS = 1200; // start high; tune later

    if (this.items.length > MAX_ITEMS) {
      // remove oldest items first (front of array)
      const extra = this.items.length - MAX_ITEMS;
      const removed = this.items.splice(0, extra);

      for (const el of removed) {
        el?.parentNode?.removeChild(el);
      }
    }
  }

  // Initializes items that move with the rider (buildings and trees)
  // May not do anything
  init() {
    if (this.initialized) return;
    this.initialized = true;

      const rig = document.getElementById('rig');
      const sky = document.querySelector('a-sky');
      if (rig && sky && sky.parentNode !== rig) {
        rig.appendChild(sky); // sky now follows rig automatically
      }
  }

  // Advances the scene. Recycles items more than 20 units in front of the rider
  advance(riderSpeed, dt) {
    if (!this.initialized || riderSpeed === 0 || dt === 0) return;

    const riderEl = document.getElementById('rider');
    const riderZ = getPos(riderEl).z;
    const recycleZ = riderZ + 20;

    // Cache Date.now once
    const now = Date.now();

    // ---------------------------
    // MAIN ITEMS (this.items)
    // ---------------------------

    // Compute the "farthest behind" Z (min Z) ONCE per frame
    let minZ = Infinity;
    for (const o of this.items) {
      const z = getPos(o).z;
      if (z < minZ) minZ = z;
    }

    for (const obj of this.items) {
      const pos = getPos(obj);

      if (pos.z > recycleZ) {
        // recycle in front of farthest-behind (minZ)
        pos.z = minZ - 5;

        // resample X per-kind (keeps trees closer than buildings)
        const kind = detectKind(obj);
        pos.x = kind.resampleX();

        // update minZ so multiple recycled objects don't stack
        minZ = pos.z;

        // ✅ only update when it changed
        setPos(obj, pos);
      }
      // else: do nothing; unchanged objects don't need setPos()
    }

    // ---------------------------
    // EXTERNAL BANDS (band.items)
    // ---------------------------

    for (const band of this.externalGroups) {
      if (band?.policy?.isStatic()) continue;
      if (!band?.items?.length) continue;

      // Compute band minZ ONCE per frame
      let bandMinZ = Infinity;
      for (const o of band.items) {
        const z = getPos(o).z;
        if (z < bandMinZ) bandMinZ = z;
      }

      for (const obj of band.items) {
        const pos = getPos(obj);

        if (pos.z > recycleZ) {
          // recycle within THIS band independently
          pos.z = bandMinZ - 5;

          // re-roll kind by band policy mix (keeps long-run ratios)
          if (band.policy && typeof band.policy.xAnchor === 'function') {
            const mix =
              typeof band.policy.mix === 'function'
                ? band.policy.mix()
                : { tree: 0.5, building: 0.5 };

            const roll = Math.random();
            const nextIsBuilding =
              roll < (typeof mix.building === 'number' ? mix.building : 0.5);

            const kindName = nextIsBuilding ? 'building' : 'tree';
            obj.setAttribute('zlow-kind', kindName);

            const sideAttr = obj.getAttribute('zlow-side'); // 'left' | 'right'
            const side = sideAttr === 'left' ? -1 : 1;

            const anchorX = band.policy.xAnchor(kindName, side);

            const jitterAmp =
              typeof band.policy.jitterX === 'function'
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

          // update bandMinZ so recycled objects don't stack
          bandMinZ = pos.z;

          // ✅ only update when it changed
          setPos(obj, pos);
        }
        // else: unchanged; skip setPos()
      }
    }

    // ---------------------------
    // CLOUDS
    // ---------------------------

    if (now > constants.lastCloud + constants.updateEvery) {
      constants.lastCloud = now;

      const cloudRoot = this.clouds?.clouds;
      const riderZNow = riderZ;

      if (cloudRoot?.children?.length) {
        // Copy to array so removing doesn't mess up iteration
        const children = Array.from(cloudRoot.children);

        for (const cloud of children) {
          const pos = getPos(cloud);

          // If the cloud is still in visible range, move it forward
          if (pos.z < riderZNow) {
            pos.z += 1;
            setPos(cloud, pos);
          }
          // Otherwise, remove it and respawn in zone 4
          else {
            cloudRoot.removeChild(cloud);
            cloudRoot.appendChild(spawnCloud(4));
          }
        }
      }
    }
  }


  spawnScenery(trackPiece, initialZ) {
    if (trackPiece == "straight_vertical") {
      for (let z = initialZ+30; z > initialZ-30; z -= 5) {
        this._spawnAtZ(z);
        if (Math.random() < 0.7) this._spawnAtZ(z); // original density
      }
    }
  }

  



}

function addItem() {}