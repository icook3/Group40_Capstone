import { getPos, setPos } from '../core/util.js';
import { TreeKind } from '../objects/kinds/Tree.js';
import { BuildingKind } from '../objects/kinds/Building.js';

export class StaticBand {
  constructor({ sceneEl, bandPolicy }) {
    this.sceneEl = sceneEl;
    this.p = bandPolicy;     // the band-specific policy (already normalized)
    this.items = [];
    this.#init();
  }

  #spawn(side, z) {
    const rng = this.p.rng?.(this.p.name) || Math.random;
    const mix = this.p.mix(z) || { tree: 0.5, building: 0.5 };
    const isBuilding = (rng() < (typeof mix.building === 'number' ? mix.building : 0.5));
    const kind = isBuilding ? 'building' : 'tree';

    const anchorX = this.p.xAnchor(kind, side);
    const obj = isBuilding ? BuildingKind.spawn(this.sceneEl, z)
                           : TreeKind.spawn(this.sceneEl, z);

    // lateral jitter + clamp
    const pos = getPos(obj);
    const jitterAmp = this.p.jitterX(z) ?? 0;
    let x = anchorX + (rng() - 0.5) * jitterAmp;
    if (this.p.clampX) x = this.p.clampX(kind, side, x);

    // vertical & scale & z jitter (small, but consistent with Phase 7)
    const zPlace = z + ((rng() * 2) - 1) * (this.p.zJitter?.(this.p.name, z) ?? 0);
    const yOff = this.p.yOffset?.(this.p.name, kind, zPlace) ?? 0;
    const scl = this.p.scale?.(this.p.name, kind, zPlace) ?? { x:1, y:1, z:1 };
    const scale = (typeof scl === 'number') ? { x:scl, y:scl, z:scl } : scl;

    pos.x = x;
    pos.y = (pos.y ?? 0) + yOff;
    pos.z = zPlace;
    setPos(obj, pos);
    obj.setAttribute('scale', `${scale.x} ${scale.y} ${scale.z}`);
    this.items.push(obj);

    // EdgeBand behavior: if a WIDE building, push the next row an extra 5m back
    const btype = obj.getAttribute('zlow-building-type');
    const extraBack = (kind === 'building' && btype === 'wide-building') ? 5 : 0;
    return { extraBack };  
  }

  #init() {
    const { start, end } = this.p.zRange();
    const spacing = this.p.spacing();
    for (const side of [-1, 1]) {
     for (let z = start; z > end; ) {
       const { extraBack } = this.#spawn(side, z);
       z -= spacing + (extraBack || 0);
        // edge band usually looks best without doubles; if you want:
        // if ((this.p.density() ?? 0) > Math.random()) this.#spawn(-side, z);
      }
    }
  }
}
