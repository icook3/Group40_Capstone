# Terrains Interface

A class using the **Terrains** interface represents a possible terrain

## Required methods/fields

- **cfg** → {globals: object, bands: BandPolicy[]}
    - A cfg object containing some globals and a bandPolicy. 
    - See policy/BandPolicy.md for documentation on bandPolicies. 
    - For an example of this object, see policy/edge_default_cfg.js
- **bulidingSelect(idx: Number)** → {modelId: string, y: Number, scale: Number}
    - Randomly picks a building model. 
    - Allows picking which models will appear, and which ones will not appear
    - Can either be defined by bands in the cfg, or you can define a default here
- **treeSelect(idx: Number)** → {modelId: string, y: Number, scale: Number}
    - Randomly picks a tree model. 
    - Allows picking which models will appear, and which ones will not appear
    - Can either be defined by bands in the cfg, or you can define a default here