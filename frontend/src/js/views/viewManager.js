import { mainMenuView } from "./mainMenu.js";
import { zlowScreen } from "./zlow.js";
//TODO: refactor into a class - export an instance of the class to the window

// a list of different views
class ViewStorage {
    mainMenu;
    changelog;
    peerConnectScreen;
    playerCustomizationScreen;
    zlowScreen;
}

let viewStorage = new ViewStorage;

/**
 * Initializes different views
 */
export function initViews() {
    console.log("Initializing views");
    viewStorage.mainMenu = new mainMenuView(true);
    viewStorage.zlowScreen = new zlowScreen(false);
}

export function setView(view) {
    switch(view) {
        case views.mainMenu:
            if (viewStorage.mainMenu.ready) {
                viewStorage.mainMenu.setPage();
            }
            break;
        default: 
            console.log("This view is not available!");
            break;
    }
}

export let views = {changelog: "changelog", peerConnect: "peerConnect", mainMenu: "mainMenu", playerCustomization: "playerCustomization", mainZlow: "mainZlow"};

// For browser usage
if (typeof window !== "undefined") {
    window.initViews=initViews;
    window.setView=setView;
    window.views=views;
}