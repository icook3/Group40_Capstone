// Building.js
import { setPos } from '../../core/util.js';

function sampleBuildingX() {
  // original behavior: ±(15..25)
  const sign = Math.random() < 0.5 ? -1 : 1;
  return sign * (15 + Math.random() * 10);
}

export const BuildingKind = {
    name: 'building',
  spawn(sceneEl, z, policy = null) {
    const x = sampleBuildingX();
    const size = 4;
    let y = 1.5;

    const obj = document.createElement('a-entity');
    obj.setAttribute('zlow-kind', 'building');

    // Get building subtype weights from policy, or use defaults
    const subtypes = policy?.buildingSubtype?.() || { tall: 0.33, wide: 0.33, house: 0.34 };
    
    // Weighted random selection
    const roll = Math.random();
    let buildingType;
    
    if (roll < (subtypes.house || 0)) {
      buildingType = 'house';
      obj.setAttribute('gltf-model', '#house-obj');
      y = 1.5;
    } else if (roll < (subtypes.house || 0) + (subtypes.wide || 0)) {
      buildingType = 'wide';
      obj.setAttribute('gltf-model', '#wide-building-obj');
      y = 0.5;
    } else {
      buildingType = 'tall';
      obj.setAttribute('gltf-model', '#tall-building-obj');
      y = 0.5;
    }
    
    obj.setAttribute('zlow-building-type', buildingType);
    obj.setAttribute('scale', size + " " + size + " " + size);
    setPos(obj, { x, y, z });
    sceneEl.appendChild(obj);
    return obj;
  },
  resampleX() {
      return sampleBuildingX();
  }
};