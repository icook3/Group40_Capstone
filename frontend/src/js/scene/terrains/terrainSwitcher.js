import { DefaultTerrain } from "./DefaultTerrain.js";
import { TestTerrain } from "./TestTerrain.js";
class TerrainSwitcher {
    terrains = {
        defaultTerrain: {terrain: new DefaultTerrain(), name: "defaultTerrain"},
        testTerrain: {terrain: new TestTerrain(), name: "testTerrain"}
    };
    /**
     * @type {DefaultTerrain}
     */
    currentTerrain=this.terrains.defaultTerrain;
    /**
     * Pass in objects from the terrains object
     * @param {{terrain: DefaultTerrain, name: string}} terrain 
     */
    setTerrain(terrain) {
        this.currentTerrain=terrain.terrain;
        localStorage.setItem("Terrain",terrain.name);
    }
    constructor() {
        let startTerrain = localStorage.getItem("Terrain");
        if (startTerrain==null) {
            this.setTerrain(this.terrains.defaultTerrain);
        } else {
            //use this syntax to avoid a lengthy switch statement
            this.currentTerrain=this.terrains[startTerrain].terrain;
        }
    }
}

export let terrainSwitcher = new TerrainSwitcher();