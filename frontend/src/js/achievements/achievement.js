import { achievementManager } from "./achievementManager";

class Achievement {
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
    unlockAchievement() {
        if (!unlocked) {
            unlocked=true;
            unlockDate = new Date();
            achievementManager.storeAchievementsInLocalStorage();
        }
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