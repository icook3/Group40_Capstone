export class cameraPref {
  content;
  ready = false;
  initialized = false;

  constructor(setWhenDone) {
    fetch("../html/cameraPref.html")
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
    //this.peerInit();
  }

  reset() {}
}