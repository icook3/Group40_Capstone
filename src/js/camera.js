let camera = document.getElementById("camera");
let rig = document.getElementById("rig");
/**
 * Set the position of the camera
 * @param {x, y, z} pos 
 */
export function setCameraPosition(pos) {
    rig.setAttribute('position', `${pos.x} ${pos.y} ${pos.z}`);
}
/**
 * Set the rotation of the camera
 * @param {x, y, z} rot 
 */
export function setCameraRotation(rot) {
    rig.setAttribute('rotation', `${rot.x} ${rot.y} ${rot.z}`);
}

export function zoomCamera(zoom) {
    camera.setAttribute("zoom", zoom);
}
export function setFoV(fov) {
    camera.setAttribute("fov",fov);
}

export function getFoV() {
    return camera.getAttribute("fov");
}

export function getZoom() {
    return camera.getAttribute("zoom");
}

export function getCameraPosition() {
  let val = rig.getAttribute('position');
  if (typeof val === 'string') val = AFRAME.utils.coordinates.parse(val);
  return { x: +val.x || 0, y: +val.y || 0, z: +val.z || 0 };
}

export function getCameraRotation() {
  let val = rig.getAttribute('rotation');
  if (typeof val === 'string') val = AFRAME.utils.coordinates.parse(val);
  return { x: +val.x || 0, y: +val.y || 0, z: +val.z || 0 };
}

export function defaultCamera() {
    setCameraRotation({x: 0, y: 0, z: 0});
    setCameraPosition({x: 0, y: 4.5, z: 5});
    zoomCamera(1);
    setFoV(80);
}