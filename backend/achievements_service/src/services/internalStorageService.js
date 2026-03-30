/**
 * Store a map with a string representing achievement IDs, and a number representing the number of obtained
 * @type {Map<string, Number>}
 */
export let achievements = new Map();
let userCount = 0;

/**
 * 
 * @param {string} achievement 
 * @returns number
 */
export function getAchievementPercentage(achievement) {
    if (userCount==0) {
        return 100;
    } else if (achievements.get(achievement)==undefined) {
        return 0;
    } else {
        return 100 * (achievements.get(achievement)/userCount);
    }
}