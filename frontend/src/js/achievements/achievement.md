# Achievements Interface (Design Doc – Phase 1)

A class using the **Achievements** interface represents an achievement or a class of similar achievements

## Required methods/fields
- **name** → `String`
    - Returns the name of the achievement
- **description** → `String`
    - Returns a description of the achievement
- **imagePath** → `String`
    - Returns a path to the image for the achievement from index.html. For example, if the image is resources/images/achievementImages/test.jpg, this would be `../../resources/images/achievementImages/test.jpg`. 
- **unlockAchievement()** → `void`
    - Unlocks the achievement for the user, and stores it in localStorage
- **unlocked** → `bool`
    - if the achievement is currently unlocked
- **id** → `String`
    - A unique ID to identify the achievement with
- **dateObtained** → `object`
    - A date object storing the day, month, and year that the user obtained this achievement. 

## Notes
- Achievement completions are stored as a JSON object in session storage, using the format {id: DateObtained}
- A map of achievements is kept in the achievementManager class, using the id property as the key. Add your achievement to this to be able to access it later