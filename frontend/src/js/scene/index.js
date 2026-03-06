import { Camera } from "./camera.js";
import { ObjectField } from "./objects/ObjectField.js";
import { Track } from "./env/Track.js";
import { Cloud } from "./env/Cloud.js";
import { SceneryManager } from "./env/SceneryManager.js";
import { constants } from "../constants.js";

export class ZlowScene {
    constructor(scene) {
        if (window.__zlowSceneInstance) {
            window.__zlowSceneInstance.destroy?.();
        }
        window.__zlowSceneInstance = this;

        // Scene
        this.scene = scene;
        console.log(this.scene)
        this.objectsLoaded = false;
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(this.renderer.domElement);

        // Camera
        this.cam = new Camera(this.scene);

        // Lighting
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);
        const sun = new THREE.DirectionalLight(0xffffff, 0.8);
        sun.position.set(5, 10, 7);
        this.scene.add(sun);

        // Scenery
        this.scenery = new SceneryManager({ scene: this.scene });
        constants.worldZ = 0;

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

        this.renderer.render(this.scene, this.cam.camera);
    }

    destroy() {
        window.removeEventListener("resize", this._onResize);
        this.renderer?.domElement?.remove();
        this.renderer?.dispose();

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