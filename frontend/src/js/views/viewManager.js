import { mainMenuView } from "./mainMenu.js";
import { zlowScreen } from "./zlow.js";
import { changelogView } from "./changelog.js";

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
        this.viewStorage.mainMenu = new mainMenuView(true);
        this.viewStorage.zlowScreen = new zlowScreen(false);
        this.viewStorage.changelog = new changelogView(false);
    }

    setView(view) {
        switch(view) {
            case this.views.mainMenu:
                if (this.viewStorage.mainMenu.ready) {
                    this.viewStorage.mainMenu.setPage();
                    this.viewStorage.zlowScreen.reset();
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
                break;
        }
    }

    views = {changelog: "changelog", peerConnect: "peerConnect", mainMenu: "mainMenu", playerCustomization: "playerCustomization", mainZlow: "mainZlow"};
    
}
// For browser usage
if (typeof window !== "undefined") {
    window.viewManager=new ViewManager();
}