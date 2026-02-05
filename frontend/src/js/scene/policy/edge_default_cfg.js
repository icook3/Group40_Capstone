// js/scene/policy/five_band_city_cfg.js

// Helper for clamping 0..1 if you tweak weights later
const clamp01 = x => Math.max(0, Math.min(1, x));

const cfg = {
  // ------- GLOBALS -------
  globals: {
    // Lane planner
    innerStartX: 6,
    laneGap: 6,
    laneHalfWidth: 2,
    maxX: 60,

    // Defaults (bands may override)
    spacing: 6,          // meters between rows
    density: 0.3,        // chance of a 2nd spawn on opposite side
    jitterX: 0.35,       // lateral wiggle
    zStart: 10,
    zEnd: -220,

    // Z-exclusion & min-gap system knobs your SceneryBand understands
    zExclusion: 6.0,     // one item per side within ~one row
    minGapX: 1.2,        // if you still keep min-gap helpers around
    binSizeZ: 2.0,
    footprintRadii: { tree: 0.8, house: 1.1, 'tall-building': 1.6, 'wide-building': 2.3 },

    // Anchor buildings farther out than trees. Outer gets extra “bump”.
    xAnchor(kindName, side) {
      const baseTreeX = 50;
      const baseBldgX = 65;
      // If band name is available on `this.name`, ScenePolicy usually binds it.
      // Fallback: push buildings a bit more by default.
      const band = this.name || 'unknown';
      const bump =
        band === 'outer' ? 12 :
        band === 'mid2'  ? 8  :
        band === 'mid1'  ? 6  :
        band === 'near'  ? 4  : 2;
      const x = (kindName === 'building' ? baseBldgX + bump : baseTreeX) * side;
      return x;
    },

    // Respect guardrail
    clampX(kindName, side, x) {
      const lim = this.maxX ?? 85;
      const s = side < 0 ? -1 : 1;
      return s * Math.min(Math.abs(x), lim);
    },

    // Gentle Z jitter default (bands can override)
    zJitter: () => 0.6,

    // Subtle lift for buildings so bases read cleanly
    yOffset(_band, kind) {
      return kind === 'building' ? 0.12 : 0;
    }
  },

  // ------- BANDS (inner -> outer) -------
  bands: [
    // 0) INNER — closest: TREES ONLY, low density
    {
      name: 'inner',
      order: 0,
      laneHalfWidth: 4,
      spacing: 10,
      zExclusion: 7.5,
      density: 0.10,
      jitterX: 0.35,
      zJitter: () => 0.8,
      mix: () => ({ building: 0.0 }) // trees only
    },

    // 1) NEAR — trees only still, less spacing in between them
    {
      name: 'near',
      order: 1,
      laneHalfWidth: 4,
      spacing: 8,
      zExclusion: 10.0,
      density: 0.18,
      jitterX: 0.35,
      zJitter: () => 0.8,
      mix: () => ({ building: 0.0 }),
      // Subtype weights (now routed in BuildingKind.spawn)
      buildingSubtype: () => ({ tall: 0.00, wide: 0.00, house: 0.0 })
    },

    // 2) MID1 — mid density, balanced - 85% houses, 15% trees
    // Building total = 60%
    {
      name: 'mid1',
      order: 2,
      laneHalfWidth: 3,
      spacing: 9,
      zExclusion: 9,
      density: 0.40,
      jitterX: 0.35,
      zJitter: () => 0.7,
      mix: () => ({ building: 0.85 }),
      buildingSubtype: () => ({ tall: 0.00, wide: 0.00, house: 1 })
    },

    // 3) MID2 — mid/high density, all wide buildings no trees (eases into skyline)
    {
      name: 'mid2',
      order: 3,
      laneHalfWidth: 30,
      spacing: 100,
      zExclusion: 100.0,
      density: 0.00,
      jitterX: 20,
      zJitter: () => 0,
      mix: () => ({ building: 1.0 }),
      buildingSubtype: () => ({ tall: 0.0, wide: 1.0, house: 0.0 })
    },

    // 4) OUTER — STATIC skyline, one clean line, all tall buildings
    {
      name: 'outer',
      order: 4,
      //static: true,          // <-- important: this is your fixed band
      laneHalfWidth: 1.2,    // thin stripe → visually one line
      spacing: 10.0,          // tight Z spacing for “very dense” look
      zExclusion: 5.0,       // one-per-side per “row”
      density: 0.0,          // no doubles → truly one line
      jitterX: 0.05,         // crisp edge
      zJitter: () => 0.4,
      mix: () => ({ building: 1.0 }), // buildings only
      buildingSubtype: () => ({ tall: 1, wide: 0.0, house: 0.0 }),
      // Extra outward nudge so skyline sits farther from trees
      kindOffset: { tree: 0, building: 18 },
      yOffset: (_b, k) => (k === 'building' ? 0.15 : 0)
    }
  ]
};

export default cfg;

