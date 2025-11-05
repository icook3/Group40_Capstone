class Camera {
    camera = document.getElementById("camera");
    rig = document.getElementById("rig");
    /**
    * Set the position of the camera
    * @param {x, y, z} pos 
    */
    setCameraPosition(pos) {
        rig.setAttribute('position', `${pos.x} ${pos.y} ${pos.z}`);
    }
    /**
    * Set the rotation of the camera
    * @param {x, y, z} rot 
    */
    setCameraRotation(rot) {
        rig.setAttribute('rotation', `${rot.x} ${rot.y} ${rot.z}`);
    }

    zoomCamera(zoom) {
        camera.setAttribute("zoom", zoom);
    }
    setFoV(fov) {
        camera.setAttribute("fov",fov);
    }

    getFoV() {
        return camera.getAttribute("fov");
    }

    getZoom() {
        return camera.getAttribute("zoom");
    }

    getCameraPosition() {
        let val = rig.getAttribute('position');
        if (typeof val === 'string') val = AFRAME.utils.coordinates.parse(val);
        return { x: +val.x || 0, y: +val.y || 0, z: +val.z || 0 };
    }
    getCameraRotation() {
        let val = rig.getAttribute('rotation');
        if (typeof val === 'string') val = AFRAME.utils.coordinates.parse(val);
        return { x: +val.x || 0, y: +val.y || 0, z: +val.z || 0 };
    }

    defaultCamera() {
        setCameraRotation({x: 0, y: 0, z: 0});
        setCameraPosition({x: 0, y: 4.5, z: 5});
        zoomCamera(1);
        setFoV(80);
    }
}
export let camera = new Camera();