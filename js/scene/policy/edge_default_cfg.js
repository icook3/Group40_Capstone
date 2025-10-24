// js/scene/policy/edge_default_cfg.js
// Format mirrors test_multiband_cfg.js (globals + bands array)

const edge_default_cfg = {
  globals: {
    // Lane planner (no overlap), identical key names
    innerStartX: 30,      // center X for the innermost lane (per side)
    laneGap: 0.6,         // clear space between adjacent lane edges
    laneHalfWidth: 1.5,   // default half-width if a band omits its own
    maxX: 85,             // terrain guardrail (for warnings)

    // Default spawn behavior (used if band omits a value)
    spacing: 6,
    density: 0.4,
    jitterX: 0.4,
    zStart: 10,
    zEnd: -220,
  },

  bands: [
    // EDGE LINE — make this look like old EdgeBand
    {
      name: "edge",
      order: 3,               // outermost (planner puts it furthest from center)
      static: true,           // built once (no per-frame advance)
      laneHalfWidth: 0.8,     // narrow “strip”
      // Edge cadence & look:
      spacing: 5,             // rows every 5 m (EdgeBand)
      density: 0.0,           // one object per row (no doubles by default)
      jitterX: 0.0,           // crisp edge (EdgeBand had ~no wiggle)
      zStart: 10,
      zEnd: -200,
      // Nudge buildings outward within the lane to approximate ±65 vs trees at ±50
      // (Planner sets lane center near ±50; this pushes buildings another ~15 m)
      kindOffset: { tree: 0, building: 15 },
      // Subtle presentation tweaks (optional)
      yOffset: (_band, kind) => (kind === 'building' ? 0.1 : 0),
      scale:   (_band, kind) => (kind === 'building' ? 1.06 : 1.0),
      zJitter: () => 0.4,
      seed: 424242
    },

    // You can add more bands below (same shape as test_multiband_cfg),
    // e.g., near/mid/far lanes. Shown here as a light starter set:

    {
      name: "near",
      order: 0,
      laneHalfWidth: 1.0,
      spacing: 4.0,
      density: 0.2,
      jitterX: 0.3,
      yOffset: (_b, k) => (k === 'building' ? 0.15 : 0),
      scale:   (_b, k) => (k === 'building' ? 1.05 : 1.0),
      zJitter: () => 0.6,
      seed: 1337
    },
    {
      name: "mid",
      order: 1,
      laneHalfWidth: 1.5,
      spacing: 6.0,
      density: 0.45,
      jitterX: 0.4,
      yOffset: (_b, k) => (k === 'building' ? 0.2 : 0),
      scale:   (_b, k) => (k === 'building' ? 1.08 : 1.0),
      zJitter: () => 0.8,
      seed: 202507
    },
    {
      name: "far",
      order: 2,
      laneHalfWidth: 2.0,
      spacing: 8.0,
      density: 0.7,
      jitterX: 0.5,
      yOffset: (_b, k) => (k === 'building' ? 0.25 : 0),
      scale:   (_b, k) => (k === 'building' ? 1.12 : 1.0),
      zJitter: () => 1.0,
      seed: 987654
    }
  ]
};

export default edge_default_cfg;
