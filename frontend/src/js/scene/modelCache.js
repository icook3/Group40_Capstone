import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
const cache = {};

/**
 * Loads a model once for reuse.
 * Returns a cached clone.
 */
export function loadModel(modelName) {
    return new Promise((resolve, reject) => {
        // Already loaded
        if (cache[modelName]) {
            resolve(cache[modelName].clone(true));
            return;
        }

        // First time load
        loader.load(
            `../../resources/models/bgmodels/${modelName}.glb`,
            (gltf) => {
                const model = gltf.scene;

                cache[modelName] = model;

                resolve(model.clone(true));
            },
            undefined,
            (err) => reject(err)
        );

    });
}