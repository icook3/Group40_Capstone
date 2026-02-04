// src/scene/policy/ScenePolicy.js
import { DefaultPolicy } from "./DefaultPolicy.js";

export class ScenePolicy {
// ScenePolicy.js — inside the class

constructor(cfg) {
  this.cfg = cfg;
  this.bands = (cfg.bands || []).map(b => this.#makeBandPolicy(b, cfg.globals || {}));
  this.layout = this.#computeLayout(cfg); // <- NEW
}

// Returns: { [bandName]: { left: number, right: number } }
#computeLayout(cfg) {
  const globals = cfg.globals || {};
  const innerStartX = globals.innerStartX ?? 30;
  const laneGap     = globals.laneGap     ?? 0.6;
  const defaultHalf = globals.laneHalfWidth ?? 1.5;
  const maxX        = globals.maxX ?? 9999;

  // Sort bands by desired order (fallback to their index)
  const ordered = (cfg.bands || [])
    .filter(Boolean)
    .map((b, i) => ({ ...b, _idx: i }))
    .sort((a, b) => (a.order ?? a._idx) - (b.order ?? b._idx));

  // Compute cumulative centers for one side, then mirror
  const planSide = (side) => {
    let centers = new Map();
    let prevCenter = innerStartX;      // center of last lane
    let prevHalf   = ordered.length ? (ordered[0].laneHalfWidth ?? defaultHalf) : defaultHalf;

    for (let i = 0; i < ordered.length; i++) {
      const band = ordered[i];
      const half = band.laneHalfWidth ?? defaultHalf;

      // First lane uses innerStartX, others are spaced by prevHalf + gap + half
      const center = (i === 0)
        ? innerStartX
        : prevCenter + prevHalf + laneGap + half;

      // Validation (optional): don’t push past terrain limit
      if (center + half > maxX) {
        console.warn(`[layout] ${band.name} (side ${side}) exceeds maxX: center=${center}, half=${half}, maxX=${maxX}`);
      }

      centers.set(band.name, side * center);
      prevCenter = center;
      prevHalf = half;
    }
    return centers;
  };

  const leftCenters  = planSide(-1);
  const rightCenters = planSide(+1);

  // Build final lookup: { bandName: {left, right} }
  const layout = {};
  for (const band of ordered) {
    layout[band.name] = {
      left:  leftCenters.get(band.name),
      right: rightCenters.get(band.name)
    };
  }
  return layout;
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
    const valOf = (v, ...args) => (typeof v === 'function') ? v(...args) : v;
    const or = (...vals) => vals.find(v => v !== undefined && v !== null);

    const defaultMix     = DefaultPolicy.mix();
    const defaultSpacing = DefaultPolicy.spacing();
    const defaultDensity = DefaultPolicy.density();
    const defaultJitterX = DefaultPolicy.jitterX();
    const defaultZRange  = DefaultPolicy.zRange();
    const defaultHalf    = globals.laneHalfWidth ?? 1.5;

    // Optional: small per-kind lane nudge inside the non-overlapping envelope
    const kindOffset = band.kindOffset || { tree: 0, building: 0 };

    const bandPolicy = {
      name: band.name || "band",

      mix(z)       { return or(valOf(band.mix, z), defaultMix); },
      spacing(z)   { return or(valOf(band.spacing, z), globals.spacing, defaultSpacing); },
      density(z)   { return or(valOf(band.density, z), globals.density, defaultDensity); },
      jitterX(z)   { return or(valOf(band.jitterX, z), globals.jitterX, defaultJitterX); },
      zRange()     {
        const start = or(band.zStart, globals.zStart, defaultZRange.start);
        const end   = or(band.zEnd,   globals.zEnd,   defaultZRange.end);
        return { start, end };
      },
      isStatic()   { return !!band.static; },

      // Non-overlap anchor uses the precomputed layout
      xAnchor(kind, side) {
        const lay = this.scenePolicy?.layout;
        const center = (side === -1)
          ? lay?.[band.name]?.left
          : lay?.[band.name]?.right;
        const offset = (kind === 'building' ? (kindOffset.building || 0) : (kindOffset.tree || 0));
        return center + (side * offset);
      },

      clampX(kind, side, xVal) {
        const half = or(band.laneHalfWidth, defaultHalf);
        const anchor = this.xAnchor(kind, side);
        const min = anchor - half;
        const max = anchor + half;
        if (xVal < min) return min;
        if (xVal > max) return max;
        return xVal;
      },

      // Phase 7 hooks
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
      rng(_bandName) {
        if (!band?.seed) return Math.random;
        let t = band.seed >>> 0;
        return function() {
          t += 0x6D2B79F5;
          let r = Math.imul(t ^ (t >>> 15), 1 | t);
          r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
          return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
        };
      },
      buildingSubtype(z) {
        const f = band.buildingSubtype;
        if (typeof f === 'function') {
          try { return f(z); } catch { return f(); }
        }
        return f ?? null;
      },
    };
    bandPolicy.scenePolicy = this;

    return bandPolicy;
  };
}

export default ScenePolicy;

