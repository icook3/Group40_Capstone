export function peerInit() {
    const peerNameInput = document.getElementById("name-input");
    const connectBtn = document.getElementById("connect-btn");
    connectBtn.addEventListener("click", () => {
        if (peerNameInput.value!="") {
            sessionStorage.setItem("peer",peerNameInput.value);
            window.location.href="./zlow.html"
        }
    });
    var peer = new Peer();
    peer.on('open', function(id) {
        console.log("ID="+id);        
    });
}

if (typeof window !== "undefined") {
    window.peerInit = peerInit;
}
