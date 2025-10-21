// src/scene/policy/ScenePolicy.js
import { DefaultPolicy } from "./DefaultPolicy.js";

export class ScenePolicy {
  constructor(cfg) {
    this.cfg = cfg;
    this.bands = (cfg.bands || []).map(b => this.#makeBandPolicy(b, cfg.globals || {}));
  }

  get defaultPolicy() {
    // Fallback to a DefaultPolicy if something’s off
    return this.bands[0] || DefaultPolicy;
  }

  #makeBandPolicy(band, globals) {
    // read values or fall back to globals (then DefaultPolicy)
    const mix     = band.mix     || DefaultPolicy.mix();
    const x       = band.x       || { tree: DefaultPolicy.xAnchor('tree', 1), building: DefaultPolicy.xAnchor('building', 1) };
    const spacing = band.spacing ?? globals.spacing ?? DefaultPolicy.spacing();
    const density = band.density ?? globals.density ?? DefaultPolicy.density();
    const jitterX = band.jitterX ?? globals.jitterX ?? DefaultPolicy.jitterX();
    const zStart  = band.zStart  ?? globals.zStart  ?? DefaultPolicy.zRange().start;
    const zEnd    = band.zEnd    ?? globals.zEnd    ?? DefaultPolicy.zRange().end;

    // Return a BandPolicy-like object (pure, no DOM)
    return {
      name: band.name || "band",
      mix() { return { ...mix }; },
      xAnchor(kind, side) {
        const base = kind === 'building' ? x.building : x.tree;
        return side * base;
      },
      spacing() { return spacing; },
      density() { return density; },
      jitterX() { return jitterX; },
      zRange() { return { start: zStart, end: zEnd }; }
    };
  }
}
export default ScenePolicy;
