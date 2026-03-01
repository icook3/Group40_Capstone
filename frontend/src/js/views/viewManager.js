import { mainMenuView } from "./mainMenu.js";
import { zlowScreen } from "./zlow.js";
import { changelogView } from "./changelog.js";
import { constants } from "../constants.js";
import { playerCustomizationView } from "./playerCustomization.js";
import { connectToPeersView } from "./connectToPeers.js";
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
        //set up the favicon
        this.updateFavicon();
        this.darkMode.addEventListener("change", this.updateFavicon);

        //initialize views
        console.log("Initializing views");
        this.viewStorage.mainMenu = new mainMenuView(true);
        this.viewStorage.zlowScreen = new zlowScreen(false);
        this.viewStorage.playerCustomizationScreen=new playerCustomizationView(false);
        this.viewStorage.peerConnectScreen = new connectToPeersView(false);
        this.viewStorage.changelog = new changelogView(false);
    }

    setView(view) {
        //reset the page you are currently on
        switch(this.currentView) {
            case this.views.mainMenu:
                this.viewStorage.mainMenu.reset();
                break;
            case this.views.mainZlow:
                this.viewStorage.zlowScreen.reset();
                break;
            case this.views.changelog:
                this.viewStorage.changelog.reset();
                break;
            case this.views.playerCustomization:
                this.viewStorage.playerCustomizationScreen.reset();
                break;
            case this.views.connectToPeersView:
                this.viewStorage.peerConnectScreen.reset();
                break;
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
            case this.views.playerCustomization:
                if (this.viewStorage.playerCustomizationScreen.ready) {
                    this.viewStorage.playerCustomizationScreen.setPage();
                }
                break;
            case this.views.peerConnect:
                if (this.viewStorage.peerConnectScreen.ready) {
                    this.viewStorage.peerConnectScreen.setPage();
                }
                break;
            default: 
                console.log("This view is not available!");
                return;
                break;
        }

        this.currentView=view;
    }


    //handle the favicon - MUST be on initializing area
    darkMode = window.matchMedia("(prefers-color-scheme: dark)");
    updateFavicon() {
      const favicon = document.querySelector('link[rel="icon"]');
      if (!favicon) {
        return;
      }

      if (this.darkMode.matches) {
        favicon.href = "../../resources/favicons/ZlowFavicon-dark.svg";
      } else {
        favicon.href = "../../resources/favicons/ZlowFavicon.svg";
      }
    }
    
}
// For browser usage
if (typeof window !== "undefined") {
    window.viewManager=new ViewManager();
    window.__zlow = window.__zlow || {};
    window.__zlow.constants = constants;
}