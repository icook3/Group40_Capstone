// js/scene/core/util.js
export function getPos(el) {
  const p = el.object3D?.position;
  if (p) return { x: p.x, y: p.y, z: p.z };
  let val = el.getAttribute('position');
  if (typeof val === 'string') val = AFRAME.utils.coordinates.parse(val);
  return { x: +val.x || 0, y: +val.y || 0, z: +val.z || 0 };
}

export function setPos(el, pos) {
  if (!el) return;

  // position: fast path
  if (el.object3D?.position) {
    el.object3D.position.set(pos.x, pos.y, pos.z);
  } else {
    el.setAttribute('position', `${pos.x} ${pos.y} ${pos.z}`);
  }

  // rotation: fast path, avoid setAttribute spam
  if (el.object3D?.rotation) {
    const wantY = pos.x > 0 ? Math.PI : 0; // 180deg or 0deg
    if (Math.abs(el.object3D.rotation.y - wantY) > 1e-6) {
      el.object3D.rotation.set(0, wantY, 0);
    }
  } else {
    // fallback only if no object3D
    const want = pos.x > 0 ? '0 180 0' : '0 0 0';
    if (el.getAttribute('rotation') !== want) {
      el.setAttribute('rotation', want);
    }
  }
}

// Guaranteed off-path sampler
export function sampleSideX({ isBuilding }) {
  // Tune these if your “path” is wider/narrower
  const [min, max] = isBuilding ? [15, 25] : [8, 22];
  const sign = Math.random() < 0.5 ? -1 : 1;
  return sign * (min + Math.random() * (max - min));
}

// Decide whether the number should be positive or negative
export function getSign() {
    let randomNo = Math.floor(Math.random() * 10);
    return randomNo % 2 === 0;
  }


