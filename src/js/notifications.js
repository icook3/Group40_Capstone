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

    console.log("Toast created:", message);
  }
}
