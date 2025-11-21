import { constants } from "./constants.js";
function openZlow(peer) {
    sessionStorage.setItem("peer",peer);
    window.location.href="./zlow.html"
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
