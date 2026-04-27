import  cfg  from '../policy/edge_default_cfg.js';
import * as THREE from "three";
export class TestTerrain {
    cfg=cfg;
    buildingSelect(idx) {
        const roll = Math.random();

        let modelId;
        let scale;
        let y;
        const subtypes = cfg[idx]?.buildingSubtype?.() || {
          tall: 0.33,
          wide: 0.33,
          house: 0.34
        };
        if (roll < subtypes.house) {
          modelId = "house";
          scale = 6 + Math.random() * 2;
          y = 1.5;
        } else if (roll < subtypes.house + subtypes.wide) {
          modelId = "wideBuilding";
          scale = 8 + Math.random() * 5;
          y = 0.5;
        } else {
          modelId = "tallBuilding";
          scale = 6 + Math.random() * 3;
          y = 0.5;
        }
        return {modelId: modelId, scale: scale, y: y};
    }
    treeSelect(idx) {
        const roll=Math.random();

        let modelId;
        let scale;
        let y=0;
        const subtypes = cfg[idx]?.treeSubtype?.() || {
          bush1: 0.25,
          tree1: 0.25,
          tree2: 0.25,
          tree3: 0.25
        };
        if (roll < subtypes.bush1) {
            modelId="bush1";
            scale = 1.2 + Math.random() * 0.8;
        } else if (roll<subtypes.tree1+subtypes.bush1) {
            modelId="tree1";
            scale = 4 + Math.random() * 4;
        } else if (roll<subtypes.tree2+subtypes.tree1+subtypes.bush1) {
            modelId="tree2";
            scale = 4 + Math.random() * 4;
        } else {
            modelId="tree3";
            scale = 4 + Math.random() * 4;
        }
        return {modelId: modelId, scale: scale, y: y};
    }
    grassTexture = new THREE.TextureLoader().load("../../resources/textures/Grass.jpeg");
    trackMaterial=new THREE.MeshStandardMaterial({
        map: this.grassTexture,
        color: 0x90b858,
        roughness: 1
    });

    trackTexture = new THREE.TextureLoader().load("../../resources/textures/Track.jpeg");
    groundMaterial = new THREE.MeshStandardMaterial({
        map: this.trackTexture,
        color:0xc8c0b0,
        roughness: 0.9
    });
    trackMaterialDouble = new THREE.MeshStandardMaterial({
        map: this.grassTexture,
        color: 0x90b858,
        roughness: 1,
        side: THREE.DoubleSide
    });
    /**
     * @type {THREE.CanvasTexture}
     */
    skyTexture;
    constructor() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 256);

        // This is the gradient that makes up the sky
        // This can be used to play around with how the sky looks
        gradient.addColorStop(0, 'rgb(0, 1, 2)');
        gradient.addColorStop(0.85, '#000000');
        gradient.addColorStop(1, '#000000');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1, 256);
        this.skyTexture=new THREE.CanvasTexture(canvas);
        this.skyTexture.colorSpace = THREE.SRGBColorSpace;
    }
}