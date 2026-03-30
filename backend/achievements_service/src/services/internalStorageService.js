/**
 * Store a map with a string representing achievement IDs, and a number representing the number of obtained
 * @type {Map<string, Number>}
 */
export let achievements = new Map();
export let userCount = 0;

/**
 * 
 * @param {string} achievement 
 * @returns number
 */
function getAchievementPercentage(achievement) {
    if (userCount==0) {
        return 100;
    } else if (achievements.get(achievement)==undefined) {
        return 0;
    } else {
        return 100 * (achievements.get(achievement)/userCount);
    }
}

/**
 * @returns {string}
 */
export function getAchievementsPercentage() {
    let percentMap = new Map();
    achievements.forEach((value, key)=> {
        percentMap.set(key, getAchievementPercentage(key));
    });
    return JSON.stringify(Object.fromEntries(percentMap));
}

export function storeAsJSON() {
    let map = Object.fromEntries(achievements);
    let object = {"map": map, "userCount": userCount};
    return JSON.stringify(object, null, 2);
}
export function getFromJSON(json) {
    let object = JSON.parse(json);
    userCount=object.userCount;
    achievements = new Map(Object.entries(object.map));
}