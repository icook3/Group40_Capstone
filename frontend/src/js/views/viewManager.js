import { mainMenuView } from "./mainMenu.js";


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
}

export function setView(view) {
    switch(view) {
        case views.mainMenu:
            viewStorage.mainMenu.setPage();
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