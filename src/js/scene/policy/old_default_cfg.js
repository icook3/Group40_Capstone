// src/scene/policy/old_default_cfg.js
export const old_default_cfg = {
  globals: {
    spacing: 5,
    density: 0.7,
    jitterX: 0.5,
    zStart: 10,
    zEnd: -200
  },
  bands: [
    {
      name: "default",
      mix: { tree: 0.5, building: 0.5 },
      x:   { tree: 50,  building: 65 }
      // spacing/density/jitterX/zStart/zEnd will fall back to globals
    }
  ]
};
export default old_default_cfg;