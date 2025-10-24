// js/scene/policy/edge_default_cfg.js
const globals = {
  // scene-wide defaults
  spacing: 6,            // default Z spacing (m) when band.spacing() not provided
  density: 0.4,          // probability to add a 2nd spawn at same Z
  jitterX: 0.4,          // lateral jitter amplitude (m)
  zStart: 10,
  zEnd: -220,
  innerStartX: 30,       // center X (m) for the innermost lane (per side)
  laneGap: 0.6,          // empty buffer between adjacent lanes (m)
  laneHalfWidth: 1.5,    // clamp half-width per lane (m)
  maxX: 85               // guardrail (terrain limit). Validation only.
};

// One entry per band (lane). Order controls inside→outside spacing in ScenePolicy.
const bands = [
  {
    name: "edge-line",
    // Per-band tweaks (override globals where desired)
    spacing: 5,                       // trees/buildings along edge look best at 5m
    mix: () => ({ tree: 0.5, building: 0.5 }),
    // Optional: small per-kind lateral nudges inside the lane envelope
    kindOffset: { tree: 0, building: 0 },
    // Optional Phase 7 hooks:
    // yOffset: (bandName, kind, z) => 0,
    // scale:   (bandName, kind, z) => 1,
    // zJitter: (bandName, z) => 0.5,
  },
  // Add more bands later (e.g., "middle-line") with their own overrides
];

export default { globals, bands };
