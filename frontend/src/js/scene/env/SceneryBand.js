// js/scene/env/SceneryBand.js
import { TreeKind } from '../objects/kinds/Tree.js';
import { BuildingKind } from '../objects/kinds/Building.js';

/** Defaults (used if policy omits a value) */
const SCENERY_BAND_DEFAULTS = {
  treeX: 50,
  buildingX: 65,
  zStart: 10,
  zEnd: -200,
  step: 5,
  buildingChance: 0.5,
  jitter: 0.5
};

export class SceneryBand {
  constructor({
    scene,
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
    this.scene = scene;
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

    // RNG (seeded if policy supplies one)
    const rand =
      (typeof this.policy?.rng === 'function'
        ? this.policy.rng(this.name)
        : null) || Math.random;

    // Bind-aware clamp so policy methods keep their `this`
    const clampXBound = (kindName, side, x) => {
      if (typeof this.policy?.clampX !== 'function') return x;
      try { return this.policy.clampX.call(this.policy, kindName, side, x); }
      catch { return x; }
    };

    // spacing may be function or constant
    const spacingVal = (() => {
      const f = this.policy?.spacing;
      if (typeof f === 'function') {
        try { return f(this.name, this.zStart); } catch { return f(); }
      }
      return step;
    })();

    // Per-side Z exclusion: only ONE item within |Δz| < zExclusion
    const zPlacedBySide = { [-1]: [], [1]: [] };

    const zExclusionVal = (z) => {
      const v = (() => {
        const f = this.policy?.zExclusion;
        if (typeof f === 'function') {
          try { return f(this.name, z); } catch { return f(z); }
        }
        return this.policy?.zExclusion;
      })();
      const fallback = Math.max(spacingVal * 0.9, 2.0);
      return (typeof v === 'number' && v >= 0) ? v : fallback;
    };

    const canPlaceAtZ = (side, z) => {
      const win = zExclusionVal(z);
      const arr = zPlacedBySide[side];
      for (let i = arr.length - 1; i >= 0; --i) {
        const dz = Math.abs(arr[i] - z);
        if (dz < win) return false;
        if (arr[i] - z > win) break; // small opt when walking recent→old
      }
      return true;
    };

    const recordZ = (side, z) => {
      zPlacedBySide[side].push(z);
      // prune very old far-away entries to keep arrays short
      const keepFrom = Math.max(this.zEnd, z - 200);
      while (zPlacedBySide[side].length && zPlacedBySide[side][0] < keepFrom) {
        zPlacedBySide[side].shift();
      }
    };

    for (const side of [-1, 1]) {
      for (let z = zStart; z > zEnd; z -= spacingVal) {
        // Z jitter
        const zJ = (() => {
          const f = this.policy?.zJitter;
          if (typeof f === 'function') {
            try { return f(this.name, z) ?? 0; } catch { return f(z) ?? 0; }
          }
          return 0;
        })();
        const zPlace = z + ((rand() * 2) - 1) * zJ;

        // One item per side within the Z window
        if (!canPlaceAtZ(side, zPlace)) continue;

        // Mix (tree vs building)
        const mix = (() => {
          const f = this.policy?.mix;
          if (typeof f === 'function') {
            try { return f(this.name, zPlace) || {}; } catch { return f() || {}; }
          }
          return {};
        })();
        const buildingP =
          typeof mix.building === 'number' ? mix.building : this.buildingChance;

        const isBuilding = rand() < buildingP;
        const kindName = isBuilding ? 'building' : 'tree';

        // X anchor
        const anchorX = (this.policy && typeof this.policy.xAnchor === 'function')
          ? this.policy.xAnchor(kindName, side)
          : (isBuilding ? this.buildingX : this.treeX) * side;

        // Spawn
        const obj = isBuilding
          ? BuildingKind.spawn(this.scene, zPlace, this.policy)
          : TreeKind.spawn(this.scene, zPlace);

        obj.userData.zlowBand = "edge-line";
        obj.userData.zlowSide = side === 1 ? "right" : "left";
        obj.userData.zlowEdgeX = anchorX;
        obj.userData.bandName = this.name;
        obj.userData.zlowKind = kindName;

        const jitterAmp = (() => {
          const f = this.policy?.jitterX;
          if (typeof f === 'function') {
            try { return f(this.name, zPlace) ?? this.jitter; } catch { return f() ?? this.jitter; }
          }
          return this.jitter;
        })();

        let x = anchorX + (rand() - 0.5) * jitterAmp;
        x = clampXBound(kindName, side, x);

        const yOff = (() => {
          const f = this.policy?.yOffset;
          if (typeof f === 'function') {
            try { return f(this.name, kindName, zPlace) ?? 0; }
            catch { return f(kindName, zPlace) ?? 0; }
          }
          return 0;
        })();

        obj.position.x = x;
        if (x>0) {
          obj.rotation.set(0,Math.PI,0);
        }
        obj.position.y += yOff;

        // Record placement & keep
        recordZ(side, zPlace);
        this.items.push(obj);

        // Optional second spawn (density) on OPPOSITE side, also subject to Z exclusion
        const density = (() => {
          const f = this.policy?.density;
          if (typeof f === 'function') {
            try { return f(this.name, zPlace) ?? 0; }
            catch { return f() ?? 0; }
          }
          return 0;
        })();

        if (rand() < density) {
          const secondSide = -side;
          const zPlace2 = zPlace + (rand() * 0.8 + 0.2); // small forward nudge
          if (canPlaceAtZ(secondSide, zPlace2)) {
            const mix2 = (() => {
              const f = this.policy?.mix;
              if (typeof f === 'function') {
                try { return f(this.name, zPlace2) || {}; } catch { return f() || {}; }
              }
              return mix;
            })();

            const buildingP2 =
              typeof mix2.building === 'number' ? mix2.building : this.buildingChance;
            const isBuilding2 = rand() < buildingP2;
            const kindName2 = isBuilding2 ? 'building' : 'tree';

            const anchorX2 = (this.policy && typeof this.policy.xAnchor === 'function')
              ? this.policy.xAnchor(kindName2, secondSide)
              : (isBuilding2 ? this.buildingX : this.treeX) * secondSide;

            const obj2 = isBuilding2
              ? BuildingKind.spawn(this.scene, zPlace2, this.policy)
              : TreeKind.spawn(this.scene, zPlace2);

            obj2.userData.zlowBand = "edge-line";
            obj2.userData.zlowSide = secondSide === 1 ? "right" : "left";
            obj2.userData.zlowEdgeX = anchorX2;
            obj2.userData.bandName = this.name;
            obj2.userData.zlowKind = kindName2;

            const jitterAmp2 = (() => {
              const f = this.policy?.jitterX;
              if (typeof f === 'function') {
                try { return f(this.name, zPlace2) ?? this.jitter; } catch { return f() ?? this.jitter; }
              }
              return this.jitter;
            })();

            let x2 = anchorX2 + (rand() - 0.5) * jitterAmp2;
            x2 = clampXBound(kindName2, secondSide, x2);

            const yOff2 = (() => {
              const f = this.policy?.yOffset;
              if (typeof f === 'function') {
                try { return f(this.name, kindName2, zPlace2) ?? 0; } catch { return f(kindName2, zPlace2) ?? 0; }
              }
              return 0;
            })();

            obj2.position.x = anchorX2 + (rand() - 0.5) * jitter;
            if (obj2.position.x>0) {
              obj2.rotation.set(0,Math.PI,0);
            }
            obj2.position.y += yOff;

            recordZ(secondSide, zPlace2);
            this.items.push(obj2);
          }
        }
      }
    }
  }
}

