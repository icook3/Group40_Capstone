import * as THREE from "three";
import { loadModel } from "../../modelCache.js";
import { terrainSwitcher } from "../../terrains/terrainSwitcher.js";

function sampleTreeX() {
  // original behavior: uniform [-20,20] but exclude path (-4..4)
  let x;
  do {
    x = -20 + Math.random() * 40;
  } while (x > -4 && x < 4);
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