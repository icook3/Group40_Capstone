// Wrapper so index.js keeps a single call

import { SceneryBand } from './SceneryBand.js';
import { ScenePolicy } from '../policy/ScenePolicy.js';
import old_default_cfg from '../policy/old_default_cfg.js';

export class SceneryManager {
  constructor({ sceneEl }) {
    this.scene = sceneEl;
    this.scenePolicy = new ScenePolicy(old_default_cfg);
    this.bands = [
      new SceneryBand({ sceneEl: this.scene })
    ];
  }

  get defaultPolicy() {
    return this.scenePolicy.defaultPolicy;
  }
}