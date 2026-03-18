import {Achievement} from './achievement.js'
/**
 * This class manages achievements
 * It is a singleton class. 
 * To add new achievements, start by creating them in the constructor. 
 * Use the code this.achievements.set(unique ID, new Achievement("name", "desc", "imgPath"));
 * Place an image in the resources folder to represent the achievement. 
 * When the achievement is to be unlocked, call achievementManager.achievements.get(unique ID).unlockAchievement();
 * The return value is true if the achievement was previously locked, false otherwise. 
 */
class AchievementManager {
    constructor() {
        //CREATE NEW ACHIEVEMENTS HERE
        this.achievements.set("Welcome",new Achievement("Welcome to Zlow!","Start Zlow for the first time!","../../resources/favicons/ZlowFavicon.svg"));
        this.achievements.set("Test",new Achievement("Test Achievement!","This is a test 1!","../../resources/favicons/ZlowFavicon-dark.svg"));
        this.achievements.set("Test2",new Achievement("Test Achievement!","This is a test 2!","../../resources/favicons/ZlowFavicon-dark.svg"));
        this.achievements.set("Test3",new Achievement("Test Achievement!","This is a test 3!","../../resources/favicons/ZlowFavicon-dark.svg"));
        this.achievements.set("Test4",new Achievement("Test Achievement!","This is a test 4!","../../resources/favicons/ZlowFavicon-dark.svg"));
        this.achievements.set("Test5",new Achievement("Test Achievement!","This is a test 5!","../../resources/favicons/ZlowFavicon-dark.svg"));
        window.achievementManager=this;
        //get completed achievements out of local storage
        if (localStorage.getItem("AchievementsObtained")!=null) {
            try {
            let obtainedAchievements = JSON.parse(localStorage.getItem("AchievementsObtained"));
            for (let i=0;i<obtainedAchievements.length;i++) {
                //set the unlock status of the achievement
                /*
                    achievements in local storage are formatted as a JSON array like this
                    [{ID: ID, completed: true, completedDate: Date}]
                */
                this.achievements.get(obtainedAchievements[i].ID).unlocked = obtainedAchievements[i].completed;
                this.achievements.get(obtainedAchievements[i].ID).unlockDate = new Date(obtainedAchievements[i].completedDate);
            }
            } catch (e) {
                console.log("INVALID JSON!");
                this.clearAllAchievements();
            }
        }
    }

    currentIdx;

    clearAllAchievements() {
        this.achievements.forEach((value)=>{
            value.unlocked=false;
            value.dateObtained=null;
        });
        this.storeAchievementsInLocalStorage();
    }
    storeAchievementsInLocalStorage() {
        let objs = [];
        this.achievements.forEach((value, key)=>{
            let obj={ID:key,completed:value.unlocked,completedDate:value.unlockDate}
            objs.push(obj);
        });
        console.log(JSON.stringify(objs));
        localStorage.setItem("AchievementsObtained",JSON.stringify(objs));
    }
    obtainAchievement(achievement) {
        this.achievements.get(achievement).unlockAchievement();
        this.storeAchievementsInLocalStorage();
    }
    /**
     * @type {Map<string, Achievement>}
     */
    achievements = new Map();
}

//export as a singleton
export let achievementManager=new AchievementManager();