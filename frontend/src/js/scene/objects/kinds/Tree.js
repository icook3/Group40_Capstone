import * as THREE from "three";
import { loadModel } from "../../modelCache.js";
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

  spawn(scene, z) {
    const x = sampleTreeX();

    const group = new THREE.Group();

    const treeTypes = ["tree1", "tree2", "tree3"];
    const bushChance = 0.25;

    let modelId;
    if (Math.random() < bushChance) {
      modelId = "bush1";
    } else {
      modelId = treeTypes[Math.floor(Math.random() * treeTypes.length)];
    }

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

    // scale trees randomly from 450-490%
    // bushes from 200-220%
    let scale;
    if (modelId === "tree-bush1") {
      scale = 1.2 + Math.random() * 0.8;
    } else {
      scale = 4 + Math.random() * 4;
    }

    group.scale.set(scale, scale, scale);
    group.position.set(x, 0, z);

    scene.add(group);

    return group;
  },

  resampleX() {
    return sampleTreeX();
  },
};