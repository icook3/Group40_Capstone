import { setPos } from "../../core/util.js";

function sampleTreeX() {
  // original behavior: uniform [-20,20] but exclude path (-4..4)
  let x;
  do {
    x = -20 + Math.random() * 40;
  } while (x > -4 && x < 4);
  return x;
}

export const TreeKind = {
  name: "tree",
  spawn(sceneEl, z) {
    const x = sampleTreeX();
    const obj = document.createElement("a-entity");
    obj.setAttribute("zlow-kind", "tree"); // mark kind explicitly

    // different tree types
    const treeTypes = ["tree1", "tree2", "tree3"];
    const bushChance = 0.25; //chance of a bush instead

    let modelId;
    if (Math.random() < bushChance) {
      modelId = "tree-bush1";
    } else {
      modelId = treeTypes[Math.floor(Math.random() * treeTypes.length)];
    }

    // get glb model
    obj.setAttribute("gltf-model", `#${modelId}`);

    // testing 
    const onModelLoaded = () => {
      const mesh = obj.getObject3D("mesh");
      if (mesh) {
        mesh.traverse((node) => {
          if (node.isMesh && node.material) {
            if (node.material.color) {
              //this controls the brightness
              node.material.color.multiplyScalar(3);
            }

            // other material properties that can be tweaked
            node.material.roughness = 0.85;

            node.material.needsUpdate = true;
          }
        });
      }

      // IMPORTANT: avoid retaining a closure/listener forever
      obj.removeEventListener("model-loaded", onModelLoaded);
    };

    obj.addEventListener("model-loaded", onModelLoaded);

    // rotate tree randomly as well
    const rotation = Math.random() * 360;
    obj.setAttribute("rotation", `0 ${rotation} 0`);

    // scale trees randomly from 450-490%
    // bushes from 200-220%
    let scale;
    if (modelId === "tree-bush1") {
      scale = 1.2 + Math.random() * 0.8;
    } else {
      scale = 4 + Math.random() * 4;
    }

    obj.setAttribute("scale", `${scale} ${scale} ${scale}`);

    setPos(obj, { x, y: 0, z });
    sceneEl.appendChild(obj);
    return obj;
  },
  resampleX() {
    return sampleTreeX();
  },
};
