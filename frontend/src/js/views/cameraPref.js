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
    this.initializeSlides();
  }

  initializeSlides() {
    
    // Identify buttons and set event listeners for buttons
    const nextButton = document.getElementById("next");
    const prevButton = document.getElementById("previous");

    nextButton.addEventListener("click", () => {
      this.plusSlides(1);
    });

    prevButton.addEventListener("click", () => {
      this.plusSlides(-1);
    });

    // Start slideshow
    this.showSlides(1);
  }

showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");

  if (n > slides.length) {this.slideIndex = 1}
  if (n < 1) {this.slideIndex = slides.length}

  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }

  slides[this.slideIndex-1].style.display = "block";
}

// Next/previous controls
plusSlides(n) {
  this.showSlides(this.slideIndex += n);
}

// Thumbnail image controls
currentSlide(n) {
  this.showSlides(this.slideIndex = n);
}

  reset() {}
}

