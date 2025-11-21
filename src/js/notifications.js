export class NotificationManager {
  constructor() {
    this.container = this.createContainer();
    this.currentToast = null;
    this.queue = []; // to queue notifications
    this.isProcessing = false;
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
    // add notification to queue
    this.queue.push(message);

    // start processing queue
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  processQueue() {
    // once queue is empty, stop processing
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;

    // get next message/notification
    const message = this.queue.shift();

    const toast = document.createElement("div");
    toast.className = "milestone-toast";
    toast.textContent = message;

    this.container.appendChild(toast);
    this.currentToast = toast;

    // animation
    setTimeout(() => {
      toast.classList.add("visible");
    }, 10);

    setTimeout(() => {
      this.dismiss(toast);
    }, 6000);

    console.log("Toast created:", message);
  }

  dismiss(toast) {
    toast.classList.remove("visible");

    setTimeout(() => {
      toast.remove();
      this.currentToast = null;

      // process the next in queue
      this.processQueue();
    }, 300);
  }
}
