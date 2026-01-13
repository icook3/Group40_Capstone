# Units Interface (Design Doc – Phase 1)

A class using the **Units** interface represents a unit conversion to/from the defaults (km for distance, km/h for speed, kg for weight, and W for power)

## Required methods/fields
- **name** → `String`
    - Returns the name of the unit. This is what is passed into sessionStorage when changing units, and what is displayed on the HUD
- **convertTo(Number)** → `Number`
    - Converts from the parameter in the default units to the new unit
- **convertFrom(Number)** → `Number`
    - Converts from the parameter in the current unit to the default unit

## Notes
- To add new units, you have to add it to index.js for it to work
    - Change the method setUnits, find the relevant switch statement, and add a case for your new unit
- Units do not automatically show up in the menu. Add them to mainMenu.html to make them show up
    - In the menu-settings div, there are several units selection boxes. Add it to the relevant one for the unit you are adding. 