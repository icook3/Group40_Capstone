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

    //track the history state
    hashChangeThroughCode=false;
    lastState;
    historyIndex=0;
    /**
    * Initializes different views
    */
    initViews() {
        //set up the favicon
        this.updateFavicon();
        this.darkMode.addEventListener("change", this.updateFavicon);


        //fill in past screens and future screens from the sessionStorage
        if (sessionStorage.getItem("pastScreens")!=null) {
            this.pastScreens=JSON.parse(sessionStorage.getItem("pastScreens"));
        }
        if (sessionStorage.getItem("futureScreens")!=null) {
            this.futureScreens=JSON.parse(sessionStorage.getItem("futureScreens"));
        }
        //change the back button
        this.formerPopStateFunction = window.onpopstate;
        window.onpopstate = (event)=>this.newPopStateFunction(this, event);
        this.hashChangeThroughCode=true;
        window.location.hash=this.views.mainMenu;
        history.replaceState({idx:this.historyIndex},'');
        this.lastState=window.history.state;
        this.hashChangeThroughCode=false;

        //initialize views
        console.log("Initializing views");
        this.viewStorage.mainMenu = new mainMenuView(true);
        this.viewStorage.zlowScreen = new zlowScreen(false);
        this.viewStorage.playerCustomizationScreen=new playerCustomizationView(false);
        this.viewStorage.peerConnectScreen = new connectToPeersView(false);
        this.viewStorage.changelog = new changelogView(false);
    }

    setView(view, usingBrowser=false) {
        //console.group();
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
                //console.groupEnd();
                return;
                break;
        }
        
        // if you are not using browser buttons, add it to the stack
        if (!usingBrowser) {
            //console.log("Adding "+this.currentView+" to the stack");
            //push the current view onto the stack
            this.pastScreens.push(this.currentView);
            //console.log("stack contains: ",this.pastScreens);
            this.hashChangeThroughCode=true;
            this.historyIndex++;
            sessionStorage.setItem("pastScreens",JSON.stringify(this.pastScreens));
            //history.pushState({},"");
        }
        //console.groupEnd();

        window.location.hash=view;
        if (!usingBrowser) {
            history.replaceState({idx:this.historyIndex},'');
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

    newPopStateFunction(owner, event) {
        //console.group();
        
        //console.log("past screens=",owner.pastScreens,"Future screens=",owner.futureScreens);
        console.log("hashChangeThroughCode=",owner.hashChangeThroughCode);
        console.log("history state=",owner.lastState);
        //if you are not actually hitting the back button, but instead are changing the hash through code
        if (owner.hashChangeThroughCode==true) {
            event.preventDefault();
            //console.groupEnd();
            owner.futureScreens=[];
            sessionStorage.setItem("futureScreens",JSON.stringify(owner.futureScreens));
            owner.hashChangeThroughCode=false;
            return;
        }
        if (history.state==null) {
            event.preventDefault();
            //console.groupEnd();
            return;
        }
        let currentState = window.history.state;
        console.log("current state=",currentState);
        //if you are going backwards
        if (currentState.idx<=this.lastState.idx) {
            //if you are going to a past screen
            if (owner.pastScreens.length==0) {
                //owner.formerPopStateFunction();
                //console.groupEnd();
                return;
            }
            console.log("click back button");
            owner.futureScreens.push(owner.currentView);
            owner.setView(owner.pastScreens.pop(), true);
            sessionStorage.setItem("pastScreens",JSON.stringify(owner.pastScreens));
            sessionStorage.setItem("futureScreens",JSON.stringify(owner.futureScreens));
            //console.log("AFTER: past screens=",owner.pastScreens, "Future screens=",owner.futureScreens);
            //console.groupEnd();
        } else if (currentState.idx>owner.lastState.idx) {
            if (owner.futureScreens.length==0) {
                //console.groupEnd();
                return;
            }
            console.log("click forwards button");
            owner.pastScreens.push(owner.currentView);
            owner.setView(owner.futureScreens.pop(), true);
            sessionStorage.setItem("pastScreens",JSON.stringify(owner.pastScreens));
            sessionStorage.setItem("futureScreens",JSON.stringify(owner.futureScreens));
            //console.log("AFTER: past screens=",owner.pastScreens, "Future screens=",owner.futureScreens);
            //console.groupEnd();
        }
        owner.lastState=currentState;
    }
}
// For browser usage
if (typeof window !== "undefined") {
    window.viewManager=new ViewManager();
    window.__zlow = window.__zlow || {};
    window.__zlow.constants = constants;
}