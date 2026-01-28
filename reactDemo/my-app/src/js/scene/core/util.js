// js/scene/core/util.js
export function getPos(el) {
  const p = el.object3D?.position;
  if (p) return { x: p.x, y: p.y, z: p.z };
  let val = el.getAttribute('position');
  if (typeof val === 'string') val = AFRAME.utils.coordinates.parse(val);
  return { x: +val.x || 0, y: +val.y || 0, z: +val.z || 0 };
}

export function setPos(el, pos) {
  if (el.object3D?.position) {
    el.object3D.position.set(pos.x, pos.y, pos.z);
  } else {
    el.setAttribute('position', `${pos.x} ${pos.y} ${pos.z}`);
  }
  //if it is on the one side of the track, rotate it
  //used so we can use backface culling on the models to save resources
  if (pos.x > 0) {
    el.setAttribute('rotation', '0 180 0');
  } else {
    el.setAttribute('rotation', '0 0 0');
  }
}

// Guaranteed off-path sampler
export function sampleSideX({ isBuilding }) {
  // Tune these if your “path” is wider/narrower
  const [min, max] = isBuilding ? [15, 25] : [8, 22];
  const sign = Math.random() < 0.5 ? -1 : 1;
  return sign * (min + Math.random() * (max - min));
}


