import * as THREE from 'three';
import {constants} from '../constants.js'
export class changelogView {
    content;
    ready=false;
    constructor(setWhenDone) {
        fetch("../html/changelog.html").then((content)=> {
            return content.text();
        }).then((content)=> {
            this.content=content;
            if (setWhenDone) {
                this.setPage();
            }
            this.ready=true;
        });
    }

    setPage() {
        document.getElementById("mainDiv").innerHTML=this.content;
        this.createBG();
    }
    reset() {}

    scene;
    camera;
    renderer;

    grassX = 35;
    grassY = 25;

    cube;
    placeOldBuildings() {

    }
    placeNewBuildings() {

    }
    placeOldTrees() {

    }
    placeNewTrees() {

    }
    placeTrack() {

    }
    placeGrass() {
        const geometry = new THREE.BoxGeometry(1, 1, 0.1);
        const material1 = new THREE.MeshBasicMaterial({color:constants.groundColor1});
        const material2 = new THREE.MeshBasicMaterial({color:constants.groundColor2});
        const loader = new THREE.TextureLoader();
        let texture = loader.load('../../../resources/textures/Grass.jpeg', (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            const texMat = new THREE.MeshBasicMaterial({map: texture});
            let currentlyMat1=true;

            //old style grass
            for (let i=-this.grassX;i<-Math.round(this.grassX*0.25);i++) {
                for (let j=-this.grassY;j<this.grassY;j++) {
                    let grassPiece;
                    if (currentlyMat1) {
                        grassPiece = new THREE.Mesh(geometry, material1);
                    } else {
                        grassPiece = new THREE.Mesh(geometry, material2);
                    }
                    grassPiece.position.x=i;
                    grassPiece.position.y=j;
                    this.scene.add(grassPiece);
                    currentlyMat1=!currentlyMat1;
                }
                currentlyMat1=!currentlyMat1;
            }
            //start mixing in some new style grass
            for (let i=-Math.round(this.grassX*0.25);i<0;i++) {
                for (let j=-this.grassY;j<this.grassY;j++) {
                    let grassPiece;
                    //0.25 percent chance of new texture
                    if (Math.random()<0.25) {
                        grassPiece = new THREE.Mesh(geometry, texMat);
                    } else if (currentlyMat1) {
                        grassPiece = new THREE.Mesh(geometry, material1);
                    } else {
                        grassPiece = new THREE.Mesh(geometry, material2);
                    }
                    grassPiece.position.x=i;
                    grassPiece.position.y=j;
                    this.scene.add(grassPiece);
                    currentlyMat1=!currentlyMat1;
                }
                currentlyMat1=!currentlyMat1;
            }
            //mostly new style grass
            for (let i=0;i<Math.round(this.grassX*0.25);i++) {
                for (let j=-this.grassY;j<this.grassY;j++) {
                    let grassPiece;
                    //0.25 percent chance of old texture
                    if (Math.random()<0.75) {
                        grassPiece = new THREE.Mesh(geometry, texMat);
                    } else if (currentlyMat1) {
                        grassPiece = new THREE.Mesh(geometry, material1);
                    } else {
                        grassPiece = new THREE.Mesh(geometry, material2);
                    }
                    grassPiece.position.x=i;
                    grassPiece.position.y=j;
                    this.scene.add(grassPiece);
                    currentlyMat1=!currentlyMat1;
                }
                currentlyMat1=!currentlyMat1;
            }        
            //only new style grass
            for (let i=Math.round(this.grassX*0.25);i<this.grassX;i++) {
                for (let j=-this.grassY;j<this.grassY;j++) {
                    let grassPiece = new THREE.Mesh(geometry, texMat);
                    grassPiece.position.x=i;
                    grassPiece.position.y=j;
                    this.scene.add(grassPiece);
                    currentlyMat1=!currentlyMat1;                
                }
            }
        });    
    }
    createBG() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({alpha: true, premultipliedAlpha: false});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById("changelogBody").appendChild(this.renderer.domElement);
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({color:0x00ff00});
        this.cube = new THREE.Mesh(geometry, material);
        this.cube.position.x = -9;
        this.scene.add(this.cube);
        this.placeGrass();
        this.camera.position.z=10;
        this.camera.position.y=-10;
        this.camera.rotation.x = -100;
        this.renderer.setAnimationLoop((time)=>this.animate(time, this));
    }
    animate(time, owner=this) {
        //owner.cube.rotation.x=time/2000;
        //owner.cube.rotation.y=time/1000;
        owner.renderer.render(owner.scene, owner.camera);
    }
}