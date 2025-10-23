// js/scene/env/SceneryManager.js 
import cfg from '../policy/test_multiband_cfg.js';
import { ScenePolicy } from '../policy/ScenePolicy.js';
import { StaticBand } from './StaticBand.js';
import { SceneryBand } from './SceneryBand.js'; // your dynamic band impl

export class SceneryManager {
  constructor({ sceneEl }) {
    this.sceneEl = sceneEl;
    this.scenePolicy = new ScenePolicy(cfg);
    const all = this.scenePolicy.bands;

    // Build static bands
    this.staticBands = all
      .filter(b => b.isStatic && b.isStatic())
      .map(b => new StaticBand({ sceneEl, bandPolicy: b }));

    // Build dynamic bands
    this.bands = all
      .filter(b => !b.isStatic || !b.isStatic())
      .map(b => new SceneryBand({ sceneEl, policy: b, name: b.name }));
  }

  get defaultPolicy() { return this.scenePolicy.defaultPolicy; }
}
