import { EdgeBand } from './env/EdgeBand.js';            // your near-trail band
import { EdgeLineBand } from './env/EdgeLineBand.js';    // NEW true edge band
import { ObjectField } from './objects/ObjectField.js';
import { DirtPattern } from './env/DirtPattern.js';

export class ZlowScene {
  constructor(_, { getElement = id => document.getElementById(id) } = {}) {
    this.scene = getElement('scene');
    this.worldZ = 0;
    this.objectsLoaded = false;

    this.objectField = new ObjectField({ sceneEl: this.scene });
    this.dirtPattern = new DirtPattern({ getElement });
    this.objectField.setDirtPattern(this.dirtPattern);

    // Build bands immediately (no delay)
    this.nearBand = new EdgeBand({ sceneEl: this.scene });     // optional attach
    this.edgeLine = new EdgeLineBand({ sceneEl: this.scene }); // actual edge

  }

  setPacerSpeed(_) {}

  update(riderSpeed = 0, dt = 0) {
    const dz = riderSpeed * dt;
    this.worldZ += dz;

    if (!this.objectsLoaded && this.worldZ >= 10) {
      this.objectField.init();     // keep the original delayed spawn for field
      this.objectsLoaded = true;
    }

    this.objectField.advance(dz);  // ← the ONLY advancer  
    }
}

