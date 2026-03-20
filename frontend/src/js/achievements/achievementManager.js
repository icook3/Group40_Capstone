import {Achievement} from './achievement.js'
import { NotificationManager } from '../notifications.js';
/**
 * This class manages achievements
 * It is a singleton class. 
 * To add new achievements, start by creating them in the constructor. 
 * Use the code this.achievements.set(unique ID, new Achievement("name", "desc", "imgPath"));
 * Place an image in the resources folder to represent the achievement. 
 * When the achievement is to be unlocked, call achievementManager.obtainAchievement(unique ID);
 */
class AchievementManager {
    notificationManager;
    constructor() {
        //CREATE NEW ACHIEVEMENTS HERE
        this.achievements.set("Welcome",new Achievement("Welcome to Zlow!","Start Zlow for the first time!","../../resources/images/achievementImages/Welcome.png"));
        this.achievements.set("CreateACharacter", new Achievement("Created A Character", "Create a character in the customizer!","../../resources/images/achievementImages/CreateACharacter.png"));
        this.achievements.set("PeerToPeer", new Achievement("Ride Together!", "Ride with a friend!","../../resources/images/achievementImages/PeerToPeer.png"));
        this.achievements.set("TCXExport", new Achievement("Better Shared!", "Export your ride as a TCX file, or to Strava!","../../resources/images/achievementImages/TCXExport.png"));
        this.achievements.set("DistanceMilestone1", new Achievement("Rode 25 km!", "Ride 25 km!","../../resources/images/achievementImages/DistanceMilestone1.png"));
        this.achievements.set("DistanceMilestone2", new Achievement("Rode 50 km!", "Ride 50 km!","../../resources/images/achievementImages/DistanceMilestone2.png"));
        this.achievements.set("DistanceMilestone3", new Achievement("Rode 100 km!", "Ride 100 km!","../../resources/images/achievementImages/DistanceMilestone3.png"));
        this.achievements.set("TimeMilestone1", new Achievement("Rode For 30 Minutes!", "Ride for 30 minutes!","../../resources/images/achievementImages/TimeMilestone1.png"));
        this.achievements.set("TimeMilestone2", new Achievement("Rode For 1 Hour!", "Ride for 1 hour!","../../resources/images/achievementImages/TimeMilestone2.png"));
        this.achievements.set("TimeMilestone3", new Achievement("Rode For 2 Hours!", "Ride for 2 hours!","../../resources/images/achievementImages/TimeMilestone3.png"));
        this.achievements.set("StreakMilestone1", new Achievement("Rode For 7 Days in a Row!", "Ride for 7 days in a row!","../../resources/images/achievementImages/StreakMilestone1.png"));
        this.achievements.set("StreakMilestone2", new Achievement("Rode For 14 Days in a Row!", "Ride for 14 days in a row!","../../resources/images/achievementImages/StreakMilestone2.png"));
        this.achievements.set("StreakMilestone3", new Achievement("Rode For 30 Days in a Row!", "Ride for 30 days in a row!","../../resources/images/achievementImages/StreakMilestone3.png"));
        this.achievements.set("PowerMilestone1", new Achievement("Reached 75 Watts!", "Reach 75 watts while riding","../../resources/images/achievementImages/PowerMilestone1.png"));
        this.achievements.set("PowerMilestone2", new Achievement("Reached 150 Watts!", "Reach 150 watts while riding","../../resources/images/achievementImages/PowerMilestone2.png"));
        this.achievements.set("PowerMilestone3", new Achievement("Reached 300 Watts!", "Reach 300 watts while riding","../../resources/images/achievementImages/PowerMilestone3.png"));
        this.achievements.set("CaloriesMilestone1", new Achievement("Burned 400 Calories!", "Burn 400 calories while riding","../../resources/images/achievementImages/CaloriesMilestone1.png"));
        this.achievements.set("CaloriesMilestone2", new Achievement("Burned 800 Calories!", "Burn 800 calories while riding","../../resources/images/achievementImages/CaloriesMilestone2.png"));
        this.achievements.set("CaloriesMilestone3", new Achievement("Burned 1,500 Calories!", "Burn 1,500 calories while riding","../../resources/images/achievementImages/CaloriesMilestone3.png"));


        this.notificationManager=new NotificationManager();

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
        window.viewManager.setView(window.viewManager.views.achievements);
    }
    storeAchievementsInLocalStorage() {
        let objs = [];
        this.achievements.forEach((value, key)=>{
            let obj={ID:key,completed:value.unlocked,completedDate:value.unlockDate}
            objs.push(obj);
        });
        //console.log(JSON.stringify(objs));
        localStorage.setItem("AchievementsObtained",JSON.stringify(objs));
    }
    /**
     * 
     * @param {string} achievement 
     */
    obtainAchievement(achievement) {
        let thisAchievement=this.achievements.get(achievement)
        let notAlreadyObtained=thisAchievement.unlockAchievement();
        if (notAlreadyObtained) {
            this.storeAchievementsInLocalStorage();
            this.notificationManager.show("Achievement "+thisAchievement.name+" unlocked!",true);
        }
    }
    /**
     * @type {Map<string, Achievement>}
     */
    achievements = new Map();
}

//export as a singleton
export let achievementManager=new AchievementManager();