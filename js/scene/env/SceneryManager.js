// Wrapper so index.js keeps a single call

import { SceneryBand } from './SceneryBand.js';

export class SceneryManager {
  constructor({ sceneEl }) {
    this.scene = sceneEl;
    this.bands = [
      new SceneryBand({ sceneEl: this.scene })
    ];
  }
}