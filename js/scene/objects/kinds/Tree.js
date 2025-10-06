// Tree.js
import { setPos } from '../../core/util.js';

function sampleTreeX() {
  // original behavior: uniform [-20,20] but exclude path (-4..4)
  let x;
  do { x = -20 + Math.random() * 40; } while (x > -4 && x < 4);
  return x;
}

export const TreeKind = {
  name: 'tree',
  spawn(sceneEl, z) {
    const x = sampleTreeX();
    const obj = document.createElement('a-entity');
    obj.setAttribute('zlow-kind', 'tree'); // mark kind explicitly

    const trunk = document.createElement('a-entity');
    trunk.setAttribute('geometry', 'primitive: cylinder; radius: 0.4; height: 2.5');
    trunk.setAttribute('material', 'color: #7c4a02');
    trunk.setAttribute('position', `0 1.25 0`);

    const foliage = document.createElement('a-entity');
    foliage.setAttribute('geometry', `primitive: sphere; radius: ${1.2 + Math.random() * 0.8}`);
    foliage.setAttribute('material', 'color: #2e7d32');
    foliage.setAttribute('position', `0 2.7 0`);

    obj.appendChild(trunk);
    obj.appendChild(foliage);
    setPos(obj, { x, y: 0, z });
    sceneEl.appendChild(obj);
    return obj;
  },
  resampleX() { return sampleTreeX(); }
};
