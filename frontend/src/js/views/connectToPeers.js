import {features} from "../constants.js";

export class connectToPeersView {
    content;
    ready=false;
    constructor(setWhenDone) {
        fetch("../html/connectToPeers.html").then((content)=> {
            return content.text();
        }).then((content)=> {
            this.content=content;
            if (setWhenDone) {
                this.setPage();
            }
            this.ready=true;
        });
    }

    setPage() {
        document.getElementById("mainDiv").innerHTML=this.content;
        console.log("LOADING");
        this.peerInit();
    }
    reset() {}

    openZlow(peer) {
        sessionStorage.setItem("peer",peer);
        window.viewManager.setView(window.viewManager.views.mainZlow);
    }

    peerInit() {
        // If peer to peer not configured, return to main menu
        if (!features.peerEnabled) {
            alert("Peer to peer multiplayer is not set up.");
            window.viewManager.setView(window.viewManager.views.mainMenu);
        }

        const peerNameInput = document.getElementById("name-input");
        const connectBtn = document.getElementById("connect-btn");
        connectBtn.addEventListener("click", () => {
            if (peerNameInput.value!="") {
                this.openZlow(peerNameInput.value);
            }
        });
    
    }
}