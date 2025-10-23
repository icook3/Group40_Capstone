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
      
    // Phase 6: spacing() + density() from policy (with safe fallbacks)
    for (const side of [-1, 1]) {
      const bandSpacing = this.policy?.spacing?.() ?? step; // spacing per band (fallback to old step)
      for (let z = zStart; z > zEnd; z -= bandSpacing) {
        // --- 1) FIRST spawn at this z ---
        const mix = this.policy?.mix?.() || { tree: 1 - buildingChance, building: buildingChance };
        const isBuilding = Math.random() < (typeof mix.building === 'number' ? mix.building : 0.5);
        const kindName = isBuilding ? 'building' : 'tree';

        const anchorX = this.policy
          ? this.policy.xAnchor(kindName, side)
          : (isBuilding ? buildingX : treeX) * side;

        const obj = isBuilding ? BuildingKind.spawn(this.sceneEl, z)
                              : TreeKind.spawn(this.sceneEl, z);

        obj.setAttribute('zlow-band', 'edge-line');
        obj.setAttribute('zlow-side', side === 1 ? 'right' : 'left');
        obj.setAttribute('zlow-edge-x', String(anchorX));
        obj.setAttribute('zlow-band-name', this.name);
        obj.setAttribute('zlow-kind', kindName);

        {
          const pos = getPos(obj);
          const jitterAmp = this.policy?.jitterX?.() ?? jitter;
          // use centered jitter range [-0.5, 0.5] * amp for consistency
          let x = anchorX + (Math.random() - 0.5) * jitterAmp;
          if (this.policy?.clampX) {
            const sideSign = side;
            x = this.policy.clampX(kindName, sideSign, x);
          }
          pos.x = x;
          setPos(obj, pos);
        }

        this.items.push(obj);

        // --- 2) Optional second spawn at the same z (per-band density) ---
        const density = this.policy?.density?.() ?? 0; // default 0 if not defined
        if (Math.random() < density) {
          // choose same side or opposite for a bit of variety
          const secondSide = (Math.random() < 0.5) ? -side : side;

          const mix2 = this.policy?.mix?.() || mix;
          const isBuilding2 = Math.random() < (typeof mix2.building === 'number' ? mix2.building : 0.5);
          const kindName2 = isBuilding2 ? 'building' : 'tree';

          const anchorX2 = this.policy
            ? this.policy.xAnchor(kindName2, secondSide)
            : (isBuilding2 ? buildingX : treeX) * secondSide;

          const obj2 = isBuilding2 ? BuildingKind.spawn(this.sceneEl, z)
                                  : TreeKind.spawn(this.sceneEl, z);

          obj2.setAttribute('zlow-band', 'edge-line');
          obj2.setAttribute('zlow-side', secondSide === 1 ? 'right' : 'left');
          obj2.setAttribute('zlow-edge-x', String(anchorX2));
          obj2.setAttribute('zlow-band-name', this.name);
          obj2.setAttribute('zlow-kind', kindName2);

          const pos2 = getPos(obj2);
          const jitterAmp2 = this.policy?.jitterX?.() ?? jitter;
          let x2 = anchorX2 + (Math.random() - 0.5) * jitterAmp2;
          if (this.policy?.clampX) {
            x2 = this.policy.clampX(kindName2, secondSide, x2);
          }
          pos2.x = x2;
          setPos(obj2, pos2);

          this.items.push(obj2);
          }
        }
      }
    }
  }
