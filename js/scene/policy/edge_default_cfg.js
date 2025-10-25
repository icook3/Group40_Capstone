// js/scene/policy/edge_default_cfg.js
// 5-band setup: far = dense & mostly tall (static); near = trees only (dynamic)

const edge_default_cfg = {
  globals: {
    innerStartX: 30,
    laneGap: 0.6,
    laneHalfWidth: 1.4,
    maxX: 85,

    // defaults (bands override as needed)
    spacing: 6,
    density: 0.3,
    jitterX: 0.3,
    zStart: 10,
    zEnd: -220
  },

  bands: [
    // 0) CLOSEST — Trees only (dynamic)
    {
      name: "close-trees",
      order: 0,
      static: false,
      laneHalfWidth: 1.2,
      spacing: () => 5.6,                       // mildly tight
      density: () => 0.55 + Math.random()*0.15, // occasional double tree
      jitterX: () => 0.35 + Math.random()*0.15, // organic
      mix: () => ({ tree: 1.0, building: 0.0 }),// strictly trees
      scale: (_b, kind) => (kind === 'tree' ? 0.95 + Math.random()*0.10 : 1.0),
      yOffset: () => 0,
      zStart: 10, zEnd: -200,
      seed: 101
    },

    // 1) NEAR — Mostly trees; some houses; tall is rare (dynamic)
    {
      name: "near-mix",
      order: 1,
      static: false,
      laneHalfWidth: 1.3,
      spacing: () => 15.4 + Math.random()*0.3,
      density: () => 0.40 + Math.random()*0.15,
      jitterX: () => 0.30 + Math.random()*0.15,
      mix: () => ({ tree: 0.75, building: 0.25 }),
      buildingSubtype: () => {
        const r = Math.random();
        if (r < 0.85) return 'house';
        if (r < 0.999) return 'wide-building';
        return 'tall-building'; // ~2%
      },
      scale: (_b, kind) => (kind === 'building' ? 0.55 + Math.random()*0.10 : 1.0),
      yOffset: (_b, kind) => (kind === 'building' ? 0.05 : 0),
      zStart: 10, zEnd: -205,
      seed: 202
    },

    // 2) MID — balanced; a few more buildings; talls still uncommon (dynamic)
    {
      name: "mid-mix",
      order: 2,
      static: false,
      laneHalfWidth: 1.5,
      spacing: () => 15.0 + Math.random()*0.3,
      density: () => 0.50 + Math.random()*0.20,
      jitterX: () => 0.28 + Math.random()*0.15,
      mix: () => ({ tree: 0.55, building: 0.45 }),
      buildingSubtype: () => {
        const r = Math.random();
        if (r < 0.60) return 'house';
        if (r < 0.88) return 'wide-building';
        return 'tall-building'; // ~12%
      },
      scale: (_b, kind) => (kind === 'building' ? 1.05 + Math.random()*0.15 : 1.0),
      yOffset: (_b, kind) => (kind === 'building' ? 0.08 : 0),
      zStart: 10, zEnd: -212,
      seed: 303
    },

    // 3) OUTER — building-leaning; bigger & denser; more tall but not dominant (dynamic)
    {
      name: "outer-mix",
      order: 3,
      static: false,
      laneHalfWidth: 1.2,
      spacing: () => 54.6 + Math.random()*0.3,     // denser
      density: () => 0.60 + Math.random()*0.20,   // more doubles
      jitterX: () => 0.22 + Math.random()*0.12,   // crisper line
      mix: () => ({ tree: 0.30, building: 0.70 }),
      buildingSubtype: () => {
        const r = Math.random();
        if (r < 0.40) return 'house';
        if (r < 0.70) return 'wide-building';
        return 'tall-building'; // ~30%
      },
      scale: (_b, kind) => (kind === 'building' ? 1.12 + Math.random()*0.18 : 1.0),
      yOffset: (_b, kind) => (kind === 'building' ? 0.10 : 0),
      zStart: 10, zEnd: -220,
      seed: 404
    },

    // 4) FARTHEST — dense skyline; mostly tall buildings; STATIC
    {
      name: "far-skyline",
      order: 4,
      static: true,
      laneHalfWidth: 1.9,

      // Make it extremely dense & tight:
      spacing: () => 5,   
      density: () => 0.85 + Math.random() * 0.10, // almost every row doubles up
      jitterX: () => 0.12 + Math.random() * 0.05, // keep crisp but not perfectly uniform

      mix: () => ({ tree: 0.0, building: 1.0 }),  // buildings only

      // ~80% tall, with a bit of variety
      buildingSubtype: () => {
        const r = Math.random();
        if (r < 0.90) return 'tall-building';     // 80% tall
        if (r > 0.90) return 'wide-building';     // 10%
      },

      // Slightly larger scale for a skyline feel
      scale: () => 3.25 + Math.random() * 0.25,
      yOffset: () => 0.15,
      zStart: 10,
      zEnd: -230,
      seed: 505
    }
  ]
};

export default edge_default_cfg;
