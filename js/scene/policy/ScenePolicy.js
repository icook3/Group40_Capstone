// src/scene/policy/ScenePolicy.js
import { DefaultPolicy } from "./DefaultPolicy.js";

export class ScenePolicy {
  constructor(cfg) {
    this.cfg = cfg;
    this.bands = (cfg.bands || []).map(b => this.#makeBandPolicy(b, cfg.globals || {}));
  }

  get defaultPolicy() {
    return this.bands[0] || DefaultPolicy;
  }

  logBands() {
    console.group("[bands] Loaded policies");
    this.bands.forEach((b, i) => {
      const { start, end } = b.zRange();
      console.log(`#${i + 1}: ${b.name}`, {
        zRange: { start, end },
        spacing: b.spacing(),
        density: b.density(),
        jitterX: b.jitterX(),
        mix: b.mix()
      });
    });
    console.groupEnd();
  }

  // Used only by ScenePolicy methods themselves (not inside band policy objects)
  _band(bandName) {
    return this.cfg?.bands?.find(b => b.name === bandName) || null;
  }

  #makeBandPolicy(band, globals) {
    // Helpers that accept function or constant values
    const valOf = (v, ...args) =>
      (typeof v === 'function') ? v(...args) : v;

    const or = (...vals) => vals.find(v => v !== undefined && v !== null);

    // Precompute defaults (but don’t call functions here)
    const defaultMix     = DefaultPolicy.mix();
    const defaultSpacing = DefaultPolicy.spacing();
    const defaultDensity = DefaultPolicy.density();
    const defaultJitterX = DefaultPolicy.jitterX();
    const defaultZRange  = DefaultPolicy.zRange();

    const x = band.x || {
      tree: DefaultPolicy.xAnchor('tree', 1),
      building: DefaultPolicy.xAnchor('building', 1)
    };

    return {
      name: band.name || "band",

      // May be object or function; always return an object
      mix(z) {
        const m = or(valOf(band.mix, z), defaultMix);
        return typeof m === 'object' ? { ...m } : defaultMix;
      },

      xAnchor(kind, side) {
        const base = (kind === 'building' ? x.building : x.tree);
        return side * base;
      },

      spacing(z) {
        return or(valOf(band.spacing, z), globals.spacing, defaultSpacing);
      },

      density(z) {
        return or(valOf(band.density, z), globals.density, defaultDensity);
      },

      jitterX(z) {
        return or(valOf(band.jitterX, z), globals.jitterX, defaultJitterX);
      },

      // Keep objects within a lateral lane
      clampX(kind, side, xVal) {
        const laneHalfWidth = or(band.laneHalfWidth, globals.laneHalfWidth, 1.5);
        const anchor = this.xAnchor(kind, side);
        const min = anchor - laneHalfWidth;
        const max = anchor + laneHalfWidth;
        return Math.max(min, Math.min(max, xVal));
      },

      zRange() {
        const start = or(band.zStart, globals.zStart, defaultZRange.start);
        const end   = or(band.zEnd,   globals.zEnd,   defaultZRange.end);
        return { start, end };
      },

      // PHASE 7: these accept (bandName, ...) for compatibility, but use the closed-over `band`
      yOffset(_bandName, kind, z) {
        const f = band.yOffset;
        return (typeof f === 'function') ? f(band.name, kind, z) : (band.yOffset ?? 0);
      },

      scale(_bandName, kind, z) {
        const f = band.scale;
        const val = (typeof f === 'function') ? f(band.name, kind, z) : (band.scale ?? 1);
        if (typeof val === 'number') return { x: val, y: val, z: val };
        return { x: val?.x ?? 1, y: val?.y ?? 1, z: val?.z ?? 1 };
      },

      zJitter(_bandName, z) {
        const f = band.zJitter;
        return (typeof f === 'function') ? f(band.name, z) : (band.zJitter ?? 0);
      },

      // Seeded RNG per band (fallback to Math.random)
      rng(_bandName) {
        if (!band?.seed) return Math.random;
        let t = band.seed >>> 0; // mulberry32
        return function() {
          t += 0x6D2B79F5;
          let r = Math.imul(t ^ (t >>> 15), 1 | t);
          r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
          return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
        };
      }
    };
  }
}

export default ScenePolicy;

