//import { achievementManager } from "./achievementManager.js";

export class Achievement {
    /**
     * @type {string}
     */
    name;
    /**
     * @type {string}
     */
    description;
    /**
     * @type {string}
     */
    imagePath;
    /**
     * @type {number}
     */
    percentage=undefined;
    /**
     * 
     * @returns true if the achievement was not previously unlocked. False otherwise
     */
    unlockAchievement() {
        if (!this.unlocked) {
            this.unlocked=true;
            this.unlockDate = new Date();
            //achievementManager.storeAchievementsInLocalStorage();
            return true;
        }
        return false;
    }
    /**
     * @type {boolean}
     */
    unlocked;
    /**
     * @type {Date}
     */
    unlockDate;

    /**
     * 
     * @param {string} name 
     * @param {string} description 
     * @param {string} imagePath 
     * @param {string} id 
     */
    constructor(name, description, imagePath) {
        this.name=name;
        this.description=description;
        this.imagePath=imagePath;
        this.unlocked=false;
    }
}