export const test_multiband_cfg = {
  globals: {
    spacing: 6,    // default, used only if a band doesn’t set it
    density: 0.40, // default, used only if a band doesn’t set it
    jitterX: 0.4,
    zStart: 10,
    zEnd: -220
  },
  bands: [
    // Near: tighter rows, but mostly single objects
    { name: "near",
      mix:{ tree: 1.0, building: 0.0 },
      x:{ tree: 32,  building: 40 },
      jitterX: 0.30,
      laneHalfWidth: 1.0,
      spacing: 4.0,
      density: 0.20
    },

    // Mid: moderate rows, balanced density
    { name: "mid",
      mix:{ tree: 0.5, building: 0.5 },
      x:{ tree: 46,  building: 58 },
      jitterX: 0.40,
      laneHalfWidth: 1.5,
      spacing: 6.0,
      density: 0.45
    },

    // Far: wider rows, higher chance of a second spawn
    { name: "far",
      mix:{ tree: 0.3, building: 0.7 },
      x:{ tree: 60,  building: 72 },
      jitterX: 0.50,
      laneHalfWidth: 2.0,
      spacing: 8.0,
      density: 0.70
    }
  ]
};

export default test_multiband_cfg;
