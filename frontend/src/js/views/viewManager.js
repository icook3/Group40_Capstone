import { mainMenuView } from "./mainMenu.js";
import { zlowScreen } from "./zlow.js";
import { changelogView } from "./changelog.js";
import { constants } from "../constants.js";

// a list of different views
class ViewStorage {
    mainMenu;
    changelog;
    peerConnectScreen;
    playerCustomizationScreen;
    zlowScreen;
}
export class ViewManager {
    views = {changelog: "changelog", peerConnect: "peerConnect", mainMenu: "mainMenu", playerCustomization: "playerCustomization", mainZlow: "mainZlow"};

    viewStorage = new ViewStorage();
    currentView = this.views.mainMenu;
    /**
    * Initializes different views
    */
    initViews() {
        console.log("Initializing views");
        this.viewStorage.mainMenu = new mainMenuView(true);
        this.viewStorage.zlowScreen = new zlowScreen(false);
        this.viewStorage.changelog = new changelogView(false);
    }

    setView(view) {
        //reset the page you are currently on
        switch(this.currentView) {
            case this.views.mainMenu:
                this.viewStorage.mainMenu.reset();
            case this.views.mainZlow:
                this.viewStorage.zlowScreen.reset();
            case this.views.changelog:
                this.viewStorage.changelog.reset();
        }
        //set the current page
        switch(view) {
            case this.views.mainMenu:
                if (this.viewStorage.mainMenu.ready) {
                    this.viewStorage.mainMenu.setPage();
                }
                break;
            case this.views.mainZlow: 
                if (this.viewStorage.zlowScreen.ready) {
                    this.viewStorage.zlowScreen.setPage();
                }
                break;
            case this.views.changelog:
                if (this.viewStorage.changelog.ready) {
                    this.viewStorage.changelog.setPage();
                }
                break;
            default: 
                console.log("This view is not available!");
                return;
                break;
        }

        this.currentView=view;
    }

    
}
// For browser usage
if (typeof window !== "undefined") {
    window.viewManager=new ViewManager();
    //window.__zlow = window.__zlow || {};
    //window.__zlow.constants = constants;
}