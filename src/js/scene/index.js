import { ObjectField } from './objects/ObjectField.js';
import { DirtPattern } from './env/DirtPattern.js';
import { Cloud } from './env/Cloud.js';
import { SceneryManager } from './env/SceneryManager.js';

export class ZlowScene {
  constructor(_, { getElement = (id) => document.getElementById(id) } = {}) {
    this.scene = getElement("scene");
    this.worldZ = 0;
    this.objectsLoaded = false;
    this.DEBUG_BANDS = true; // set to true to log default policy once

    this.scenery = new SceneryManager({ sceneEl: this.scene }); // actual edge

    // --- Optional one-time debug log ---
    if (this.DEBUG_BANDS) {
      this.scenery.scenePolicy.logBands();
    }

    // Generate a new object field, track, and clouds
    this.dirtPattern = new DirtPattern({ sceneEl: this.scene });        
    this.clouds = new Cloud({ sceneEl: this.scene });
    this.objectField = new ObjectField({
      sceneEl: this.scene,
      dirtPattern: this.dirtPattern,
      policy: this.scenery.defaultPolicy,
      clouds: this.clouds
    });
    this.objectField.attachExternalBands(this.scenery.bands);
  }
  
  update(riderSpeed = 0, dt = 0) {
    const dz = riderSpeed * dt;
    this.worldZ += dz;

    if (!this.objectsLoaded) {
      this.objectField.init(); // keep the original delayed spawn for field
      this.objectsLoaded = true;
    }
    this.objectField.advance(dz);  // ← the ONLY advancer  
  }
}
