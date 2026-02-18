import { ObjectField } from './objects/ObjectField.js';
import { Track } from './env/Track.js';
import { Cloud } from './env/Cloud.js';
import { SceneryManager } from './env/SceneryManager.js';
import { constants } from '../constants.js';

export class ZlowScene {
  constructor(_, { getElement = (id) => document.getElementById(id) } = {}) {
    // If a previous scene exists, tear it down first
    if (window.__zlowSceneInstance) {
      window.__zlowSceneInstance.destroy?.();
    }
    window.__zlowSceneInstance = this;

    this.scene = getElement("scene");
    this.objectsLoaded = false;

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

  destroy() {
    // break cross-references first
    this.objectField?.attachExternalBands?.([]); // or objectField.detachExternalBands?.()

    this.objectField?.destroy?.();
    this.clouds?.destroy?.();
    this.track?.destroy?.();
    this.scenery?.destroy?.();

    if (window.__zlowSceneInstance === this) window.__zlowSceneInstance = null;
  }

  update(riderSpeed = 0, dt = 0) {
    const dz = riderSpeed * dt;
    constants.worldZ += dz;

    if (!this.objectsLoaded) {
      this.objectField.init();
      this.objectsLoaded = true;
    }
    this.objectField.advance(riderSpeed, dt);
  }
}
