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
    views = {changelog: "#changelog", peerConnect: "#peerConnect", mainMenu: "#mainMenu", playerCustomization: "#playerCustomization", mainZlow: "#mainZlow"};

    viewStorage = new ViewStorage();
    currentView = this.views.mainMenu;
    formerPopStateFunction;

    //store a list of past screens - starts with main menu
    pastScreens=[];

    futureScreens=[];
    /**
    * Initializes different views
    */
    initViews() {
        //change the back button
        this.formerPopStateFunction = window.onpopstate;
        window.onpopstate = (event)=>this.newPopStateFunction(this, event);

        //window.location.hash=this.views.mainMenu;

        console.log("Initializing views");
        this.viewStorage.mainMenu = new mainMenuView(true);
        this.viewStorage.zlowScreen = new zlowScreen(false);
        this.viewStorage.playerCustomizationScreen=new playerCustomizationView(false);
        this.viewStorage.peerConnectScreen = new connectToPeersView(false);
        this.viewStorage.changelog = new changelogView(false);
    }

    setView(view, usingBrowser=false) {
        console.log("SETTING VIEW TO "+view);
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
                console.log("This view is not available! "+view);
                return;
                break;
        }
        
        // if you are not using browser buttons, add it to the stack
        if (!usingBrowser) {
            console.log("Adding "+this.currentView+" to the stack");
            //push the current view onto the stack
            this.pastScreens.push(this.currentView);
            history.pushState({},"");
        }
        window.location.hash=view;

        this.currentView=view;
    }

    newPopStateFunction(owner, event) {
        if (event.state==null) {
            event.preventDefault();
            return;
        }
        if (owner.pastScreens.length==0) {
            //owner.formerPopStateFunction();
            return;
        }
        console.log("click back button");
        /*
        owner.futureScreens.push(owner.currentView);
        owner.setView(owner.pastScreens.pop());*/
        console.log("WINDOW.pastScreens=");
        console.log(owner.pastScreens);
        owner.setView(owner.pastScreens.pop(), true);
        console.log("AFTER");
        console.log(owner.pastScreens);
    }
}
// For browser usage
if (typeof window !== "undefined") {
    window.viewManager=new ViewManager();
    window.__zlow = window.__zlow || {};
    window.__zlow.constants = constants;
}