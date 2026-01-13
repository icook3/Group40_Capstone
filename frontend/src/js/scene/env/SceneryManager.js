// js/scene/env/SceneryManager.js
import cfg from '../policy/edge_default_cfg.js';
import { ScenePolicy } from '../policy/ScenePolicy.js';
import { SceneryBand } from './SceneryBand.js';

/**
 * SceneryManager builds all scenery bands defined in the ScenePolicy config.
 * - "static" bands: spawn once and never advance/recycle
 * - dynamic bands: participate in advance/recycle (if you later add that logic)
 */
export class SceneryManager {
  constructor({ sceneEl }) {
    this.sceneEl = sceneEl;
    this.scenePolicy = new ScenePolicy(cfg);

    // Build all bands from the policy
    const all = this.scenePolicy.bands;

    // Create SceneryBand instances for all of them
    this.bands = all.map(bandPolicy => {
      const band = new SceneryBand({
        sceneEl,
        policy: bandPolicy,
        name: bandPolicy.name,
      });
      return band;
    });

    console.debug('[SceneryManager] built bands:',
      this.bands.map(b => ({
        name: b.policy?.name,
        static: !!b.policy?.isStatic(),
        items: b.items?.length ?? 0
      }))
    );


    // Separate static and dynamic for convenience (optional)
    this.staticBands = this.bands.filter(b => b.policy?.isStatic() === true);
    this.dynamicBands = this.bands.filter(b => !b.policy?.isStatic());
  }

  /** Access the global defaults if needed */
  get defaultPolicy() {
    return this.scenePolicy.defaultPolicy;
  }
}