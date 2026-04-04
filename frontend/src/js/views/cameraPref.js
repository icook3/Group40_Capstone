export class cameraPref {
  content;
  ready = false;
  initialized = false;

  //constants.trackPoints.push({x: 15, y: 1, z: pointZ-7, length: 16.55});
  //first person {x: -0.5, y: 3, z: -0.5}
  //left far {x: -6, y: 4, z: 12}
  //left near {x: -6, y: 4, z: 8}
  //rigt far {x: 6, y: 4, z: 12}
  //right near {x: 6, y: 4, z: 8}
  //middle far {x: 0, y: 4, z: 5}
  //middle near {x: 0, y: 4, z: 12}
  constructor(setWhenDone) {
    fetch("../html/cameraPref.html")
      .then((r) => r.text())
      .then((content) => {
        this.content = content;
        if (setWhenDone) this.setPage();
        this.ready = true;
      });

      this.slideIndex = 1;
      this.viewCoordinates = [];
      this.viewCoordinates.push({x: -0.5, y: 3, z: -0.5});
      this.viewCoordinates.push({x: -6, y: 4, z: 12});
      this.viewCoordinates.push({x: -6, y: 4, z: 8});
      this.viewCoordinates.push({x: 6, y: 4, z: 12});
      this.viewCoordinates.push({x: 6, y: 4, z: 8});
      this.viewCoordinates.push({x: 0, y: 4, z: 5});
      this.viewCoordinates.push({x: 0, y: 4, z: 12});
  }

  setPage() {
    document.getElementById("mainDiv").innerHTML = this.content;
    this.initializeSlides();
  }

  initializeSlides() {
    
    // Identify buttons and set event listeners
    const nextButton = document.getElementById("next");
    const prevButton = document.getElementById("previous");
    const selectButton = document.getElementById("selectButton");

    nextButton.addEventListener("click", () => {
      this.plusSlides(1);
    });

    prevButton.addEventListener("click", () => {
      this.plusSlides(-1);
    });

    // Save coordinates associated with view to local storage when selected
    selectButton.addEventListener("click", () => {
      localStorage.setItem("view", JSON.stringify(this.viewCoordinates[this.slideIndex-1]));
      alert(JSON.parse(localStorage.getItem("view")).x);
    });

    // Start slideshow
    this.showSlides(1);
  }

showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("cameraView");

  if (n > slides.length) {this.slideIndex = 1}
  if (n < 1) {this.slideIndex = slides.length}

  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  
  slides[this.slideIndex-1].style.display = "block";
}

plusSlides(n) {
  this.showSlides(this.slideIndex += n);
}

currentSlide(n) {
  this.showSlides(this.slideIndex = n);
}

  reset() {}

}