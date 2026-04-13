import  cfg  from '../policy/edge_default_cfg.js';
export class DefaultTerrain {
    cfg=cfg;
    buildingSelect(idx) {
        const roll = Math.random();

        let modelId;
        let scale;
        let y;
        const subtypes = cfg[idx]?.buildingSubtype?.() || {
          tall: 0.33,
          wide: 0.33,
          house: 0.34
        };
        if (roll < subtypes.house) {
          modelId = "house";
          scale = 6 + Math.random() * 2;
          y = 1.5;
        } else if (roll < subtypes.house + subtypes.wide) {
          modelId = "wideBuilding";
          scale = 8 + Math.random() * 5;
          y = 0.5;
        } else {
          modelId = "tallBuilding";
          scale = 6 + Math.random() * 3;
          y = 0.5;
        }
        return {modelId: modelId, scale: scale, y: y};
    }
    treeSelect(idx) {
        const roll=Math.random();

        let modelId;
        let scale;
        let y=0;
        const subtypes = cfg[idx]?.treeSubtype?.() || {
          bush1: 0.25,
          tree1: 0.25,
          tree2: 0.25,
          tree3: 0.25
        };
        if (roll < subtypes.bush1) {
            modelId="bush1";
            scale = 1.2 + Math.random() * 0.8;
        } else if (roll<subtypes.tree1+subtypes.bush1) {
            modelId="tree1";
            scale = 4 + Math.random() * 4;
        } else if (roll<subtypes.tree2+subtypes.tree1+subtypes.bush1) {
            modelId="tree2";
            scale = 4 + Math.random() * 4;
        } else {
            modelId="tree3";
            scale = 4 + Math.random() * 4;
        }
        return {modelId: modelId, scale: scale, y: y};
    }
}