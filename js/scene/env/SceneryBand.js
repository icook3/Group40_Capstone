// js/scene/env/SceneryBand.js
import { getPos, setPos } from '../core/util.js';
import { TreeKind } from '../objects/kinds/Tree.js';
import { BuildingKind } from '../objects/kinds/Building.js';

/** Tweakable settings for this band (single source of truth in this file). */
const SCENERY_BAND_DEFAULTS = {
  treeX: 50,          // X position for trees at terrain edge (m)
  buildingX: 65,      // X position for buildings (slightly farther out) (m)
  zStart: 10,         // Start Z (closest to rider) (m)
  zEnd: -200,         // End Z (farthest away) (m)
  step: 5,            // Z spacing between items (m)
  buildingChance: 0.5,// Probability an item is a building (0..1)
  jitter: 0.5         // ±X jitter so the line looks organic (m)
};

/**
 * Static "actual edge" band. Builds once across a Z range.
 * No advance(), no recycle. Pure decoration at the terrain edges.
 */
export class SceneryBand {
  constructor({
    sceneEl,
    policy = null,
    name = 'band',
    treeX = SCENERY_BAND_DEFAULTS.treeX,
    buildingX = SCENERY_BAND_DEFAULTS.buildingX,
    zStart = SCENERY_BAND_DEFAULTS.zStart,
    zEnd = SCENERY_BAND_DEFAULTS.zEnd,
    step = SCENERY_BAND_DEFAULTS.step,
    buildingChance = SCENERY_BAND_DEFAULTS.buildingChance,
    jitter = SCENERY_BAND_DEFAULTS.jitter
  }) {
    this.sceneEl = sceneEl;
    this.policy = policy;
    this.name = name;

    this.treeX = treeX;
    this.buildingX = buildingX;
    this.zStart = zStart;
    this.zEnd = zEnd;
    this.step = step;
    this.buildingChance = buildingChance;
    this.jitter = jitter;

    this.items = [];

    for (const side of [-1, 1]) {
      for (let z = zStart; z > zEnd; z -= step) {
        const isBuilding = Math.random() < buildingChance;
        const kindName = isBuilding ? 'building' : 'tree';
        const anchorX = this.policy
          ? this.policy.xAnchor(kindName, side)                
          : (isBuilding ? buildingX : treeX) * side;
        const obj = isBuilding
          ? BuildingKind.spawn(this.sceneEl, z)
          : TreeKind.spawn(this.sceneEl, z);

        obj.setAttribute('zlow-band', 'edge-line');
        obj.setAttribute('zlow-side', side === 1 ? 'right' : 'left');
        obj.setAttribute('zlow-edge-x', String(anchorX));
        obj.setAttribute('zlow-band-name', this.name);
        obj.setAttribute('zlow-kind', kindName);

        const pos = getPos(obj);
        const jitterAmp = this.policy ? this.policy.jitterX() : jitter;
        pos.x = anchorX + (Math.random() * 2 - 1) * jitterAmp;
        if(this.policy) {
          const sideSign = side;
          pos.x =this.policy.clampX(kindName, sideSign, pos.x);
        }
        setPos(obj, pos);

        this.items.push(obj);
      }
    }
  }
}

