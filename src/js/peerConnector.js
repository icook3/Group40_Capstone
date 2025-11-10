export function peerInit() {
    var peer = new Peer();
    peer.on('open', function(id) {
        console.log("ID="+id);
        // populate the list
        const peerList = document.getElementById("peerList");
        
    });


}

function setPeer(peerID) {
    sessionStorage.setItem("peer",peerID);
    window.location.href = "zlow.html";
}

if (typeof window !== "undefined") {
    window.peerInit = peerInit;
}
