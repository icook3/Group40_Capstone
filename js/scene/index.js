<<<<<<< HEAD
import { ObjectField } from './objects/ObjectField.js';
import { DirtPattern } from './env/DirtPattern.js';
import { Cloud } from './env/Cloud.js';
import { SceneryManager } from './env/SceneryManager.js';
=======
import { EdgeBand } from "./env/EdgeBand.js"; // your near-trail band
import { EdgeLineBand } from "./env/EdgeLineBand.js"; // NEW true edge band
import { ObjectField } from "./objects/ObjectField.js";
import { DirtPattern } from "./env/DirtPattern.js";
import { Cloud } from "./env/Cloud.js";
import { MiddleLineBand } from "./env/MiddleLineBand.js";
>>>>>>> origin/main

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
    this.objectField = new ObjectField({
      sceneEl: this.scene,
      dirtPattern: this.dirtPattern,
<<<<<<< HEAD
      policy: this.scenery.defaultPolicy
    });
    this.objectField.attachExternalBands(this.scenery.bands);
    this.clouds = new Cloud({ sceneEl: this.scene });
=======
    });
    this.clouds = new Cloud({ sceneEl: this.scene });

    // Build bands immediately (no delay)
    this.nearBand = new EdgeBand({ sceneEl: this.scene }); // optional attach
    this.edgeLine = new EdgeLineBand({ sceneEl: this.scene }); // actual edge
    this.middleLineBand = new MiddleLineBand({ sceneEl: this.scene }); // Middle area
>>>>>>> origin/main
  }

  // Not used outside this class
  // setPacerSpeed(_) {}

  update(riderSpeed = 0, dt = 0) {
    const dz = riderSpeed * dt;
    this.worldZ += dz;

    if (!this.objectsLoaded) {
      this.objectField.init(); // keep the original delayed spawn for field
      this.middleLineBand.init();
      this.objectsLoaded = true;
    }

<<<<<<< HEAD
    this.objectField.advance(dz);  // ← the ONLY advancer  
=======
    this.middleLineBand.advance(0.7 * dz);
    this.objectField.advance(dz); // ← the ONLY advancer
>>>>>>> origin/main
  }
}
