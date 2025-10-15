// Building.js
import { setPos } from '../../core/util.js';

function sampleBuildingX() {
  // original behavior: ±(15..25)
  const sign = Math.random() < 0.5 ? -1 : 1;
  return sign * (15 + Math.random() * 10);
}

export const BuildingKind = {
  name: 'building',
  spawn(sceneEl, z) {
    const x = sampleBuildingX();
    const building = Math.random() * 3;
    const w = 2 + Math.random() * 4;
    const h = 4 + Math.random() * 6;
    const d = 2 + Math.random() * 4;
    const size = 4;
    //NOT a constant - will be different for different buildings
    let y = 1.5;

    const obj = document.createElement('a-entity');
    obj.setAttribute('zlow-kind', 'building'); // mark kind explicitly
    //old behavior
      //obj.setAttribute('geometry', `primitive: box; width: ${w}; height: ${h}; depth: ${d}`);
      if (Math.round(building) == 1) {
          obj.setAttribute('gltf-model', '#house-obj');
          y = 1.5;
      } else if (Math.round(building) == 2) {
          obj.setAttribute('gltf-model', '#tall-building-obj');
          y = 0.5;
      } else {
          obj.setAttribute('gltf-model', '#wide-building-obj');
          y = 0.5;
      }
    //obj.setAttribute('gltf-model', '#house-obj');
    obj.setAttribute('scale', size+" "+size+" "+size);
    const gray = Math.floor(128 + Math.random() * 80);
    //obj.setAttribute('material', `color: rgb(${gray},${gray},${gray})`);
    setPos(obj, { x, y, z });
    sceneEl.appendChild(obj);
    return obj;
  },
  resampleX() {
      return sampleBuildingX;
  }
};
