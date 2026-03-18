import { Achievement } from "../achievements/achievement.js";
import { achievementManager } from "../achievements/achievementManager.js";

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class achievementsView {
  content;
  ready = false;

  constructor(setWhenDone) {
    fetch("../html/achievements.html")
      .then((r) => r.text())
      .then((content) => {
        this.content = content;
        if (setWhenDone) {
            this.setPage();
        }
        this.ready = true;
      });
  }

  setPage() {
    document.getElementById("mainDiv").innerHTML = this.content;
    //get the number of achievements
    let achievementCount = achievementManager.achievements.size;
    //adjust based on screen size
    let colCount = 5;
    //let table = getElementById("achievementsTable");
    let HTML="";
    let rowCount = Math.ceil(achievementCount/colCount);

    console.log("row count = ",rowCount,"col count=",colCount);
    let arr=this.createAchievementsArr();
    let achCount=0;
    for (let i=0;i<rowCount;i++) {
        //create a table column
        HTML=HTML+"<tr>";
        for (let j=0;j<colCount;j++) {
            HTML=HTML+"<td class=\"achievementsTableSpot\"><div class=\"achievementsTableOuterDiv\">";
            HTML=HTML+this.createAchievementNode(arr[achCount]);
            achCount++;
            HTML=HTML+"</div></td>";
        }
        HTML=HTML+"</tr>";
    }
    //console.log("Adding HTML ",HTML);
    document.getElementById("achievementsTable").innerHTML=HTML;
    // Three.js background
    const canvas = this.initBackground();
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = "-1";
    document.getElementById("achievementsBackground").appendChild(canvas);
    //canvas.style.filter = "blur(3px)";  // blurs the background
  }
  reset() {}

  //used so I can index achievements
  createAchievementsArr() {
    let arr = [];
    achievementManager.achievements.forEach((value)=> {
        arr.push(value);
    });
    return arr;
  }

  /**
   * @param {Achievement} achievement 
   */
    createAchievementNode(achievement) {
        //console.log("Creating achievement node for achievement ",achievement);
        if (achievement==undefined) {
            return "";
        }
        let HTML="";
        //add the image
        HTML=HTML+"<img src=\"";
        HTML=HTML+achievement.imagePath;
        if (achievement.unlocked) {
            HTML=HTML+"\" class=\"achievementImg\"/>";
        } else {
            HTML=HTML+"\" class=\"achievementImg achievementNotObtainedImg\"/>";
        }
        HTML=HTML+"<div class=\"achievementsTableInnerDiv\">";
        HTML=HTML+"<span class=\"achievementName\">";
        //add the name
        HTML=HTML+achievement.name;
        HTML=HTML+"</span>";
        HTML=HTML+"<span class=\"achievementDate\">";
        //add the date
        if (achievement.unlocked) {
            HTML=HTML+achievement.unlockDate.getMonth();
            HTML=HTML+"/";
            HTML=HTML+achievement.unlockDate.getDate();
            HTML=HTML+"/";
            HTML=HTML+achievement.unlockDate.getFullYear();
        } else {
            HTML=HTML+"UNOBTAINED";
        }
        HTML=HTML+"</span>";
        HTML=HTML+"</div>";
        //add the description
        HTML=HTML+"<span class=\"achievementDescription\">";
        HTML=HTML+achievement.description;
        HTML=HTML+"</span>";
        return HTML;
    }
    //THREE JS elements
    scene;
    renderer;
    camera;
    // This function helps load models and places them in the scene
    loadModel(path, position, rotation, scale, loader) {
        loader.load(
            path,
            (gltf) => {
                const model = gltf.scene;
                model.position.set(position.x, position.y, position.z);
                model.rotation.set(
                    THREE.MathUtils.degToRad(rotation.x),
                    THREE.MathUtils.degToRad(rotation.y),
                    THREE.MathUtils.degToRad(rotation.z)
                );
                model.scale.set(scale, scale, scale);
        
                this.scene.add(model);
                console.log(`Loaded: ${path}`, model.position, 'Children:', model.children.length);
            },
            undefined,
            (error) => {
                console.error(`Failed to load model: ${path}`, error);
            }
        );
    }
    initBackground() {
        // Scene
        this.scene = new THREE.Scene();

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            80,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(-3.33, .18, 2.6);
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = THREE.MathUtils.degToRad(-20);
        this.camera.rotation.x = THREE.MathUtils.degToRad(11);

          // What renders the scene
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;

        // Grass plane
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x58995f,
            roughness: 1
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = THREE.MathUtils.degToRad(-90);
        ground.position.set(0, 0, 0);
        this.scene.add(ground);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(-2, 5, 3);
        this.scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0xffffff, 5.0, 1.5);
        pointLight.position.set(-2, 0, 2);
        this.scene.add(pointLight);

          // GLB Models
        const loader = new GLTFLoader();
        const modelBasePath = '../../resources/models';

        
        // Tree
        this.loadModel(
            `${modelBasePath}/bgmodels/tree1.glb`,
            { x: -2.5, y: 0.1, z: 2 },
            { x: 0, y: 80, z: 0 },
            0.8,
            loader
        );

        // Bike
        this.loadModel(
            `${modelBasePath}/playermodels/bikeV4.glb`,
            { x: -2.65, y: 0, z: 2 },
            { x: 0, y: -10, z: -20 },
            0.1,
            loader
        );

        // Bush
        this.loadModel(
            `${modelBasePath}/bgmodels/bush1.glb`,
            { x: -3.58, y: 0, z: 2.1 },
            { x: 0, y: 45, z: 0 },
            0.3,
            loader
        );

        // Clouds
        this.loadModel(`${modelBasePath}/bgmodels/cloud1.glb`,
            { x: -8, y: 4, z: -5 }, { x: 0, y: 0, z: 0 }, 0.1, loader);

        this.loadModel(`${modelBasePath}/bgmodels/cloud2.glb`,
            { x: -3, y: 8.2, z: -9 }, { x: 0, y: 0, z: 0 }, 0.2, loader);

        this.loadModel(`${modelBasePath}/bgmodels/cloud3.glb`,
            { x: -16, y: 6, z: -10 }, { x: 0, y: 0, z: 0 }, 0.3, loader);

        this.loadModel(`${modelBasePath}/bgmodels/cloud3.glb`,
            { x: 60, y: 20, z: -10 }, { x: 0, y: 0, z: 0 }, 0.5, loader);

        this.loadModel(`${modelBasePath}/bgmodels/cloud1.glb`,
            { x: 100, y: 40, z: -5 }, { x: 0, y: 0, z: 0 }, 0.4, loader);

        // Buildings
        this.loadModel(`${modelBasePath}/bgmodels/TallBuilding.glb`,
            { x: -4, y: -0.25, z: -20 }, { x: 0, y: -50, z: 10 }, 1.0, loader);

        this.loadModel(`${modelBasePath}/bgmodels/House.glb`,
            { x: 50, y: 0, z: -18 }, { x: 0, y: 180, z: 0 }, 2.0, loader);

        this.loadModel(`${modelBasePath}/bgmodels/WideBuilding.glb`,
            { x: -7, y: -0.25, z: -28 }, { x: 0, y: -50, z: 10 }, 1.2, loader);

        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        this.animate({owner:this});

        return this.renderer.domElement;
    }
    animate({owner=this}) {
        requestAnimationFrame(()=>this.animate({owner:owner}));
        owner.renderer.render(owner.scene, owner.camera);
    }
}