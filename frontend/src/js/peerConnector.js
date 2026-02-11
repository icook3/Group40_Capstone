import { constants } from "./constants.js";
function openZlow(peer) {
    sessionStorage.setItem("peer",peer);
    viewManager.setView(viewManager.views.mainZlow);
}

export function peerInit() {
    const peerNameInput = document.getElementById("name-input");
    const connectBtn = document.getElementById("connect-btn");
    connectBtn.addEventListener("click", () => {
        if (peerNameInput.value!="") {
            openZlow(peerNameInput.value);
        }
    });
    
}

if (typeof window !== "undefined") {
    window.peerInit = peerInit;
}
