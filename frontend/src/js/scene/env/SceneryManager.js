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

    // ADDED: track lifecycle so we don't double-destroy
    this._destroyed = false; // ADDED

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

  // ADDED: public cleanup hook
  destroy() { // ADDED
    if (this._destroyed) return; // ADDED
    this._destroyed = true; // ADDED

    // If SceneryBand has its own cleanup, prefer calling it.
    // Otherwise, fall back to removing items/entities if they exist.
    if (Array.isArray(this.bands)) { // ADDED
      for (const band of this.bands) { // ADDED
        if (!band) continue; // ADDED

        // ADDED: call whichever cleanup method exists
        if (typeof band.destroy === 'function') { // ADDED
          band.destroy(); // ADDED
          continue; // ADDED
        }
        if (typeof band.dispose === 'function') { // ADDED
          band.dispose(); // ADDED
          continue; // ADDED
        }

        // ADDED: fallback removal if band exposes spawned A-Frame els
        // (Adjust this block to match your SceneryBand implementation.)
        const items = band.items; // ADDED
        if (Array.isArray(items)) { // ADDED
          for (const el of items) { // ADDED
            if (el && el.parentNode) el.parentNode.removeChild(el); // ADDED
          }
          band.items.length = 0; // ADDED
        }
      }
    }

    // ADDED: break references so GC has an easier time
    this.staticBands = []; // ADDED
    this.dynamicBands = []; // ADDED
    this.bands = []; // ADDED
    this.scenePolicy = null; // ADDED
    this.sceneEl = null; // ADDED
  }
}
