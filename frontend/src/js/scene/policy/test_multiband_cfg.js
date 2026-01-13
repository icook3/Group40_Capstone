// Phase 8 – adds a STATIC edge band that’s managed by the same policy system.
export const test_multiband_cfg= {
globals: {
  // Lane planner (guarantees no overlap)
  innerStartX: 30,     // center X for the innermost lane (per side)
  laneGap: 0.6,        // clear space between adjacent lane edges
  laneHalfWidth: 1.5,  // default half-width if a band omits its own
  maxX: 85,            // terrain guardrail (for warnings)

  // Defaults for spawn behavior
  spacing: 6,
  density: 0.4,
  jitterX: 0.4,
  zStart: 10,
  zEnd: -220,
},

bands: [
  // Static edge band (built once, uses planner's center; no manual x)
  {
    name: "edge",
    order: 3,                 // outermost
    static: true,
    laneHalfWidth: 0.8,
    spacing: 5,
    density: 0.0,
    jitterX: 0.6,
    zStart: 10,
    zEnd: -200,
    // optional gentle nudge for buildings inside the lane:
    kindOffset: { tree: 0, building: 0 },  // meters; keep 0 unless you really want a shift
    yOffset: (_band, kind) => (kind === 'building' ? 0.1 : 0),
    scale:   (_band, kind) => (kind === 'building' ? 1.06 : 1.0),
    zJitter: () => 0.4,
    seed: 424242
  },

  // Near / Mid / Far (no x fields; planner handles centers)
  {
    name: "near",
    order: 0,                 // innermost dynamic lane
    laneHalfWidth: 1.0,
    spacing: 4.0,
    density: 0.2,
    jitterX: 0.3,
    yOffset: (_band, kind) => (kind === 'building' ? 0.15 : 0),
    scale:   (_band, kind) => (kind === 'building' ? 1.05 : 1.0),
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
    yOffset: (_band, kind) => (kind === 'building' ? 0.2 : 0),
    scale:   (_band, kind) => (kind === 'building' ? 1.08 : 1.0),
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
    yOffset: (_band, kind) => (kind === 'building' ? 0.25 : 0),
    scale:   (_band, kind) => (kind === 'building' ? 1.12 : 1.0),
    zJitter: () => 1.0,
    seed: 987654
  }
]

};
export default test_multiband_cfg;

