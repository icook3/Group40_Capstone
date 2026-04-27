import  cfg  from '../policy/edge_default_cfg.js';
import * as THREE from "three";
export class SnowTerrain {
    cfg=cfg;
    buildingSelect(idx) {
        const roll = Math.random();
        let modelId;
        let scale;
        let y;
        //The snowy environment only has houses
        modelId = "house";
        scale = 6 + Math.random() * 2;
        y = 1.5;
        return {modelId: modelId, scale: scale, y: y};
    }
    treeSelect(idx) {
        const roll=Math.random();

        let modelId;
        let scale;
        let y=0;
        const subtypes = cfg[idx]?.treeSubtype?.() || {
          height1: 0.25,
          height2: 0.25,
          height3: 0.25,
          bush: 0.25
        };
        modelId="winterTree";
        scale =  Math.random() * 1.5;
        if (roll < subtypes.bush) {
            modelId="bush1";
            scale = 1.2 + Math.random() * 0.8;
        } else if (roll<subtypes.height1+subtypes.bush) {
            y=-1;
        } else if (roll<subtypes.height1+subtypes.height2+subtypes.bush) {
            y=-2;
        }
        return {modelId: modelId, scale: scale, y: y};
    }
    snowTexture = new THREE.TextureLoader().load("../../resources/textures/Snow.JPG");
    groundMaterial=new THREE.MeshStandardMaterial({
        map: this.snowTexture,
        color: 0xFFFFFF,
        roughness: 1
    });

    trackTexture = new THREE.TextureLoader().load("../../resources/textures/Track.jpeg");
    trackMaterial = new THREE.MeshStandardMaterial({
        map: this.snowTexture,
        color:0xc8c0b0,
        roughness: 0.9
    });
    trackMaterialDouble = new THREE.MeshStandardMaterial({
        map: this.snowTexture,
        color: 0xc8c0b0,
        roughness: 0.9,
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
        // This can be used to play around with how the sky looks - possibly
        // to add different effects and simulate day parts along with lighting

        gradient.addColorStop(0, '#e2f7ff');
        gradient.addColorStop(0.85, '#c4eeff');
        gradient.addColorStop(1, '#f0e8d8');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1, 256);
        this.skyTexture=new THREE.CanvasTexture(canvas);
        this.skyTexture.colorSpace = THREE.SRGBColorSpace;
    }
}