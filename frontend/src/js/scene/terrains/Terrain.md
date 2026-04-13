# Terrains Interface

A class using the **Terrains** interface represents a possible terrain

## Required methods/fields

- **cfg** → `{globals: object, bands: BandPolicy[]}`
    - A cfg object containing some globals and a bandPolicy. 
    - See policy/BandPolicy.md for documentation on bandPolicies. 
    - For an example of this object, see policy/edge_default_cfg.js
- **bulidingSelect(idx: Number)** → `{modelId: string, y: Number, scale: Number}`
    - Randomly picks a building model. 
    - Allows picking which models will appear, and which ones will not appear
    - Can either be defined by bands in the cfg, or you can define a default here
    - Prioritize using cfg[idx].buildingSubtype() to get random possibilities for buildings, hardcoded probabilities are only used if this is null
- **treeSelect(idx: Number)** → `{modelId: string, y: Number, scale: Number}`
    - Randomly picks a tree model. 
    - Allows picking which models will appear, and which ones will not appear
    - Can either be defined by bands in the cfg, or you can define a default here
    - Prioritize using cfg[idx].treeSubtype() to get random possibilities for trees, hardcoded probabilities are only used if this is null
- **trackImg** → `string`
    - The location of the track texture, starting from resources/textures/, and including the extension
- **grassImg** → `string`
    - The location of the grass texture, starting from resources/textures/, and including the extension
- **trackMaterial** → `THREE.MeshStandardMaterial`
    - The material for the track
- **trackMaterialDouble** → `THREE.MeshStandardMaterial`
    - The double-sided material for the track
- **groundMaterial** → `THREE.MeshStandardMaterial`
    - The material for the ground
- **sky** → `THREE.CanvasTexture`
    - A texture for the sky in the background of scenes
- **constructor()** → `Terrain`
    - Initializes the colors for the sky

## Notes
- To add new terrains, first create your terrain.js file. 
- If needed, you can create a new scene policy.js file, or it can be included directly in the terrain.js file. 
- Scene policy JS files are reusable. If you want the same background scenery but different track/grass textures for two different terrains, you can use the same scene policy. 
- Then, add it to the terrains object of terrainSwitcher.js. 
- Lastly, we have to add a way for users to switch between terrains (WIP). 