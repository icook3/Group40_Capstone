import { DefaultTerrain } from "./DefaultTerrain.js";
import { TestTerrain } from "./TestTerrain.js";
import { SnowTerrain } from "./SnowTerrain.js";
class TerrainSwitcher {
    terrains = {
        defaultTerrain: {terrain: new DefaultTerrain(), name: "defaultTerrain"},
        testTerrain: {terrain: new TestTerrain(), name: "testTerrain"},
        SnowTerrain: {terrain: new SnowTerrain(), name: "SnowTerrain"}
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
        if (terrain==undefined) {
            localStorage.setItem("Terrain",this.terrains.defaultTerrain.name);
            this.currentTerrain=this.terrains.defaultTerrain.terrain;
            return;
        }
        this.currentTerrain=terrain.terrain;
        localStorage.setItem("Terrain",terrain.name);
    }
    constructor() {
        window.zlowTerrains=this;
        let startTerrain = localStorage.getItem("Terrain");
        if (startTerrain==null) {
            this.setTerrain(this.terrains.defaultTerrain);
        } else {
            //console.log("StartTerrain!=null!",this.terrains[startTerrain],startTerrain)
            //use this syntax to avoid a lengthy switch statement
            this.setTerrain(this.terrains[startTerrain]);
        }
    }
}

export let terrainSwitcher = new TerrainSwitcher();