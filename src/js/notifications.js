export class NotificationManager {
  constructor() {
    this.container = this.createContainer();
  }

  createContainer() {
    let container = document.getElementById("milestone-notifications");

    if (!container) {
      container = document.createElement("div");
      container.id = "milestone-notifications";
      document.body.appendChild(container);
    }

    return container;
  }

  show(message) {
    // Create a div with a message
    const toast = document.createElement("div");
    toast.className = "milestone-toast";
    toast.textContent = message;

    // Add it to the container
    this.container.appendChild(toast);

    // Starts animation to show notification
    setTimeout(() => {
      toast.classList.add("visible");
    }, 10);

    // goes away after given time (currently 6 seconds)
    setTimeout(() => {
      this.dismiss(toast);
    }, 6000);
  }

  dismiss(toast) {
    toast.classList.remove("visible");

    // removes DOM after notification disapears
    setTimeout(() => {
      toast.remove();
    }, 300);
  }
}
