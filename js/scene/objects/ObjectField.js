// ObjectField.js
// Flow:
// Call _spawnAtZ either once or twice depending on randomly generated number
// _spawnAtZ runs _pickKind to decide what to spawn
// _spawnAtZ pushes the entity to items, which are updated as the rider moves.

import { getPos, setPos } from '../core/util.js';
import { KINDS, kindsByName, detectKind } from './kinds/index.js';

export class ObjectField {
  constructor({ sceneEl, dirtPattern, policy }) {
    this.sceneEl = sceneEl;
    this.dirtPattern = dirtPattern;
    this.items = [];
    this.initialized = false;

    // Optional external groups (edge/middle/etc.) registered by scene
    this.externalGroups = [];
    this.policy = policy;

    // weights parallel KINDS (keep 50/50 for identical behavior)
    this.weights = Array.isArray(KINDS) ? Array(KINDS.length).fill(1) : [1, 1];
    this.totalWeight = this.weights.reduce((a, b) => a + b, 0);
  }

  // allow scene to register bands (each with items[] and recyclePolicy)
  attachExternalBands(groups) {
    for (const g of groups) {
      if (!g || !Array.isArray(g.items)) continue;
      this.externalGroups.push(g);
    }
  }

  // Weighted random choice among KINDS
  _pickKind() {
    if (!Array.isArray(KINDS) || KINDS.length === 0) {
      throw new Error('KINDS is not configured.');
    }
    // safety: if someone changed KINDS length without updating weights
    if (this.weights.length !== KINDS.length) {
      this.weights = Array(KINDS.length).fill(1);
      this.totalWeight = this.weights.reduce((a, b) => a + b, 0);
    }

    let r = Math.random() * this.totalWeight;
    for (let i = 0; i < KINDS.length; i++) {
      r -= this.weights[i];
      if (r <= 0) return KINDS[i];
    }
    return KINDS[KINDS.length - 1];
  }

  _spawnAtZ(z) {
    const kind = this._pickKind();                 // kind must expose spawn(sceneEl, z)
    const entity = kind.spawn(this.sceneEl, z);    // and (optionally) a .name or will set zlow-kind
    // If spawn didn’t tag it, try to tag for later detection:
    if (entity && !entity.getAttribute('zlow-kind') && kind?.name) {
      entity.setAttribute('zlow-kind', kind.name);
    }
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

  // Advances the scene. Recycles items more than 10 units in front of the rider
  advance(dz) {
    if (!this.initialized || dz === 0) return;

    // ---------- Main items ----------
    if (this.items.length) {
      // Precompute farthest once (O(n))
      let farthestZ = Math.min(...this.items.map(o => getPos(o).z));

      for (const obj of this.items) {
        const pos = getPos(obj);
        pos.z += dz;

        if (pos.z > 10) {
          // recycle in front of farthest
          pos.z = farthestZ - 5;
          farthestZ = pos.z; // update farthest

          // resample X per-kind (keeps trees closer than buildings)
          const kind = detectKind(obj);
          if (kind?.resampleX) pos.x = kind.resampleX();
        }

        setPos(obj, pos);
      }
    }

    // ---------- External bands (if registered) ----------
    // Each band recycles independently using its own farthest
    for (const band of this.externalGroups) {
      if (!band?.items?.length) continue;

      let farthestZ = Math.min(...band.items.map(o => getPos(o).z));

      for (const obj of band.items) {
        const pos = getPos(obj);
        pos.z += dz;

        if (pos.z > 10) {
          pos.z = farthestZ - 5;
          farthestZ = pos.z;

          // Policy-driven reroll (maintain long-run ratios and lane anchors)
          if (band.policy && typeof band.policy.xAnchor === 'function') {
            const mix = typeof band.policy.mix === 'function'
              ? band.policy.mix()
              : { tree: 0.5, building: 0.5 };
            const roll = Math.random();
            const buildingP = typeof mix.building === 'number' ? mix.building : 0.5;
            const nextIsBuilding = roll < buildingP;
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
            // Fallback to kind-derived placement
            const kind = detectKind(obj);
            if (kind?.resampleX) pos.x = kind.resampleX();
          }
        }

        setPos(obj, pos);
      }
    }

    // ---------- Dirt pattern ----------
    if (this.dirtPattern?.patternEl) {
      const kids = Array.from(this.dirtPattern.patternEl.children);
      for (const circle of kids) {
        const pos = getPos(circle);
        pos.z += dz;
        if (pos.z > 10) {
          // Fixed reset for a steady tread look
          pos.z = -30;
        }
        setPos(circle, pos);
      }
    }
  }
}
