// src/scene/policy/test_multiband_cfg.js
export const test_multiband_cfg = {
  globals: {
    spacing: 5,
    density: 0.7,
    jitterX: 0.5,
    zStart: 10,
    zEnd: -200
  },
bands: [
  { name: "near", mix:{tree:0.5,building:0.5}, x:{tree:50, building:65} },
  { name: "mid",  mix:{tree:0.5,building:0.5}, x:{tree:55, building:70} },
  { name: "far",  mix:{tree:0.5,building:0.5}, x:{tree:60, building:75} } 
]
};
export default test_multiband_cfg;
