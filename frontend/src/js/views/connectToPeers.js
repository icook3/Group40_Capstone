export class connectToPeersView {
  content;
  ready = false;
  initialized = false;

  constructor(setWhenDone) {
    fetch("../html/connectToPeers.html")
      .then((r) => r.text())
      .then((content) => {
        this.content = content;
        if (setWhenDone) this.setPage();
        this.ready = true;
      });
  }

  setPage() {
    document.getElementById("mainDiv").innerHTML = this.content;

    // Re-bind events to the newly injected DOM,
    // but avoid stacking duplicates across visits.
    this.peerInit();
  }

  reset() {}

  openZlow(peer) {
    sessionStorage.setItem("peer", peer);
    window.viewManager.setView(window.viewManager.views.mainZlow);
  }

  peerInit() {
    const peerNameInput = document.getElementById("name-input");
    const connectBtn = document.getElementById("connect-btn");
    const backBtn = document.getElementById("peer-back-btn");

    // ✅ Prevent stacking: replace node with a clone (removes old listeners)
    const newConnectBtn = connectBtn.cloneNode(true);
    connectBtn.parentNode.replaceChild(newConnectBtn, connectBtn);

    newConnectBtn.addEventListener("click", () => {
      const name = peerNameInput.value.trim();
      if (name) this.openZlow(name);
    });

    if (backBtn) {
      const newBackBtn = backBtn.cloneNode(true);
      backBtn.parentNode.replaceChild(newBackBtn, backBtn);
      newBackBtn.addEventListener("click", () => {
        window.viewManager.setView(window.viewManager.views.mainMenu);
      });
    }
  }
}
