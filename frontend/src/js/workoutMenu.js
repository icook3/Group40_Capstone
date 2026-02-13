document.addEventListener('DOMContentLoaded', () => {
  const workoutsBtn = document.getElementById('workouts-btn');
  const workoutOptions = document.getElementById('workout-options');
  const workoutBack = document.getElementById('workout-back');
  const startWrapper = document.getElementById('start-wrapper');
  const workoutsWrapper = document.getElementById('workouts-wrapper');

  workoutsBtn.addEventListener('click', () => {
    startWrapper.classList.add('fade-out');
    workoutsWrapper.classList.add('fade-out');

    setTimeout(() => {
      startWrapper.style.display = 'none';
      workoutsWrapper.style.display = 'none';
      workoutOptions.classList.remove('hidden');
    }, 200);
  });

  workoutBack.addEventListener('click', () => {
    workoutOptions.classList.add('fade-out');

    setTimeout(() => {
      workoutOptions.classList.add('hidden');
      workoutOptions.classList.remove('fade-out');
      startWrapper.style.display = 'flex';
      workoutsWrapper.style.display = 'flex';
      startWrapper.classList.remove('fade-out');
      workoutsWrapper.classList.remove('fade-out');
    }, 200);
  });
});