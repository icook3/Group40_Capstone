/**
 * Initializes different views
 */
export function initViews() {
    console.log("Initializing views");
    setView(views.mainMenu);
}

export function setView(view) {

}

export let views = {changelog: "changelog", peerConnect: "peerConnect", mainMenu: "mainMenu", playerCustomization: "playerCustomization", mainZlow: "mainZlow"};

// For browser usage
if (typeof window !== "undefined") {
    window.initViews=initViews;
    window.setView=setView;
    window.views=views;
}