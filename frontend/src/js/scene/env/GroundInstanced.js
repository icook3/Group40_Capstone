import * as THREE from "three";
import { constants } from "../../constants.js";

export class GroundInstanced {
    constructor(scene) {
        this.scene = scene;
        this.tileSize = constants.tileSize;

        const count = constants.gridWidth * constants.gridDepth;

        const geom = new THREE.BoxGeometry(
            constants.tileSize,
            constants.height,
            constants.tileSize
        );

        const texture = new THREE.TextureLoader().load("../../../resources/textures/Grass.png");
        const mat = new THREE.MeshBasicMaterial({ map: texture });

        this.mesh = new THREE.InstancedMesh(geom, mat, count);

        const dummy = new THREE.Object3D();

        const halfW = (constants.gridWidth * constants.tileSize) * 0.5;
        const halfD = (constants.gridDepth * constants.tileSize) * 0.5;

        let i = 0;

        for (let z = 0; z < constants.gridDepth; z++) {
            for (let x = 0; x < constants.gridWidth; x++) {
                dummy.position.set(
                    (x * constants.tileSize) - halfW,
                    0,
                    (-(z * constants.tileSize)) + halfD
                );
                dummy.updateMatrix();
                this.mesh.setMatrixAt(i++, dummy.matrix);
            }
        }

        this.mesh.instanceMatrix.needsUpdate = true;

        // align top of tiles with y=0
        this.mesh.position.y = -(constants.height * 0.5);

        scene.add(this.mesh);
    }

    update(rider) {
        if (!rider) return;

        const p = rider.position;
        const snappedX = Math.floor(p.x / this.tileSize) * this.tileSize;
        const snappedZ = Math.floor(p.z / this.tileSize) * this.tileSize;

        this.mesh.position.x = snappedX;
        this.mesh.position.z = snappedZ;
    }

    destroy() {
        this.mesh.geometry.dispose();
        this.mesh.material.map?.dispose();
        this.mesh.material.dispose();

        this.scene.remove(this.mesh);
    }
}