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
      this.slideIndex = 1;
  }

  setPage() {
    document.getElementById("mainDiv").innerHTML = this.content;

    // Re-bind events to the newly injected DOM,
    // but avoid stacking duplicates across visits.
    //this.peerInit();
    this.showSlides();
  }

showSlides() {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  //if (n > slides.length) {this.slideIndex = 1}
  //if (n < 1) {this.slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }

  slides[this.slideIndex-1].style.display = "block";
}

  

  reset() {}
}