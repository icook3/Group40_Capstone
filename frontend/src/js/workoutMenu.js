document.addEventListener('DOMContentLoaded', () => {
  const workoutsBtn = document.getElementById('workouts-btn');
  const workoutOptions = document.getElementById('workout-options');
  const workoutBack = document.getElementById('workout-back');
  const mainButtons = document.getElementById('main-buttons');
  const settingsBtn = document.getElementById('settings-btn');
  const menuSettings = document.getElementById('menu-settings');
  const settingsBack = document.getElementById('settings-back');

  workoutsBtn.addEventListener('click', () => {
    mainButtons.classList.add('pushed-back');

    setTimeout(() => {
      workoutOptions.classList.remove('hidden');
      workoutOptions.classList.remove('zoom-out');
    }, 150);
  });

  workoutBack.addEventListener('click', () => {
    workoutOptions.classList.add('zoom-out');

    setTimeout(() => {
      workoutOptions.classList.add('hidden');
      workoutOptions.classList.remove('zoom-out');
      mainButtons.classList.remove('pushed-back');
    }, 250);
  });

  settingsBtn.addEventListener('click', () => {
    mainButtons.classList.add('pushed-back');

    setTimeout(() => {
      menuSettings.style.display = 'flex';
      // Force layout computation before animation
      menuSettings.offsetHeight;
      menuSettings.classList.add('zoom-in');
    }, 150);
  });

  settingsBack.addEventListener('click', () => {
    menuSettings.classList.remove('zoom-in');
    menuSettings.classList.add('zoom-out');

    setTimeout(() => {
      menuSettings.style.display = 'none';
      menuSettings.classList.remove('zoom-out');
      mainButtons.classList.remove('pushed-back');
    }, 250);
  });

    document.getElementById("clear-btn").addEventListener("click", () => {
    sessionStorage.clear();
    localStorage.clear();
    document.getElementById("pacer-speed").value = 20;
    document.getElementById("rider-weight").value = 70;
    document.getElementById("name-input").value = "";
    document.getElementById("dev-toggle").checked = false;
    document.getElementById("peer-toggle").checked = false;
    jQuery("#peer-name").fadeOut(500);
    document.querySelectorAll(".seg-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.unit === "km/h" || btn.dataset.unit === "kg");
    });
    document.querySelectorAll(".speedUnit").forEach(el => el.textContent = "km/h");
    document.querySelectorAll(".weightUnit").forEach(el => el.textContent = "kg");
  });

});

// --- Launch ride ---
function launchWorkout(workout) {
  sessionStorage.setItem("SelectedWorkout", workout);
  const ps = document.getElementById("pacer-speed");
  if (ps) sessionStorage.setItem("PacerSpeed", ps.value);

  if (workout === "peerServer") {
    window.location.href = "../html/connectToPeers.html";
  } else {
    window.location.href = "../html/zlow.html";
  }
}

// Quick Ride
document.getElementById("start-btn").addEventListener("click", () => {
  launchWorkout("free");
});

// Workout options (Ramp, Sprint, and upcoming workouts)
document.querySelectorAll(".workout-option").forEach((btn) => {
  btn.addEventListener("click", () => {
    launchWorkout(btn.dataset.workout);
  });
});

// Connect to Peer menu link
document.getElementById("peer-connect-btn").addEventListener("click", () => {
  launchWorkout("peerServer");
});