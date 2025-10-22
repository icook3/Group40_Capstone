// Wrapper so index.js keeps a single call

import { SceneryBand } from './SceneryBand.js';
import { ScenePolicy } from '../policy/ScenePolicy.js';
import old_default_cfg from '../policy/old_default_cfg.js';
import test_multiband_cfg from '../policy/test_multiband_cfg.js';

export class SceneryManager {
  constructor({ sceneEl }) {
    const USE_TEST_CFG = true; // set to true to use test_multiband_cfg
    this.scene = sceneEl;
    this.scenePolicy = new ScenePolicy(USE_TEST_CFG ? test_multiband_cfg : old_default_cfg);
    this.bands = [
      new SceneryBand({ sceneEl: this.scene })
    ];
  }

  get defaultPolicy() {
    return this.scenePolicy.defaultPolicy;
  }
}