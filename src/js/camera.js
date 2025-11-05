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