// js/scene/env/EdgeLineBand.js
import { getPos, setPos } from '../core/util.js';
import { TreeKind } from '../objects/kinds/Tree.js';
import { BuildingKind } from '../objects/kinds/Building.js';

/**
 * Static "actual edge" band. Builds once across a Z range.
 * No advance(), no recycle. Pure decoration at the terrain edges.
 */
export class EdgeLineBand {
  constructor({
    sceneEl,
    treeX = 50,        // terrain edge for trees
    buildingX = 65,    // slightly farther out for buildings
    zStart = 10,
    zEnd = -200,
    step = 5
  }) {
    this.sceneEl = sceneEl;
    this.items = [];
    this.treeX = treeX;
    this.buildingX = buildingX;

    for (const side of [-1, 1]) {
      for (let z = zStart; z > zEnd; z -= step) {
        const isBuilding = Math.random() < 0.5;
        const anchorX = side * (isBuilding ? buildingX : treeX);

        const obj = isBuilding
          ? BuildingKind.spawn(this.sceneEl, z)
          : TreeKind.spawn(this.sceneEl, z);

        obj.setAttribute('zlow-band', 'edge-line');
        obj.setAttribute('zlow-side', side === 1 ? 'right' : 'left');
        obj.setAttribute('zlow-edge-x', String(anchorX));

        const pos = getPos(obj);
        pos.x = anchorX + (Math.random() - 0.5) * 1.0; // tiny jitter ±0.5 m
        setPos(obj, pos);

        this.items.push(obj);
      }
    }
  }
}

