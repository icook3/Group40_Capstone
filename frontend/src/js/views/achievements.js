export class achievementsView {
  content;
  ready = false;

  constructor(setWhenDone) {
    fetch("../html/achievements.html")
      .then((r) => r.text())
      .then((content) => {
        this.content = content;
        if (setWhenDone) {
            this.setPage();
        }
        this.ready = true;
      });
  }

  setPage() {
    document.getElementById("mainDiv").innerHTML = this.content;

  }
  reset() {}
}