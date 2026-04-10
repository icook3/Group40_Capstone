import * as THREE from "three";
import { Camera } from "./camera.js";
import { ObjectField } from "./objects/ObjectField.js";
import { Track } from "./env/Track.js";
import { Cloud } from "./env/Cloud.js";
import { SceneryManager } from "./env/SceneryManager.js";
import { constants } from "../constants.js";
import {GroundInstanced} from "./env/GroundInstanced.js";

export class ZlowScene {
    constructor() {
        if (window.__zlowSceneInstance) {
            window.__zlowSceneInstance.destroy?.();
        }
        window.__zlowSceneInstance = this;

        // Scene
        this.scene = new THREE.Scene();
        this.objectsLoaded = false;

        // Sky
        this.scene.background = new THREE.Color(0x87CEEB);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        document.body.appendChild(this.renderer.domElement);

        // Camera
        this.cam = new Camera(this.scene);

        // Set starting camera position
        this.viewCoordinates = JSON.parse(localStorage.getItem("view"));
        this.cam.rig.position.x = this.viewCoordinates.x;
        this.cam.rig.position.y = this.viewCoordinates.y;
        this.cam.rig.position.z = this.viewCoordinates.z;

        // Lighting
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);
        const sun = new THREE.DirectionalLight(0xffffff, 0.8);
        sun.position.set(5, 10, 7);
        this.scene.add(sun);

        // Scenery
        this.scenery = new SceneryManager({ scene: this.scene });
        constants.worldZ = 0;

        // Ground
        this.ground = new GroundInstanced(this.scene);

        // World systems
        this.track = new Track({ scene: this.scene });
        this.clouds = new Cloud({ scene: this.scene });

        this.objectField = new ObjectField({
            scene: this.scene,
            track: this.track,
            policy: this.scenery.defaultPolicy,
            clouds: this.clouds,
        });
        this.objectField.attachExternalBands(this.scenery.bands);

        // Resize
        this._onResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            this.renderer.setSize(w, h);
            this.cam.camera.aspect = w / h;
            this.cam.camera.updateProjectionMatrix();
        };
        window.addEventListener("resize", this._onResize);
    }

    update(riderSpeed = 0, dt = 0) {
        const dz = riderSpeed * dt;
        constants.worldZ += dz;

        if (!this.objectsLoaded) {
            this.objectField.init();
            this.objectsLoaded = true;
        }
        this.objectField.advance(riderSpeed, dt);

        const rider = this.scene.getObjectByName("rider");
        this.ground.update(rider);

        this.renderer.render(this.scene, this.cam.camera);
    }

    destroy() {
        // Remove all children from the scene but don't dispose shared materials
        while (this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0]);
        }

        this.renderer?.domElement?.remove();
        this.renderer?.dispose();

        this.ground?.destroy();
        this.objectField?.attachExternalBands?.([]);
        this.objectField?.destroy?.();
        this.clouds?.destroy?.();
        this.track?.destroy?.();
        this.scenery?.destroy?.();

        if (window.__zlowSceneInstance === this) {
            window.__zlowSceneInstance = null;
        }
    }
}
