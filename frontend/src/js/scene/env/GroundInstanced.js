// An instanced version of the ground plane to reduce draw calls
// - Builds the tile grid in LOCAL space (centered around origin)
// - Repositions the whole instanced patch under the rider each frame (snapped to tileSize)
// - Uses MeshBasicMaterial so it won’t go black due to lighting

AFRAME.registerComponent("ground-instanced", {
  init() {
    this._built = false;
    this.mesh = null;
    this.riderEl = null;
    this.tileSize = 1;
    this.halfW = 0;
    this.halfD = 0;

    const tryBuild = () => {
      if (this._built) return;

      const THREE = window.THREE;
      const c = window.__zlow?.constants;
      const img = document.querySelector("#grass-texture");

      // Wait until THREE, constants, and the <img> asset are ready
      if (!THREE || !c || !img || !img.complete) return;

      this._built = true;
      this.build(THREE, c, img);
    };

    // Try immediately, then keep trying until ready
    this._interval = setInterval(tryBuild, 100);
    this._tryBuild = tryBuild;
    this.el.sceneEl?.addEventListener("loaded", tryBuild);
  },

  build(THREE, c, img) {
    clearInterval(this._interval);

    this.tileSize = c.tileSize;

    const count = c.gridWidth * c.gridDepth;

    // Shared geometry/material for all instances
    const geom = new THREE.BoxGeometry(c.tileSize, c.height, c.tileSize);

    // Texture from the <img> in <a-assets>
    const tex = new THREE.Texture(img);
    this.tex = tex;
    tex.needsUpdate = true;

    // Basic so lighting cannot turn it black
    const mat = new THREE.MeshBasicMaterial({ map: tex });

    const mesh = new THREE.InstancedMesh(geom, mat, count);
    const dummy = new THREE.Object3D();

    // Build a patch centered around local origin
    const halfW = (c.gridWidth * c.tileSize) * 0.5;
    const halfD = (c.gridDepth * c.tileSize) * 0.5;
    this.halfW = halfW;
    this.halfD = halfD;

    let i = 0;
    for (let z = 0; z < c.gridDepth; z++) {
      for (let x = 0; x < c.gridWidth; x++) {
        // Centered grid: X left->right, Z front->back
        dummy.position.set(
          (x * c.tileSize) - halfW,
          0,
          (-(z * c.tileSize)) + halfD
        );
        dummy.updateMatrix();
        mesh.setMatrixAt(i++, dummy.matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;

    // Attach the mesh to this entity
    this.el.setObject3D("mesh", mesh);
    this.mesh = mesh;

    // Put the TOP of the tile boxes at world y=0 (A-Frame ground plane convention)
    // BoxGeometry is centered, so lift it down by half its height.
    this.el.object3D.position.y = -(c.height * 0.5);

    // Cache rider for following
    this.riderEl = document.getElementById("rider");
  },

  tick() {
    if (!this.mesh || !this.riderEl) return;

    const p = this.riderEl.object3D.position;

    // Snap to tile boundaries so the texture doesn’t “swim”
    const snappedX = Math.floor(p.x / this.tileSize) * this.tileSize;
    const snappedZ = Math.floor(p.z / this.tileSize) * this.tileSize;

    // Keep the instanced patch centered under the rider
    this.el.object3D.position.x = snappedX;
    this.el.object3D.position.z = snappedZ;
  },

  remove() {
    clearInterval(this._interval);

    // Dispose resources
    if (this.mesh) {
      this.mesh.geometry?.dispose();
      this.mesh.material?.dispose();
      this.el.removeObject3D("mesh");
      this.mesh = null;
    }

    this.el.sceneEl?.removeEventListener("loaded", this._tryBuild);
    this._tryBuild = null;

    if (this.mesh) {
      // dispose texture FIRST
      this.mesh.material?.map?.dispose?.();   // or this.tex?.dispose?.()
      this.tex = null;

      this.mesh.geometry?.dispose();
      this.mesh.material?.dispose();
      this.el.removeObject3D("mesh");
      this.mesh = null;
    }
  }
});

