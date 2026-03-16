import {Achievement} from './achievement.js'
class AchievementManager {
    constructor() {
        //CREATE NEW ACHIEVEMENTS HERE
        this.achievements.set("Welcome",new Achievement("Welcome to Zlow!","Start Zlow for the first time!","","Welcome"));
        //get completed achievements out of local storage
        if (localStorage.getItem("AchievementsObtained")!=null) {
            let otherObtainedAchievements = JSON.parse(localStorage.getItem("AchievementsObtained"));
            for (let i=0;i<otherObtainedAchievements.length;i++) {
                this.obtainedAchievements.push(new Date(otherObtainedAchievements[i]));
            }
        }

        if (this.obtainedAchievements.length<this.achievements.length) {
            for (let i=this.obtainedAchievements.length;i<this.achievements.length;i++) {
                this.obtainedAchievements.push(null);
            }
        }
    }
    clearAllAchievements() {
        this.achievements.forEach((value)=>{
            value.unlocked=false;
            value.dateObtained=null;
        });
    }
    storeAchievementsInLocalStorage() {
        localStorage.setItem("AchievementsObtained",JSON.stringify(this.obtainedAchievements));
    }

    /**
     * @type {Map<string, Achievement>}
     */
    achievements = new Map();
    /**
     * @type {Date[]}
     */
    obtainedAchievements=[];
}

//export as a singleton
export let achievementManager=new AchievementManager();