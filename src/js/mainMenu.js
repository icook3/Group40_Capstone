// src/js/mainMenu.js — minimal, robust split button logic

(function () {
  const ready = (fn) =>
    document.readyState === "loading"
      ? document.addEventListener("DOMContentLoaded", fn, { once: true })
      : fn();

  ready(() => {
    const startBtn  = document.getElementById("start-btn");
    const toggleBtn = document.getElementById("start-toggle");
    const menuEl    = document.getElementById("start-menu");
    const splitRoot = document.getElementById("start-split");

    if (!startBtn || !toggleBtn || !menuEl || !splitRoot) {
      console.warn("[mainMenu] Missing elements", { startBtn, toggleBtn, menuEl, splitRoot });
      return;
    }

    const labelFor = (id) =>
      id === "ramp"  ? "Start (Ramp Test)" :
      id === "ftp20" ? "Start (FTP 20-min)" :
                       "Start (Free Ride)";

    // Restore label
    let selected = sessionStorage.getItem("SelectedWorkout") || "free";
    startBtn.textContent = labelFor(selected);

    // --- Toggle open/close ---------------------------------------------------
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = menuEl.classList.toggle("show");
      toggleBtn.setAttribute("aria-expanded", String(isOpen));
      console.log("[mainMenu] toggle", { isOpen });

      if (isOpen) {
        const rect = splitRoot.getBoundingClientRect();
        // Pin to viewport so parent scale() doesn't matter
        menuEl.style.position = "fixed";
        menuEl.style.left = `${Math.round(rect.left)}px`;
        menuEl.style.top  = `${Math.round(rect.bottom) + 8}px`;
        menuEl.style.minWidth = `${Math.round(rect.width)}px`;
        menuEl.style.zIndex = "9999";
        menuEl.style.visibility = "visible";
        menuEl.style.opacity = "1";
        console.log("[mainMenu] menu rect", menuEl.getBoundingClientRect());
      }
    });

    // --- Pick an item --------------------------------------------------------
    menuEl.addEventListener("click", (e) => {
      const item = e.target.closest(".dropdown-item");
      if (!item) return;
      selected = item.dataset.workout;
      sessionStorage.setItem("SelectedWorkout", selected);
      startBtn.textContent = labelFor(selected);
      menuEl.classList.remove("show");
      toggleBtn.setAttribute("aria-expanded", "false");
      console.log("[mainMenu] selected", selected);
    });

    // --- Close on outside click ---------------------------------------------
    document.addEventListener("click", (e) => {
      if (!splitRoot.contains(e.target)) {
        menuEl.classList.remove("show");
        toggleBtn.setAttribute("aria-expanded", "false");
      }
    });

    // --- Start ---------------------------------------------------------------
    startBtn.addEventListener("click", () => {
      sessionStorage.setItem("SelectedWorkout", selected);
      const ps = document.getElementById("pacer-speed");
      if (ps) sessionStorage.setItem("PacerSpeed", ps.value);
      window.location.href = "../html/zlow.html";
    });

    console.log("[mainMenu] ready");
  });
})();



