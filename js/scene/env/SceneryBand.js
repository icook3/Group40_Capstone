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
    treeX = SCENERY_BAND_DEFAULTS.treeX,
    buildingX = SCENERY_BAND_DEFAULTS.buildingX,
    zStart = SCENERY_BAND_DEFAULTS.zStart,
    zEnd = SCENERY_BAND_DEFAULTS.zEnd,
    step = SCENERY_BAND_DEFAULTS.step,
    buildingChance = SCENERY_BAND_DEFAULTS.buildingChance,
    jitter = SCENERY_BAND_DEFAULTS.jitter
  }) {
    this.sceneEl = sceneEl;
    this.items = [];
    this.treeX = treeX;
    this.buildingX = buildingX;

    for (const side of [-1, 1]) {
      for (let z = zStart; z > zEnd; z -= step) {
        const isBuilding = Math.random() < buildingChance;
        const anchorX = side * (isBuilding ? buildingX : treeX);

        const obj = isBuilding
          ? BuildingKind.spawn(this.sceneEl, z)
          : TreeKind.spawn(this.sceneEl, z);

        obj.setAttribute('zlow-band', 'edge-line');
        obj.setAttribute('zlow-side', side === 1 ? 'right' : 'left');
        obj.setAttribute('zlow-edge-x', String(anchorX));

        const pos = getPos(obj);
        pos.x = anchorX + (Math.random() - 0.5) * jitter; // tiny jitter ±0.5 m
        setPos(obj, pos);

        this.items.push(obj);
      }
    }
  }
}

