import * as THREE from 'three';
import {constants} from '../constants.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
export class changelogView {
    content;
    ready=false;
    constructor(setWhenDone) {
        fetch("../html/changelog.html").then((content)=> {
            this.createBG();
            return content.text();
        }).then((content)=> {
            this.content=content;
            if (setWhenDone) {
                this.setPage();
            }
            this.ready=true;
            window.objPositions = this.objPositions;
        });
    }

    setPage() {
        document.getElementById("mainDiv").innerHTML=this.content;
        if (this.useOrbitDebugMode) {
            const controls = new OrbitControls(this.camera, document.getElementById("changelogBody"));
            controls.target.set( 0, 5, 0 );
	        controls.update();
        }
        document.getElementById("changelogBody").appendChild(this.renderer.domElement);
        this.renderer.setAnimationLoop((time)=>this.animate(time, this));
    }
    reset() {}

    scene;
    camera;
    renderer;

    grassX = 35;
    grassY = 25;
    OldBuildingCount = 30;
    newBuildingCount = 20;
    oldTreeCount = 20;
    newTreeCount = 20;

    useOrbitDebugMode=false;

    objPositions = [];
    maxDistance = 10;

    placeOldBuildings() {
        //old buildings were a grey rectangle
        for (let i=0;i<this.OldBuildingCount;i++) {
            const g = Math.floor(128+Math.random()*80);

            let color = new THREE.Color().setRGB(g/255,g/255,g/255);
            const material = new THREE.MeshBasicMaterial({color:color});
            material.color=color;
            const w = 2+Math.random()*4;
            const h = 4+Math.random()*6;
            const d = 2 + Math.random()*4;
            const geometry = new THREE.BoxGeometry(w/10, h/10, d/10);
            let building = new THREE.Mesh(geometry, material);
            let position = new THREE.Vector3(-(5+Math.random()*10), -20+Math.random()*30, 0);
            this.objPositions.push(position);
            building.position.set(position.x, position.y, position.z);
            this.scene.add(building);
        }
    }
    placeNewBuildings() {
        const loader = new GLTFLoader();
        for (let i=0;i<this.newBuildingCount;i++) {
            //pick one out of 3 types
            let type = Math.random();
            if (type<0.33) {
                loader.load('../../resources/models/bgmodels/House.glb', (gltf) => {
                    let position = new THREE.Vector3((5+Math.random()*10), -20+Math.random()*30, 0.25);
                    this.objPositions.push(position);
                    gltf.scene.position.set(position.x, position.y, position.z);
                    gltf.scene.rotation.x=Math.PI/2;
                    gltf.scene.rotation.y=-Math.PI/2;
                    //console.log(gltf);
                    this.scene.add(gltf.scene);
                }, undefined, function(error) {
                    console.log(error);
                });
            } else if (type<0.66) {
                loader.load('../../resources/models/bgmodels/TallBuilding.glb', (gltf) => {
                    let position = new THREE.Vector3((5+Math.random()*10), -20+Math.random()*30, 0);
                    this.objPositions.push(position);
                    gltf.scene.position.set(position.x, position.y, position.z);
                    gltf.scene.rotation.x=Math.PI/2;
                    gltf.scene.rotation.y=-Math.PI/2;
                    //console.log(gltf);
                    this.scene.add(gltf.scene);
                }, undefined, function(error) {
                    console.log(error);
                });
            } else {
                loader.load('../../resources/models/bgmodels/WideBuilding.glb', (gltf) => {
                    let position = new THREE.Vector3((5+Math.random()*10), -20+Math.random()*30, 0);
                    this.objPositions.push(position);
                    gltf.scene.position.set(position.x, position.y, position.z);
                    gltf.scene.rotation.x=Math.PI/2;
                    gltf.scene.rotation.y=-Math.PI/2;
                    //console.log(gltf);
                    this.scene.add(gltf.scene);
                }, undefined, function(error) {
                    console.log(error);
                });
            }
            
        }
        
    }
    placeOldTrees() {
        for (let i=0;i<this.oldTreeCount;i++) {
            //old trees were made of two components
            //the trunk and the foliage

            let material1 = new THREE.MeshBasicMaterial({color:0x7c4a02});
            let material2 = new THREE.MeshBasicMaterial({color:0x2e7d32});
            const trunkGeo = new THREE.CylinderGeometry(0.2,0.2,0.625);
            const trunk = new THREE.Mesh(trunkGeo, material1);
            let position = new THREE.Vector3(-(5+Math.random()*10), -20+Math.random()*30, 0.3125);
            this.objPositions.push(position);
            trunk.position.set(position.x, position.y, position.z);
            trunk.rotation.x=Math.PI/2;
            this.scene.add(trunk);

            const foliageGeo = new THREE.SphereGeometry(0.6+Math.random()*0.4);
            const foliage = new THREE.Mesh(foliageGeo,material2);
            foliage.position.set(position.x, position.y, 1.35);
            this.scene.add(foliage);
        }
    }
    placeNewTrees() {
        const loader = new GLTFLoader();
        for (let i=0;i<this.newTreeCount;i++) {
            //pick one out of 3 types
            let type = Math.random();
            if (type<0.25) {
                loader.load('../../resources/models/bgmodels/bush1.glb', (gltf) => {
                    let position = new THREE.Vector3((5+Math.random()*10), -20+Math.random()*30, 0);
                    this.objPositions.push(position);
                    gltf.scene.position.set(position.x, position.y, position.z);
                    gltf.scene.rotation.x=Math.PI/2;
                    gltf.scene.rotation.y=-Math.PI/2;
                    //console.log(gltf);
                    this.scene.add(gltf.scene);
                }, undefined, function(error) {
                    console.log(error);
                });
            } else if (type<0.5) {
                loader.load('../../resources/models/bgmodels/tree1.glb', (gltf) => {
                    let position = new THREE.Vector3((5+Math.random()*10), -20+Math.random()*30, 0);
                    this.objPositions.push(position);
                    gltf.scene.position.set(position.x, position.y, position.z);
                    gltf.scene.rotation.x=Math.PI/2;
                    gltf.scene.rotation.y=-Math.PI/2;
                    //console.log(gltf);
                    this.scene.add(gltf.scene);
                }, undefined, function(error) {
                    console.log(error);
                });
            } else if (type<0.75) {
                loader.load('../../resources/models/bgmodels/tree2.glb', (gltf) => {
                    let position = new THREE.Vector3((5+Math.random()*10), -20+Math.random()*30, 0);
                    this.objPositions.push(position);
                    gltf.scene.position.set(position.x, position.y, position.z);
                    gltf.scene.rotation.x=Math.PI/2;
                    gltf.scene.rotation.y=-Math.PI/2;
                    //console.log(gltf);
                    this.scene.add(gltf.scene);
                }, undefined, function(error) {
                    console.log(error);
                });
            } else {
                loader.load('../../resources/models/bgmodels/tree3.glb', (gltf) => {
                    let position = new THREE.Vector3((5+Math.random()*10), -20+Math.random()*30, 0);
                    this.objPositions.push(position);
                    gltf.scene.position.set(position.x, position.y, position.z);
                    gltf.scene.rotation.x=Math.PI/2;
                    gltf.scene.rotation.y=-Math.PI/2;
                    //console.log(gltf);
                    this.scene.add(gltf.scene);
                }, undefined, function(error) {
                    console.log(error);
                });                
            }
            
        }
    }
    //place the track running along the back
    placeTrack() {
        const geometry = new THREE.BoxGeometry(1, 2, 0.1);
        const loader = new THREE.TextureLoader();
        let texture = loader.load('../../../resources/textures/Track.jpeg', (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            const texMat = new THREE.MeshBasicMaterial({map: texture});
            for (let i=-this.grassX; i<this.grassX;i++) {
                let trackPiece = new THREE.Mesh(geometry, texMat);
                trackPiece.position.x=i;
                trackPiece.position.z=0.1;
                trackPiece.position.y=13.5;
                this.scene.add(trackPiece);
            }
        });
    }
    //place grass on the screen
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
        this.placeGrass();
        this.placeTrack();
        this.placeOldBuildings();
        this.placeNewBuildings();
        this.placeOldTrees();
        this.placeNewTrees();
        const light = new THREE.AmbientLight(0xFFFFFF, 1);
        this.scene.add(light);
        this.camera.position.z=10;
        this.camera.position.y=-10;
        this.camera.rotation.x = -100;

        //check for resizing window
        window.addEventListener('resize', ()=> {
            this.camera.aspect=window.innerWidth/window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }, false);
    }
    animate(time, owner=this) {
        owner.renderer.render(owner.scene, owner.camera);
    }
}