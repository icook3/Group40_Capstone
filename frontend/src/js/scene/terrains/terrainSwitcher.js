import { DefaultTerrain } from "./DefaultTerrain.js";
class TerrainSwitcher {
    terrains = {
        defaultTerrain: new DefaultTerrain()
    };
    /**
     * @type {DefaultTerrain}
     */
    currentTerrain=this.terrains.defaultTerrain;
    /**
     * Can technically be any terrain
     * Use the terrains object to get all possible terrains
     * @param {DefaultTerrain} terrain 
     */
    setTerrain(terrain) {
        this.currentTerrain=terrain;
    }
}

export let terrainSwitcher = new TerrainSwitcher();