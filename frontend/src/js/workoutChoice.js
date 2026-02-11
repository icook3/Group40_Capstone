// workoutChoice.js — split button with pointer-safe toggle
// Drives menu with pointerdown (single fire), swallows the follow-up click,
// robust outside-click closer, default "free" workout label.

export function workoutChoice() {
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
      id === "sprint" ? "Start (Sprint Intervals)" :
      id === "peerServer" ? "Connect to peer":
                       "Start (Free Ride)";

    // Default to "free" and restore prior choice if present
    let selected = sessionStorage.getItem("SelectedWorkout") || "free";
    splitRoot.dataset.workout = selected;
    startBtn.textContent = labelFor(selected);

    // --- helpers -------------------------------------------------------------
    function positionMenu() {
      // 1) make it measurable
      menuEl.style.display = "block";
      menuEl.style.visibility = "hidden";
      menuEl.style.position = "fixed";
      menuEl.style.left = "0px";
      menuEl.style.top  = "0px";

      // 2) measure from the TOGGLE arrow (more reliable than the whole pill)
      const r = toggleBtn.getBoundingClientRect();

      // 3) compute target position
      const desiredLeft = Math.round(r.left);            // align to pill left
      const desiredTop  = Math.round(r.bottom) + 8;      // drop 8px below

      // 4) clamp to viewport so it can't go off-screen
      const maxLeft = window.innerWidth  - menuEl.offsetWidth  - 8;
      const maxTop  = window.innerHeight - menuEl.offsetHeight - 8;

      const left = Math.max(8, Math.min(desiredLeft, Math.max(8, maxLeft)));
      const top  = Math.max(8, Math.min(desiredTop,  Math.max(8, maxTop)));

      // 5) apply final position
      menuEl.style.left = `${left}px`;
      menuEl.style.top  = `${top}px`;
      menuEl.style.minWidth = `${Math.round(splitRoot.getBoundingClientRect().width)}px`;
      menuEl.style.zIndex = "99999";

      // 6) show it
      menuEl.style.visibility = "visible";
    }
    function openMenu() {
      if (!menuEl.classList.contains("show")) {
        portalIntoBody(menuEl); // escape transforms/z-index issues
        positionMenuAroundToggle(menuEl, toggleBtn, splitRoot);
        menuEl.classList.add("show");   // relies on .dropdown-content.show { display:block }
        toggleBtn.setAttribute("aria-expanded", "true");
      }
    }

    function closeMenu() {
      if (menuEl.classList.contains("show")) {
        menuEl.classList.remove("show");
        toggleBtn.setAttribute("aria-expanded", "false");
        // optional: restore to original parent immediately
        // restoreMenu(menuEl);
      }
    }
    function toggleMenu() {
      const isOpen = menuEl.classList.contains("show");
      if (isOpen) closeMenu(); else openMenu();
      console.log("[mainMenu] toggle", { isOpen: !isOpen });
    }

    let _menuHostParent = null;
    let _menuNextSibling = null;

    function portalIntoBody(menuEl) {
      if (menuEl.parentElement !== document.body) {
        _menuHostParent = menuEl.parentElement;
        _menuNextSibling = menuEl.nextSibling;
        document.body.appendChild(menuEl);
      }
    }

    function restoreMenu(menuEl) {
      if (_menuHostParent) {
        if (_menuNextSibling) _menuHostParent.insertBefore(menuEl, _menuNextSibling);
        else _menuHostParent.appendChild(menuEl);
      }
      _menuHostParent = _menuNextSibling = null;
    }

    function positionMenuAroundToggle(menuEl, toggleBtn, splitRoot) {
      // Make it measurable first
      menuEl.style.display = "block";
      menuEl.style.visibility = "hidden";
      menuEl.style.position = "fixed";
      menuEl.style.left = "0px";
      menuEl.style.top  = "0px";

      const r = toggleBtn.getBoundingClientRect();
      const desiredLeft = Math.round(r.left);
      const desiredTop  = Math.round(r.bottom) + 8;

      // clamp to viewport
      const w = menuEl.offsetWidth;
      const h = menuEl.offsetHeight;
      const maxLeft = window.innerWidth  - w - 8;
      const maxTop  = window.innerHeight - h - 8;

      const left = Math.max(8, Math.min(desiredLeft, maxLeft));
      const top  = Math.max(8, Math.min(desiredTop,  maxTop));

      // apply
      menuEl.style.left = `${left}px`;
      menuEl.style.top  = `${top}px`;
      menuEl.style.minWidth = `${Math.round(splitRoot.getBoundingClientRect().width)}px`;
      menuEl.style.zIndex = "2147483647"; // topmost
      menuEl.style.visibility = "visible";
    }


    // --- pointer-safe toggle -------------------------------------------------
    // Use pointerdown to toggle (fires once). Swallow the follow-up click.
    toggleBtn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      toggleMenu();
    }, { passive: false });

    // Swallow any click that follows so nothing else toggles/clears it.
    toggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    });

    // --- outside click closer (pointerdown, capture) -------------------------
    const outsideCloser = (e) => {
      if (splitRoot.contains(e.target)) return;
      if (!menuEl.classList.contains("show")) return;
      closeMenu();
    };
    document.addEventListener("pointerdown", outsideCloser, { capture: true });

    // --- menu item selection -------------------------------------------------
    menuEl.addEventListener("click", (e) => {
      const item = e.target.closest(".dropdown-item");
      if (!item) return;
      selected = item.dataset.workout || "free";
      splitRoot.dataset.workout = selected;
      sessionStorage.setItem("SelectedWorkout", selected);
      startBtn.textContent = labelFor(selected);
      closeMenu();
      console.log("[mainMenu] selected", selected);
    });

    // --- start button --------------------------------------------------------
    startBtn.addEventListener("click", () => {
      sessionStorage.setItem("SelectedWorkout", selected);
      const ps = document.getElementById("pacer-speed");
      if (ps) sessionStorage.setItem("PacerSpeed", ps.value);
      // Navigate into your app (same as your current file)
      if (sessionStorage.getItem("SelectedWorkout")==='peerServer') {
          viewManager.setView(viewManager.views.peerConnect);
      } else {
          viewManager.setView(viewManager.views.mainZlow);
      }
    });

    // Keep menu positioned if viewport changes while open
    const onViewportChange = () => {
      if (menuEl.classList.contains("show")) positionMenu();
    };
    window.addEventListener("resize", onViewportChange, { passive: true });
    window.addEventListener("scroll", onViewportChange, { passive: true });

    // ARIA
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.setAttribute("aria-controls", "start-menu");
    menuEl.setAttribute("role", "menu");
    Array.from(menuEl.querySelectorAll(".dropdown-item")).forEach((el) => {
      el.setAttribute("role", "menuitem");
      el.setAttribute("tabindex", "-1");
    });

    console.log("[mainMenu] ready");
  });
};