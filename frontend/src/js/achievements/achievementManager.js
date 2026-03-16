class AchievementManager {
    constructor() {
        //CREATE NEW ACHIEVEMENTS HERE
    }
    clearAllAchievements() {
        this.achievements.forEach((value)=>{
            value.unlocked=false;
            value.dateObtained=null;
        });
    }
    achievements = new Map();
}

//export as a singleton
export let achievementManager=new AchievementManager();