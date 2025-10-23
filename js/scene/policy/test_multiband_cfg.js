// src/scene/policy/test_multiband_cfg.js
export const test_multiband_cfg = {
  globals: {
    spacing: 5,    // distance between spawned objects along z
    density: 0.7,  // chance of spawning a 2nd object at same z
    jitterX: 0.4,  // fallback jitter amplitude (unused if band defines it)
    zStart: 10,
    zEnd: -200
  },
  bands: [
    { name: "near", mix:{tree:1.0,building:0.0}, x:{tree:32, building:40}, jitterX:0.3, laneHalfWidth:1.0 },
    { name: "mid",  mix:{tree:0.5,building:0.5}, x:{tree:46, building:58}, jitterX:0.4, laneHalfWidth:1.5 },
    { name: "far",  mix:{tree:0.3,building:0.7}, x:{tree:60, building:72}, jitterX:0.5, laneHalfWidth:2.0 }
  ]
};
export default test_multiband_cfg;
