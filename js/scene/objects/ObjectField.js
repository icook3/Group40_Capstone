  // Flow:
  // Call spawnAtZ either once or twice depending on randomly generated number
  // spawnAtZ runs pickKind to decide what to spawn
  // spawnAtZ pushes the entity to items, which are updated as the rider moves.

import { getPos, setPos } from '../core/util.js';
import { KINDS, kindsByName } from './kinds/index.js';

export class ObjectField {
  constructor({ sceneEl, dirtPattern, policy }) {
    this.sceneEl = sceneEl;
    this.dirtPattern = dirtPattern;
    this.items = [];
    this.initialized = false;
    this.externalGroups = [];
    this.policy = policy;

    // weights parallel KINDS (keep 50/50 for identical behavior)
    this.weights = [1, 1];
    this.totalWeight = this.weights.reduce((a, b) => a + b, 0);
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
  init() {
    if (this.initialized) return;
    for (let z = 0; z > -200; z -= 5) {
      this._spawnAtZ(z);
      if (Math.random() < 0.7) this._spawnAtZ(z); // original density
    }
    this.initialized = true;
  }

  _detectKind(el) {
    const name = el.getAttribute('zlow-kind');
    if (name && kindsByName[name]) return kindsByName[name];

    // Fallback to geometry check (shouldn’t be needed once we set zlow-kind):
    const geom = el.getAttribute('geometry');
    const isBuilding = geom && (typeof geom === 'object'
      ? geom.primitive === 'box'
      : String(geom).includes('primitive: box'));
    return isBuilding ? kindsByName.building : kindsByName.tree;
  }

  // Advances the scene. Recycles items more than 10 units in front of the rider
  advance(dz) {
    if (!this.initialized || dz === 0) return;

    // Handles all objects currently part of the items array
    for (const obj of this.items) {
      const pos = getPos(obj);
      pos.z += dz;

      if (pos.z > 10) {
        // recycle in front of farthest
        const farthestZ = Math.min(...this.items.map(o => getPos(o).z));
        pos.z = farthestZ - 5;

        // resample X per-kind (keeps trees closer than buildings)
        const kind = this._detectKind(obj);
        pos.x = kind.resampleX();
      }

      setPos(obj, pos);
    }

    // Advances the dirt pattern
    if (this.dirtPattern?.patternEl) {
      const kids = Array.from(this.dirtPattern.patternEl.children);
      if (kids.length) {
        // const farthestZ = Math.min(...kids.map(c => getPos(c).z));
        
        for (const circle of kids) {
          const pos = getPos(circle);

          // Update z as item moves closer to rider
          pos.z += dz;
          
          // Reset position when item is within 10 of rider
          if (pos.z > 10) {
            //pos.z = farthestZ - 5;
            // Reset z to -30, which is about as far as you can see on the track
            pos.z = -30;
          }
          setPos(circle, pos);
        }
      }
    }
  }
}