// src/scene/policy/DefaultPolicy.js
// Phase 1 placeholder: documents current defaults in one spot.
// Not wired to anything yet, so behavior is unchanged.

const DEFAULTS = {
  // Current project-wide feel (adjust later via config)
  mix: { tree: 0.5, building: 0.5 }, // 50/50
  x:   { tree: 50,  building: 65  }, // near-shoulder lane centers
  spacing: 5,                        // meters between z placements
  density: 0.7,                      // chance of a second object at same z
  jitterX: 0.5,                      // ±(jitterX/2) used today
  zStart: 10,
  zEnd:  -200
};

export const DefaultPolicy = {
  /** @returns {{tree:number, building:number}} */
  mix(/* z */) {
    return { ...DEFAULTS.mix };
  },

  /**
   * @param {'tree'|'building'} kind
   * @param {-1|1} side
   * @returns {number}
   */
  xAnchor(kind, side) {
    const base = kind === 'building' ? DEFAULTS.x.building : DEFAULTS.x.tree;
    return side * base;
  },

  /** @returns {number} meters between spawns */
  spacing(/* z */) {
    return DEFAULTS.spacing;
  },

  /** @returns {number} 0..1 chance of second object at same Z */
  density(/* z */) {
    return DEFAULTS.density;
  },

  /** @returns {number} max lateral jitter amplitude */
  jitterX(/* z */) {
    return DEFAULTS.jitterX;
  },

  /** @returns {{start:number, end:number}} */
  zRange() {
    return { start: DEFAULTS.zStart, end: DEFAULTS.zEnd };
  }
};

export default DefaultPolicy;
