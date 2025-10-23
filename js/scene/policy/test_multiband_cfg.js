// Phase 8 – adds a STATIC edge band that’s managed by the same policy system.
export const test_multiband_cfg= {
  globals: {
    spacing: 6,
    density: 0.4,
    jitterX: 0.4,
    zStart: 10,
    zEnd: -220
  },
  bands: [
    // NEW: fixed edge band (static build, no advance/recycle)
    {
      name: "edge",
      static: true,                // <- Phase 8 flag
      mix: { tree: 0.5, building: 0.5 },
      x:   { tree: 50, building: 65 },
      spacing: 5,
      density: 0.0,                // keep dense by spacing instead of doubles
      jitterX: 0.6,
      laneHalfWidth: 0.8,          // clamp tighter to the lane
      zStart: 10,
      zEnd: -200,
      // Phase 7 hooks still work here:
      yOffset: (_band, kind) => (kind === 'building' ? 0.1 : 0),
      scale:   (_band, kind) => (kind === 'building' ? 1.06 : 1.0),
      zJitter: () => 0.4,
      seed: 424242
    },

    // keep your previous near/mid/far bands from v7:
    {
      name: "near",
      mix: { tree: 1.0, building: 0.0 },
      x: { tree: 32, building: 40 },
      jitterX: 0.3,
      laneHalfWidth: 1.0,
      spacing: 4.0,
      density: 0.2,
      yOffset: (_band, kind) => (kind === 'building' ? 0.15 : 0),
      scale:   (_band, kind) => (kind === 'building' ? 1.05 : 1.0),
      zJitter: () => 0.6,
      seed: 1337
    },
    {
      name: "mid",
      mix: { tree: 0.5, building: 0.5 },
      x: { tree: 46, building: 58 },
      jitterX: 0.4,
      laneHalfWidth: 1.5,
      spacing: 6.0,
      density: 0.45,
      yOffset: (_band, kind) => (kind === 'building' ? 0.2 : 0),
      scale:   (_band, kind) => (kind === 'building' ? 1.08 : 1.0),
      zJitter: () => 0.8,
      seed: 202507
    },
    {
      name: "far",
      mix: { tree: 0.3, building: 0.7 },
      x: { tree: 60, building: 72 },
      jitterX: 0.5,
      laneHalfWidth: 2.0,
      spacing: 8.0,
      density: 0.7,
      yOffset: (_band, kind) => (kind === 'building' ? 0.25 : 0),
      scale:   (_band, kind) => (kind === 'building' ? 1.12 : 1.0),
      zJitter: () => 1.0,
      seed: 987654
    }
  ]
};
export default test_multiband_cfg;

