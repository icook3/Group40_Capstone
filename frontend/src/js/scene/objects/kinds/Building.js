// Building.js
import * as THREE from "three";
import { loadModel } from "../../modelCache.js";
import { terrainSwitcher } from "../../terrains/terrainSwitcher.js";
import { constants } from "../../../constants.js";

function sampleBuildingX() {
  // original behavior: ±(15..25)
  const scale = constants.multiplayerTrackScale
  const sign = Math.random() < 0.5 ? -1 : 1;
  return sign * (15 + Math.random() * 10) * scale;
}

export const BuildingKind = {
  name: 'building',

  spawn(scene, z, idx) {
    const x = sampleBuildingX();

    const group = new THREE.Group();
    group.userData.zlowKind = "building";

    let values = terrainSwitcher.currentTerrain.buildingSelect(idx);
    let modelId=values.modelId;
    let y=values.y;
    let scale=values.scale;

    group.userData.buildingType = modelId;

    loadModel(modelId).then((model) => {
          group.add(model);
    });

    group.scale.set(scale, scale, scale);
    group.position.set(x, y, z);

    scene.add(group);

    return group;
  },

  resampleX() {
      return sampleBuildingX();
  }
};