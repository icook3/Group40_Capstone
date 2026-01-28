import { mainMenu } from "./mainMenu.js";
import { playerCustomization } from "./playerCustomization.js";
export function setView(view) {
    switch (view) {
        case views.mainMenu:
            document.getElementById("mainDiv").innerHTML=mainMenu;
            break;
        case views.playerCustomization:
            document.getElementById("mainDiv").innerHTML=playerCustomization;
            break;
        default:
            document.getElementById("mainDiv").innerHTML=mainMenu;
    }
}
//enum to make it easier
export let views = {
    "mainMenu": "mainMenu",
    "playerCustomization":"playerCustomization"
};
