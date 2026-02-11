import { ObjectField } from './objects/ObjectField.js';
import { Track } from './env/Track.js';
import { Cloud } from './env/Cloud.js';
import { SceneryManager } from './env/SceneryManager.js';
import { constants } from '../constants.js';

export class ZlowScene {
  constructor(_, { getElement = (id) => document.getElementById(id) } = {}) {
    this.scene = getElement("scene");
    this.objectsLoaded = false;
    this.DEBUG_BANDS = true; // set to true to log default policy once

    this.scenery = new SceneryManager({ sceneEl: this.scene }); // actual edge

    // --- Optional one-time debug log ---
    if (this.DEBUG_BANDS) {
      this.scenery.scenePolicy.logBands();
    }
    constants.worldZ=0;
    // Generate a new object field, track, and clouds
    this.track = new Track({ sceneEl: this.scene });        
    this.clouds = new Cloud({ sceneEl: this.scene });
    this.objectField = new ObjectField({
      sceneEl: this.scene,
      track: this.track,
      policy: this.scenery.defaultPolicy,
      clouds: this.clouds
    });
    this.objectField.attachExternalBands(this.scenery.bands);
  }
  
  // Pass speed and time instead of dz and calculate in ObjectField
  update(riderSpeed = 0, dt = 0) {
    const dz = riderSpeed * dt;
    constants.worldZ += dz;

    if (!this.objectsLoaded) {
      this.objectField.init(); // keep the original delayed spawn for field
      this.objectsLoaded = true;
    }
    this.objectField.advance(riderSpeed, dt);  // ← the ONLY advancer  
  }
}
