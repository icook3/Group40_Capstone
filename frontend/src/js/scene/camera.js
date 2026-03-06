class Camera {
    constructor(scene) {
        // The rig is a Group that holds the camera (lets you move/rotate them together)
        this.rig = new THREE.Group();
        this.rig.name = "rig";

        this.camera = new THREE.PerspectiveCamera(
            80,                                          // default FoV
            window.innerWidth / window.innerHeight,      // aspect
            0.1,                                         // near
            1000                                         // far
        );
        this.camera.name = "camera";
        this.rig.add(this.camera);
        scene.add(this.rig);

        this.defaultCamera();
    }

    setCameraPosition(pos) {
        this.rig.position.set(pos.x, pos.y, pos.z);
    }

    setCameraRotation(rot) {
        // A-Frame rotation is in degrees; Three.js uses radians
        this.rig.rotation.set(
            THREE.MathUtils.degToRad(rot.x),
            THREE.MathUtils.degToRad(rot.y),
            THREE.MathUtils.degToRad(rot.z)
        );
    }

    zoomCamera(zoom) {
        this.camera.zoom = zoom;
        this.camera.updateProjectionMatrix();
    }

    setFoV(fov) {
        this.camera.fov = fov;
        this.camera.updateProjectionMatrix();
    }

    getFoV() {
        return this.camera.fov;
    }

    getZoom() {
        return this.camera.zoom;
    }

    getCameraPosition() {
        const p = this.rig.position;
        return { x: p.x, y: p.y, z: p.z };
    }

    getCameraRotation() {
        const r = this.rig.rotation;
        return {
            x: THREE.MathUtils.radToDeg(r.x),
            y: THREE.MathUtils.radToDeg(r.y),
            z: THREE.MathUtils.radToDeg(r.z),
        };
    }

    defaultCamera() {
        this.setCameraRotation({ x: 0, y: 0, z: 0 });
        this.setCameraPosition({ x: 0, y: 4.5, z: 5 });
        this.zoomCamera(1);
        this.setFoV(80);
    }
}

export { Camera };