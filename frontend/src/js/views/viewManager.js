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
export class ViewManager {
    viewStorage = new ViewStorage();

    /**
    * Initializes different views
    */
    initViews() {
        console.log("Initializing views");
        this.viewStorage.mainMenu = new mainMenuView(false);
        this.viewStorage.zlowScreen = new zlowScreen(true);
    }

    setView(view) {
        switch(view) {
            case this.views.mainMenu:
                if (this.viewStorage.mainMenu.ready) {
                    this.viewStorage.mainMenu.setPage();
                }
                break;
            default: 
                console.log("This view is not available!");
                break;
        }
    }

    views = {changelog: "changelog", peerConnect: "peerConnect", mainMenu: "mainMenu", playerCustomization: "playerCustomization", mainZlow: "mainZlow"};
}
// For browser usage
if (typeof window !== "undefined") {
    window.viewManager=new ViewManager();
}