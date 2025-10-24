// Dense rows of trees/buildings along the far edges to increase depth
// More static buildings/trees, buildings always at x=65, trees always at x=50
import { getPos, setPos } from '../core/util.js';
import { TreeKind } from '../objects/kinds/Tree.js';
import { BuildingKind } from '../objects/kinds/Building.js';

export class EdgeBand {
  constructor({ sceneEl }) {
    this.sceneEl = sceneEl;
    this.items = [];
    this._init();
  }

  _spawnAtEdge(side, z) {
    const isBuilding = Math.random() < 0.5;
    const x = isBuilding ? side * 65 : side * 50;

    // Build with the shared kind spawners so visuals stay consistent
    const obj = isBuilding
      ? BuildingKind.spawn(this.sceneEl, z)
      : TreeKind.spawn(this.sceneEl, z);

    // Override X to the edge band, keep existing Y from the kind
    const pos = getPos(obj);
    pos.x = x;
    setPos(obj, pos);
    //console.log("Placing object at (" + pos.x + ", " + pos.y + ", " + pos.z + "). This is in EdgeBand");
    this.items.push(obj);
    return obj;
  }

  _init() {
    // Edges at ±50 (trees) and ±65 (buildings), z from 10 back to -200 every 5
    for (const side of [-1, 1]) {
        for (let z = 10; z > -200; z -= 5) {
            let obj = this._spawnAtEdge(side, z);
            if (obj.getAttribute('zlow-kind') == 'building' && obj.getAttribute('zlow-building-type') == 'wide-building') {
                let pos = getPos(obj);
                pos.z -= 5;
                z -= 5;
                setPos(obj, pos);
            }
      }
    }
  }
}

