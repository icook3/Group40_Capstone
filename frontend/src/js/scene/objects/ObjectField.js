  // Flow:
  // Call spawnAtZ either once or twice depending on randomly generated number
  // spawnAtZ runs pickKind to decide what to spawn
  // spawnAtZ pushes the entity to items, which are updated as the rider moves.

  import { constants } from "../../constants.js";
  import { spawnCloud } from "../env/Cloud.js";
  import { KINDS, detectKind } from "./kinds/index.js";
  import * as THREE from "three";

export class ObjectField {

  constructor({ scene, track, policy, clouds }) {
    this.scene = scene;
    this.track = track;
    this.clouds = clouds;
    this.items = [];
    this.initialized = false;
    this.externalGroups = [];
    this.policy = policy;

    this.rider = this.scene.getObjectByName("rider");
    
    // weights parallel KINDS (keep 50/50 for identical behavior)
    this.weights = [1, 1];
    this.totalWeight = this.weights.reduce((a, b) => a + b, 0);

    // Rotate rig to face forwards relative to the rider
      this.rig = this.scene.getObjectByName("rig");

      if (this.rig) {
          this.rig.rotation.y = THREE.MathUtils.degToRad(-105);
      }
  }

  // allow scene to register bands (each with items[] and recyclePolicy)
  // Not currently used?
  attachExternalBands(groups) {
    for (const g of groups) {
      if (!g || !Array.isArray(g.items)) continue;
      this.externalGroups.push(g);
    }
  }

  // Creates an object used in the object field (currently a tree or a building)
  _pickKind() {
    // weighted random pick
    let r = Math.random() * this.totalWeight;
    for (let i = 0; i < KINDS.length; i++) {
      r -= this.weights[i];
      if (r <= 0) return KINDS[i];
    }
    return KINDS[KINDS.length - 1];
  }

  _spawnAtZ(z) {
    const kind = this._pickKind();
    const entity = kind.spawn(this.scene, z);
    this.items.push(entity);

    // CAP HERE (right after push)
    const MAX_ITEMS = 1200; // start high; tune later

    if (this.items.length > MAX_ITEMS) {
      // remove oldest items first (front of array)
      const extra = this.items.length - MAX_ITEMS;
      const removed = this.items.splice(0, extra);

      for (const obj of removed) {
        obj?.parent?.remove(obj);
      }
    }
  }

  // Initializes items that move with the rider (buildings and trees)
  // May not do anything
  init() {
      if (this.initialized) return;
      this.initialized = true;
  }

  // Advances the scene. Recycles items more than 20 units in front of the rider
  advance(riderSpeed, dt) {
    if (!this.initialized || riderSpeed === 0 || dt === 0) return;

    const riderZ = this.rider?.position.z ?? 0;
    const recycleZ = riderZ + 20;

    // ---------------------------
    // MAIN ITEMS (this.items)
    // ---------------------------

    // Compute the "farthest behind" Z (min Z) ONCE per frame
    let minZ = Infinity;

    for (const obj of this.items) {
      const z = obj.position.z;
      if (z < minZ) minZ = z;
    }

    for (const obj of this.items) {
      if (obj.position.z > recycleZ) {
        // recycle in front of farthest-behind (minZ)
        obj.position.z = minZ - 5;

        // resample X per-kind (keeps trees closer than buildings)
        const kind = detectKind(obj);
        obj.position.x = kind.resampleX();

        // update minZ so multiple recycled objects don't stack
        minZ = obj.position.z;
      }
    }

    // ---------------------------
    // EXTERNAL BANDS (band.items)
    // ---------------------------

    for (const band of this.externalGroups) {
      if (band?.policy?.isStatic()) continue;
      if (!band?.items?.length) continue;

      // Compute band minZ ONCE per frame
      let bandMinZ = Infinity;

      for (const obj of band.items) {
        const z = obj.position.z;
        if (z < bandMinZ) bandMinZ = z;
      }

      for (const obj of band.items) {
        if (obj.position.z > recycleZ) {
          obj.position.z = bandMinZ - 5;
          const mix =
            typeof band.policy.mix === "function"
              ? band.policy.mix()
              : { tree: 0.5, building: 0.5 };

          const roll = Math.random();
          const nextIsBuilding = roll < mix.building;

          const kindName = nextIsBuilding ? "building" : "tree";
          obj.userData.zlowKind = kindName;

          obj.position.x = detectKind(obj).resampleX();

          bandMinZ = obj.position.z;
        }
      }
    }

    // ---------------------------
    // CLOUDS
    // ---------------------------

    const now = Date.now();
    if (now > constants.lastCloud + constants.updateEvery) {
      constants.lastCloud = now;

      const cloudRoot = this.clouds?.clouds;
      if (cloudRoot?.children?.length) {
        const children = [...cloudRoot.children];

        for (const cloud of children) {

          if (cloud.position.z < riderZ) {
            cloud.position.z += 1;

          } else {
            cloudRoot.remove(cloud);
            cloudRoot.add(spawnCloud(4));
          }
        }
      }
    }
  }


  spawnScenery(trackPiece, initialZ) {
    if (trackPiece === "straight_vertical") {
      for (let z = initialZ + 30; z > initialZ - 30; z -= 5) {
        this._spawnAtZ(z);
        if (Math.random() < 0.7) this._spawnAtZ(z); // original density
      }
    }
  }
}