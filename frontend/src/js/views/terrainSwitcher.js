import * as THREE from 'three';
import { AvatarMovement } from "../avatarMovement.js";
import { Track } from "../scene/env/Track.js";
import { Cloud } from "../scene/env/Cloud.js";
import { SceneryManager } from "../scene/env/SceneryManager.js";
import { constants } from "../constants.js"
import {GroundInstanced} from "../scene/env/GroundInstanced.js";
import { terrainSwitcher } from '../scene/terrains/terrainSwitcher.js';
import { ViewManager } from './viewManager.js';
import { ZlowScene } from '../scene/index.js';
export class terrainSelectionView {
    content;
    ready=false;
    
    constructor(setWhenDone) {
        fetch("../html/terrainSwitcher.html").then((content)=> {
            return content.text();
        }).then((content)=> {
            this.content=content;
            if (setWhenDone) {
                this.setPage();
            }
            this.ready=true;
        });
    }
    terrainIdx=0;
    /**
     * CHANGE THIS when adding new terrains
     */
    terrains=["defaultTerrain","SnowTerrain"];
    renderer=null;
    setPage() {
        document.getElementById("mainDiv").innerHTML=this.content;
        localStorage.setItem("Terrain", this.terrains[0]);
        terrainSwitcher.setTerrain(terrainSwitcher.terrains[this.terrains[0]]);
        /*let camera = new THREE.PerspectiveCamera(
            80,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );*/
        let nextButton = document.getElementById("next");
        let prevButton = document.getElementById("previous");
        let selectButton = document.getElementById("selectButton");
        nextButton.addEventListener("click",()=> {
            this.changeTerrain(1);
        });
        prevButton.addEventListener("click",()=> {
            this.changeTerrain(-1);
        });
        selectButton.addEventListener("click",()=> {
            localStorage.setItem("terrain", this.terrains[this.terrainIdx]);
            window.viewManager.setView(viewManager.views.mainMenu);
        });
        let canvas = this.setPageBackground();
        document.getElementById("mainDiv").appendChild(canvas);
    }
    reset() {
        this.destroyScene();
    }
    /**
     * @type {ZlowScene}
     */
    scene;
    setPageBackground() {
        this.scene = new ZlowScene();
        let animateScene=this.scene;
        // Add animation function
        function animate() {
            requestAnimationFrame(animate);
            animateScene.renderer.render(animateScene.scene, animateScene.cam.camera);
        }

        animate();
    
        // Return final element for attachment to the page
        return this.scene.renderer.domElement;
    }
    destroyScene() {
        if (this.renderer) {
            this.renderer.dispose();
        }
        let canvas = document.querySelector('canvas');
        if (canvas) {
            canvas.remove();
        }
        if (this.scene!=null) {
            this.scene.destroy();
            this.scene=null;
        }
        window.__zlowSceneInstance = null;
        window.__zlowTrackInstance = null;
        constants.farthestSpawn=1;
        constants.currentTrackPiece=0;
        constants.pacerCurrentTrackPiece=0;
        constants.trackPoints=[];
        constants.lastTime=Date.now();
        constants.worldZ=0;
        constants.lastCloud = Date.now();
        constants.cloudSpeed = 0;
        constants.updateEvery=0;
    }
    changeTerrain(increment) {
        if (!increment) {
            alert("No incrementation value has been provided. Cannot change scene!");
            return;
        }
        if ((this.terrainIdx+increment)==(this.terrains.length)) {
            this.terrainIdx=0;
        } else if (this.terrainIdx+increment<0) {
            this.terrainIdx=this.terrains.length-1;
        } else {
            this.terrainIdx+=increment;
        }
        terrainSwitcher.setTerrain(terrainSwitcher.terrains[this.terrains[this.terrainIdx]]);
        //clear the THREEJS Scene
        this.destroyScene();

        let canvas = this.setPageBackground();
        document.getElementById("mainDiv").appendChild(canvas);
    }
}