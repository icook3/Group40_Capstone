// scene.js: Sets up and updates the A-Frame 3D world
export class ZlowScene {
  constructor(pacerSpeedKmh = 20, { getElement = (id) => document.getElementById(id) } = {}) {
    this.avatar = getElement('avatar');
    this.pacer = getElement('pacer');
    this.terrain = getElement('terrain');
    this.scene = getElement('scene');
    this.avatarPos = {x: -0.5, y: 1, z: 0}; // fixed
    this.pacerPos = {x: 0.5, y: 1, z: -2};
    this.pacerSpeed = pacerSpeedKmh;
    this.pacerActive = false; // Only start after rider moves
    this.worldZ = 0; // how far the world has moved
    this.groundTiles = [];
    this.objects = [];
    this.objectsLoaded = false;
    this.edgeObjects = [];
    // Helper functions for DRY object creation
    this._createBuilding = (x, y, z, w, h, d) => {
      const obj = document.createElement('a-entity');
      obj.setAttribute('geometry', `primitive: box; width: ${w}; height: ${h}; depth: ${d}`);
      const gray = Math.floor(128 + Math.random() * 80);
      obj.setAttribute('material', `color: rgb(${gray},${gray},${gray})`);
      obj.setAttribute('position', `${x} ${y} ${z}`);
      return obj;
    };
    this._createTree = (x, z) => {
      const obj = document.createElement('a-entity');
      const trunk = document.createElement('a-entity');
      trunk.setAttribute('geometry', 'primitive: cylinder; radius: 0.4; height: 2.5');
      trunk.setAttribute('material', 'color: #7c4a02');
      trunk.setAttribute('position', `0 1.25 0`);
      const foliage = document.createElement('a-entity');
      foliage.setAttribute('geometry', `primitive: sphere; radius: ${1.2 + Math.random()*0.8}`);
      foliage.setAttribute('material', 'color: #2e7d32');
      foliage.setAttribute('position', `0 2.7 0`);
      obj.appendChild(trunk);
      obj.appendChild(foliage);
      obj.setAttribute('position', `${x} 0 ${z}`);
      return obj;
    };
    this._initEdgeObjects();
  }
  // Call this to activate the pacer (from main.js when rider moves)
  activatePacer() {
    this.pacerActive = true;
  }

  setPacerSpeed(kmh) {
    this.pacerSpeed = kmh;
  }
  _initEdgeObjects() {
    // Place a dense row of trees/buildings along both edges of the ground (buildings further out)
    // Terrain is width 100, so edges at -50 and 50
    // Place every 5 units from z = 10 to z = -200 (match world object range)
    for (let side of [-1, 1]) {
      for (let z = 10; z > -200; z -= 5) {
        const isBuilding = Math.random() < 0.5;
        let obj;
        if (isBuilding) {
          const x = side * 65;
          const w = 3 + Math.random() * 3;
          const h = 8 + Math.random() * 8;
          const d = 3 + Math.random() * 3;
          obj = this._createBuilding(x, h/2, z, w, h, d);
        } else {
          const x = side * 50;
          obj = this._createTree(x, z);
        }
        this.scene.appendChild(obj);
        this.edgeObjects.push(obj);
      }
    }
  }

  _initObjects() {
    // Add more initial buildings and trees for higher density
    // Fill the first 200 units of z with objects, spaced every 5 units, but skip z in [-10, 10]
    for (let z = 0; z > -200; z -= 5) {
      this._spawnObject(z);
      // Optionally spawn a second object at the same z for more density
      if (Math.random() < 0.7) this._spawnObject(z);
    }
  }

  _spawnObject(z) {
    const isBuilding = Math.random() < 0.5;
    let obj, x;
    if (isBuilding) {
      x = (Math.random() < 0.5 ? -1 : 1) * (15 + Math.random() * 10);
      const w = 2 + Math.random() * 4;
      const h = 4 + Math.random() * 6;
      const d = 2 + Math.random() * 4;
      obj = this._createBuilding(x, h/2, z, w, h, d);
    } else {
      do {
        x = -20 + Math.random() * 40;
      } while (x > -4 && x < 4);
      obj = this._createTree(x, z);
    }
    this.scene.appendChild(obj);
    this.objects.push(obj);
  }

  update(riderSpeed, dt) {
    // Move world elements toward the rider
    const dz = riderSpeed * dt;
    this.worldZ += dz;
    // Delay dynamic object loading until rider has traveled 10m
    if (!this.objectsLoaded && this.worldZ >= 10) {
      this._initObjects();
      this.objectsLoaded = true;
    }
    // Move objects
    for (let obj of this.objects) {
      let pos = obj.getAttribute('position');
      pos.z += dz;
      // If object is behind the rider, respawn just ahead of the farthest object
      if (pos.z > 10) {
        // Find farthest z among all objects
        let farthestZ = Math.min(...this.objects.map(o => o.getAttribute('position').z));
        pos.z = farthestZ - 5;
        // Regenerate x: buildings further out, trees closer
        const isBuilding = obj.getAttribute('geometry') && obj.getAttribute('geometry').primitive === 'box';
        let x;
        if (isBuilding) {
          x = (Math.random() < 0.5 ? -1 : 1) * (15 + Math.random() * 10); // -15 to -25 or 15 to 25
        } else {
          do {
            x = -20 + Math.random() * 40;
          } while (x > -4 && x < 4);
        }
        pos.x = x;
      }
    }
    // Move and recycle dirt pattern circles to simulate infinite path
    const dirtPattern = document.getElementById('dirt-pattern');
    if (dirtPattern) {
      const children = Array.from(dirtPattern.children);
      for (let circle of children) {
        let pos = circle.getAttribute('position');
        if (typeof pos === 'string') pos = AFRAME.utils.coordinates.parse(pos);
        pos.z += dz;
        // If circle is behind the rider, move it far ahead to repeat the pattern
        if (pos.z > 10) {
          // Find farthest z among all pattern circles
          let farthestZ = Math.min(...children.map(c => {
            let p = c.getAttribute('position');
            if (typeof p === 'string') p = AFRAME.utils.coordinates.parse(p);
            return p.z;
          }));
          pos.z = farthestZ - 10; // space new patch 10 units ahead
        }
      }
    }
    // Animate rider legs based on speed (avatar and pacer)
    const animateLegs = (rider, speed, time) => {
      // Find leg entities (must match order in index.html)
      const legs = Array.from(rider.children).filter(e => e.getAttribute && e.getAttribute('geometry') && e.getAttribute('geometry').primitive === 'cylinder' && e.getAttribute('geometry').radius === 0.07);
      if (legs.length === 2) {
        // Animate: swing legs back and forth based on speed (max ±35deg at 50km/h)
        const maxSwing = 35; // degrees
        // Frequency: 1.5 Hz at 30 km/h, scale with speed
        const freq = 0.5 + Math.abs(speed) * 0.04; // Hz
        const phase = time * freq * 2 * Math.PI;
        const swing = Math.sin(phase) * Math.min(maxSwing, Math.abs(speed) * 0.7);
        // Rotate along Z axis for pedaling (so legs move forward/back along bike)
        legs[0].setAttribute('rotation', `10 0 ${10 + swing}`);
        legs[1].setAttribute('rotation', `-10 0 ${-10 - swing}`);
      }
    };
    // Animate avatar legs
    const now = performance.now() / 1000;
    animateLegs(this.avatar, riderSpeed * 3.6, now); // m/s to km/h
    // Animate pacer and move only if active
    if (this.pacerActive) {
      animateLegs(this.pacer, this.pacerSpeed * 3.6, now + 1.2); // offset pacer phase
      // Move pacer relative to world
      this.pacerPos.z -= (this.pacerSpeed - riderSpeed) * dt;
      this.pacer.setAttribute('position', `${this.pacerPos.x} ${this.pacerPos.y} ${this.pacerPos.z}`);
    }
    // Avatar stays fixed
    this.avatar.setAttribute('position', `${this.avatarPos.x} ${this.avatarPos.y} ${this.avatarPos.z}`);
  }

  getPacerDiff() {
    // Positive if ahead, negative if behind
    return Math.round((this.avatarPos.z - this.pacerPos.z) * -1);
  }
}
