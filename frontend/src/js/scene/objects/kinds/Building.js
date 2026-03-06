// Building.js
import { loadModel } from "../../modelCache.js";

function sampleBuildingX() {
  // original behavior: ±(15..25)
  const sign = Math.random() < 0.5 ? -1 : 1;
  return sign * (15 + Math.random() * 10);
}

export const BuildingKind = {
  name: 'building',

  spawn(scene, z, policy = null) {
    const x = sampleBuildingX();
    let y = 1.5;

    const group = new THREE.Group();
    group.userData.zlowKind = "building";

    const subtypes = policy?.buildingSubtype?.() || {
      tall: 0.33,
      wide: 0.33,
      house: 0.34
    };

    const roll = Math.random();

    let modelId;
    let scale;

    if (roll < subtypes.house) {
      modelId = "house";
      scale = 6 + Math.random() * 2;
      y = 1.5;
    } else if (roll < subtypes.house + subtypes.wide) {
      modelId = "wideBuilding";
      scale = 8 + Math.random() * 5;
      y = 0.5;
    } else {
      modelId = "tallBuilding";
      scale = 6 + Math.random() * 3;
      y = 0.5;
    }

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