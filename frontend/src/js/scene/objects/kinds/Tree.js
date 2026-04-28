import * as THREE from "three";
import { loadModel } from "../../modelCache.js";
import { terrainSwitcher } from "../../terrains/terrainSwitcher.js";
import { constants } from "../../../constants.js";

function sampleTreeX() {
  // original behavior: uniform [-20,20] but exclude path (-4..4)
  const scale = constants.multiplayerTrackScale;
  const exclusionZone = 4 * scale;
  let x;
  do {
    x = -20 * scale + Math.random() * 40 * scale;
  } while (x > -exclusionZone && x < exclusionZone);
  return x;
}

export const TreeKind = {
  name: "tree",

  spawn(scene, z, idx=0) {
    const x = sampleTreeX();

    const group = new THREE.Group();

    let values = terrainSwitcher.currentTerrain.treeSelect();
    let scale=values.scale;
    let y=values.y;
    let modelId=values.modelId;

    // get glb model
    loadModel(modelId).then((model) => {
      group.userData.zlowKind = "tree";

      model.traverse((node) => {
        if (node.isMesh && node.material) {
          node.material.roughness = 0.85;
        }
      });

      group.add(model);
    });

    // rotate tree randomly
    group.rotation.y = Math.random() * Math.PI * 2;

    group.scale.set(scale, scale, scale);
    group.position.set(x, y, z);

    scene.add(group);

    return group;
  },

  resampleX() {
    return sampleTreeX();
  },
};