// js/mainMenu.js — handles Start / dropdown on the menu page only

// js/mainMenu.js — handles Start / dropdown on the menu page only

(function mainMenuBoot() {
  const ready = (fn) =>
    document.readyState === "loading"
      ? document.addEventListener("DOMContentLoaded", fn, { once: true })
      : fn();

  ready(() => {
    const startBtn  = document.getElementById('start-btn');
    const toggleBtn = document.getElementById('start-toggle');
    const menuEl    = document.getElementById('start-menu');
    const splitRoot = document.getElementById('start-split');

    if (!startBtn || !toggleBtn || !menuEl || !splitRoot) {
      console.warn('[mainMenu] Missing menu elements.');
      return;
    }

    // Label reflects last selection
    let selected = sessionStorage.getItem('SelectedWorkout') || 'free';
    const labelFor = (id) =>
      id === 'ramp'  ? 'Start (Ramp Test)' :
      id === 'ftp20' ? 'Start (FTP 20-min)' :
                       'Start (Free Ride)';
    startBtn.textContent = labelFor(selected);

    // Start action
    startBtn.addEventListener('click', () => {
      sessionStorage.setItem('SelectedWorkout', selected);
      window.location.href = '../index.html';
    });

    // Open/close dropdown
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      menuEl.classList.toggle('show');
      toggleBtn.setAttribute('aria-expanded', menuEl.classList.contains('show'));
    });

    // Pick an item
    menuEl.addEventListener('click', (e) => {
      const item = e.target.closest('.dropdown-item');
      if (!item) return;
      selected = item.dataset.workout;
      startBtn.textContent = labelFor(selected);
      sessionStorage.setItem('SelectedWorkout', selected);
      menuEl.classList.remove('show');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });

    // Click outside closes
    document.addEventListener('click', (e) => {
      if (!splitRoot.contains(e.target)) {
        menuEl.classList.remove('show');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  });
})();


