class Achievement {
    name;
    description;
    imagePath;
    unlockAchievement() {

    }
    unlocked;
    id;
    unlockDate = {day: 0, month: 0, year: 0, hour: 0, minute: 0, second: 0};
    constructor(name, description, imagePath, id) {
        this.name=name;
        this.description=description;
        this.id=id;
        this.imagePath=imagePath;
        this.unlocked=false;
    }
}