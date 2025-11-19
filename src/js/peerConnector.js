import { constants } from "./constants.js";
function openZlow(peer) {
    sessionStorage.setItem("peer",peer);
    var me = new Peer({host: constants.peerHost, port: constants.peerPort, path: constants.peerPath});
    me.on('open', function() {
        let conn = me.connect(peer);
        conn.on('open', function() {
            console.log("OPEN: Switching windows");
            window.location.href="./zlow.html"
        });
        console.log(me);
    });

    /*me.on('error', function(err) {
      switch(err.type) {
        case "browser-incompatible":
          console.log("Peer-to-peer multiplayer is not compatible with this browser. Try updating your browser.");
          return;
        case "invalid-id":
          window.location.href = "./mainMenu.html";
          return;
        case "network":
          console.log("Cannot connect to server");
          return;
        case "peer-unavailable":
          console.log("The given peer does not exist");
          return;
        case "server-error":
          console.log("Cannot connect to server");
          return;
        default:
          console.log("There have been some other errors");
          console.log(err);
          return;
      }
    });
    conn.on('error', function(err) {
        console.log("ERROR:");
        console.log(err);
    });*/

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
