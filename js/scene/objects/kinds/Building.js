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
    const w = 2 + Math.random() * 4;
    const h = 4 + Math.random() * 6;
    const d = 2 + Math.random() * 4;

    const obj = document.createElement('a-entity');
    obj.setAttribute('zlow-kind', 'building'); // mark kind explicitly
    obj.setAttribute('geometry', `primitive: box; width: ${w}; height: ${h}; depth: ${d}`);
    const gray = Math.floor(128 + Math.random() * 80);
    obj.setAttribute('material', `color: rgb(${gray},${gray},${gray})`);
    setPos(obj, { x, y: h / 2, z });
    sceneEl.appendChild(obj);
    return obj;
  },
  resampleX() { return sampleBuildingX(); }
};
