import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function initMenuBackground() {
  // Scene
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(
    80,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(-3.33, .18, 2.6);
  camera.rotation.order = 'YXZ';
  camera.rotation.y = THREE.MathUtils.degToRad(-20);
  camera.rotation.x = THREE.MathUtils.degToRad(11);

  // What renders the scene
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Grass plane
  const groundGeometry = new THREE.PlaneGeometry(50, 50);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x58995f,
    roughness: 1
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = THREE.MathUtils.degToRad(-90);
  ground.position.set(0, 0, 0);
  scene.add(ground);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(-2, 5, 3);
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0xffffff, 5.0, 3);
  pointLight.position.set(-2, 0, 2);
  scene.add(pointLight);

  // GLB Models
  const loader = new GLTFLoader();
  const modelBasePath = '../../resources/models';

  // This function helps load models and places them in the scene
function loadModel(path, position, rotation, scale) {
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
        
        scene.add(model);
        console.log(`Loaded: ${path}`, model.position, 'Children:', model.children.length);
      },
      undefined,
      (error) => {
        console.error(`Failed to load model: ${path}`, error);
      }
    );
  }

  // Tree
  loadModel(
    `${modelBasePath}/bgmodels/tree1.glb`,
    { x: -2.5, y: 0.1, z: 2 },
    { x: 0, y: 80, z: 0 },
    0.8
  );

  // Bike
  loadModel(
    `${modelBasePath}/playermodels/bikeV4.glb`,
    { x: -2.65, y: 0, z: 2 },
    { x: 0, y: -10, z: -20 },
    0.1
  );

  // Bush
  loadModel(
    `${modelBasePath}/bgmodels/bush1.glb`,
    { x: -3.58, y: 0, z: 2.1 },
    { x: 0, y: 45, z: 0 },
    0.3
  );

  // Clouds
  loadModel(`${modelBasePath}/bgmodels/cloud1.glb`,
    { x: -8, y: 4, z: -5 }, { x: 0, y: 0, z: 0 }, 0.1);

  loadModel(`${modelBasePath}/bgmodels/cloud2.glb`,
    { x: -3, y: 8.2, z: -9 }, { x: 0, y: 0, z: 0 }, 0.2);

  loadModel(`${modelBasePath}/bgmodels/cloud3.glb`,
    { x: -16, y: 6, z: -10 }, { x: 0, y: 0, z: 0 }, 0.3);

  loadModel(`${modelBasePath}/bgmodels/cloud3.glb`,
    { x: 60, y: 20, z: -10 }, { x: 0, y: 0, z: 0 }, 0.5);

  loadModel(`${modelBasePath}/bgmodels/cloud1.glb`,
    { x: 100, y: 40, z: -5 }, { x: 0, y: 0, z: 0 }, 0.4);

  // Buildings
  loadModel(`${modelBasePath}/bgmodels/TallBuilding.glb`,
    { x: -4, y: -0.25, z: -20 }, { x: 0, y: -50, z: 10 }, 1.0);

  loadModel(`${modelBasePath}/bgmodels/House.glb`,
    { x: 50, y: 0, z: -18 }, { x: 0, y: 180, z: 0 }, 2.0);

  loadModel(`${modelBasePath}/bgmodels/WideBuilding.glb`,
    { x: -7, y: -0.25, z: -28 }, { x: 0, y: -50, z: 10 }, 1.2);

  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Animation loop - needed in three js apparently
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();

  return renderer.domElement;
}