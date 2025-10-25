// js/scene/env/SceneryBand.js
import { getPos, setPos } from '../core/util.js';
import { TreeKind } from '../objects/kinds/Tree.js';
import { BuildingKind } from '../objects/kinds/Building.js';

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

    const rand =
      (typeof this.policy?.rng === 'function' ? this.policy.rng(this.name) : null) ||
      Math.random;

    for (const side of [-1, 1]) {
      const spacingVal = (() => {
        const f = this.policy?.spacing;
        if (typeof f === 'function') {
          try { return f(this.name, this.zStart); } catch { return f(); }
        }
        return step;
      })();

      for (let z = zStart; z > zEnd; z -= spacingVal) {
        const zJ = (() => {
          const f = this.policy?.zJitter;
          if (typeof f === 'function') {
            try { return f(this.name, z) ?? 0; } catch { return f(z) ?? 0; }
          }
          return 0;
        })();
        const zPlace = z + ((rand() * 2) - 1) * zJ;

        const mix = (() => {
          const f = this.policy?.mix;
          if (typeof f === 'function') {
            try { return f(this.name, zPlace) || {}; } catch { return f() || {}; }
          }
          return {};
        })();
        const buildingP =
          typeof mix.building === 'number' ? mix.building : buildingChance;
        const isBuilding = rand() < buildingP;
        const kindName = isBuilding ? 'building' : 'tree';

        const anchorX = this.policy
          ? this.policy.xAnchor(kindName, side)
          : (isBuilding ? buildingX : treeX) * side;

        const obj = isBuilding
          ? BuildingKind.spawn(this.sceneEl, zPlace)
          : TreeKind.spawn(this.sceneEl, zPlace);

        obj.setAttribute('zlow-band', 'edge-line');
        obj.setAttribute('zlow-side', side === 1 ? 'right' : 'left');
        obj.setAttribute('zlow-edge-x', String(anchorX));
        obj.setAttribute('zlow-band-name', this.name);
        obj.setAttribute('zlow-kind', kindName);

        const pos = getPos(obj);
        const jitterAmp = (() => {
          const f = this.policy?.jitterX;
          if (typeof f === 'function') {
            try { return f(this.name, zPlace) ?? jitter; } catch { return f() ?? jitter; }
          }
          return jitter;
        })();
        let x = anchorX + (rand() - 0.5) * jitterAmp;

        if (typeof this.policy?.clampX === 'function') {
          const sideSign = side;
          x = this.policy.clampX(kindName, sideSign, x);
        }

        // yOffset still applied, but no scaling at all
        const yOff = (() => {
          const f = this.policy?.yOffset;
          if (typeof f === 'function') {
            try { return f(this.name, kindName, zPlace) ?? 0; } catch { return f(kindName, zPlace) ?? 0; }
          }
          return 0;
        })();

        pos.x = x;
        pos.y = (pos.y ?? 0) + yOff;
        setPos(obj, pos);

        this.items.push(obj);

        // second spawn (density)
        const zPlace2 = zPlace + (rand() * 0.8 + 0.2);
        const density = (() => {
          const f = this.policy?.density;
          if (typeof f === 'function') {
            try { return f(this.name, zPlace2) ?? 0; } catch { return f() ?? 0; }
          }
          return 0;
        })();
        if (rand() < density) {
          const secondSide = -side;
          const mix2 = (() => {
            const f = this.policy?.mix;
            if (typeof f === 'function') {
              try { return f(this.name, zPlace2) || {}; } catch { return f() || {}; }
            }
            return mix;
          })();
          const buildingP2 =
            typeof mix2.building === 'number' ? mix2.building : buildingChance;
          const isBuilding2 = rand() < buildingP2;
          const kindName2 = isBuilding2 ? 'building' : 'tree';

          const anchorX2 = this.policy
            ? this.policy.xAnchor(kindName2, secondSide)
            : (isBuilding2 ? buildingX : treeX) * secondSide;

          const obj2 = isBuilding2
            ? BuildingKind.spawn(this.sceneEl, zPlace2)
            : TreeKind.spawn(this.sceneEl, zPlace2);

          obj2.setAttribute('zlow-band', 'edge-line');
          obj2.setAttribute('zlow-side', secondSide === 1 ? 'right' : 'left');
          obj2.setAttribute('zlow-edge-x', String(anchorX2));
          obj2.setAttribute('zlow-band-name', this.name);
          obj2.setAttribute('zlow-kind', kindName2);

          const pos2 = getPos(obj2);
          const jitterAmp2 = (() => {
            const f = this.policy?.jitterX;
            if (typeof f === 'function') {
              try { return f(this.name, zPlace2) ?? jitter; } catch { return f() ?? jitter; }
            }
            return jitter;
          })();
          let x2 = anchorX2 + (rand() - 0.5) * jitterAmp2;
          if (typeof this.policy?.clampX === 'function') {
            x2 = this.policy.clampX(kindName2, secondSide, x2);
          }

          const yOff2 = (() => {
            const f = this.policy?.yOffset;
            if (typeof f === 'function') {
              try { return f(this.name, kindName2, zPlace2) ?? 0; } catch { return f(kindName2, zPlace2) ?? 0; }
            }
            return 0;
          })();

          pos2.x = x2;
          pos2.y = (pos2.y ?? 0) + yOff2;
          setPos(obj2, pos2);

          this.items.push(obj2);
        }
      }
    }
  }
}


