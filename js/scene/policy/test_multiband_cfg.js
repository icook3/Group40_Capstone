// js/scene/policy/test_multiband_cfg_v7.js
// Phase 7 – Adds vertical (yOffset), scale, and z-jitter variety + optional seeded RNG.

export const test_multiband_cfg_v7 = {
  globals: {
    spacing: 6,        // default spacing if band doesn’t override
    density: 0.4,      // default density
    jitterX: 0.4,      // ± lateral variation
    zStart: 10,
    zEnd: -220
  },

  bands: [
    {
      name: "near",
      mix: { tree: 1.0, building: 0.0 },
      x: { tree: 32, building: 40 },
      jitterX: 0.3,
      laneHalfWidth: 0.5,
      spacing: 12.0,
      density: 0,

      // Phase 7 additions
      yOffset: (band, kind, z) => (kind === 'building' ? 0.15 : 0), // buildings slightly raised
      scale: (band, kind, z) =>
        kind === 'tree'
          ? { x: 1.0, y: 1.0, z: 1.0 }
          : { x: 1.05, y: 1.05, z: 1.05 }, // subtle building size bump
      zJitter: (band, z) => 0.6, // ±0.6m random row offset
      seed: 1337
    },

    {
      name: "mid",
      mix: { tree: 0.5, building: 0.5 },
      x: { tree: 46, building: 58 },
      jitterX: 0.4,
      laneHalfWidth: 0.5,
      spacing: 6.0,
      density: 0.45,

      // Phase 7 additions
      yOffset: (band, kind, z) => (kind === 'building' ? 0.2 : 0),
      scale: (band, kind, z) =>
        kind === 'tree'
          ? { x: 1.0, y: 1.0, z: 1.0 }
          : { x: 1.08, y: 1.08, z: 1.08 },
      zJitter: (band, z) => 0.8,
      seed: 202507
    },

    {
      name: "far",
      mix: { tree: 0.3, building: 0.7 },
      x: { tree: 60, building: 72 },
      jitterX: 0.5,
      laneHalfWidth: 0.5,
      spacing: 8.0,
      density: 0.7,

      // Phase 7 additions
      yOffset: (band, kind, z) => (kind === 'building' ? 0.25 : 0),
      scale: (band, kind, z) =>
        kind === 'tree'
          ? { x: 1.0, y: 1.0, z: 1.0 }
          : { x: 1.12, y: 1.12, z: 1.12 },
      zJitter: (band, z) => 0,
      seed: 987654
    }
  ]
};

export default test_multiband_cfg_v7;

