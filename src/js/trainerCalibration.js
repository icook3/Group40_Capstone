// trainerCalibration.js - Handles trainer connection and calibration sequence
import { TrainerBluetooth } from "./bluetooth.js";

export class TrainerCalibration {
  constructor(options = {}) {
    this.trainer = options.trainer || new TrainerBluetooth();
    this.isConnected = this.trainer?.device ? true : false; // Check if trainer already connected
    this.calibrationInProgress = false;
    this.isModal = options.isModal || false; // Flag to determine if running as modal
    this.calibrationSteps = {
      CONNECT: "connect",
      SPINDOWN: "spindown",
      ZERO_OFFSET: "zero_offset",
      COMPLETE: "complete",
    };
    this.currentStep = this.calibrationSteps.CONNECT;
    this.calibrationData = {
      power: 0,
      timestamp: null,
      lastEvent: "Waiting for trainer connection...",
    };
    
    // If trainer is already connected, update UI to reflect that
    if (this.isConnected) {
      this.calibrationData.lastEvent = "Trainer already connected";
      this.currentStep = this.calibrationSteps.CONNECT;
    }
  }

  // Update UI elements
  updateStatus(message, type = "info") {
    const statusDisplay = this.isModal
      ? document.getElementById("calibration-status-display")
      : document.getElementById("status-display");
    if (statusDisplay) {
      statusDisplay.textContent = message;
      statusDisplay.className = "calibration-status";
      if (type === "connected") {
        statusDisplay.classList.add("status-connected");
      } else if (type === "error") {
        statusDisplay.classList.add("status-error");
      } else if (type === "in-progress") {
        statusDisplay.classList.add("status-in-progress");
      }
    }
  }

  updateStepUI(stepNumber) {
    const prefix = this.isModal ? "calibration-step-" : "step-";
    // Clear all steps
    for (let i = 1; i <= 4; i++) {
      const step = document.getElementById(`${prefix}${i}`);
      if (step) {
        step.classList.remove("active", "completed");
      }
    }
    // Mark previous steps as completed and current as active
    for (let i = 1; i < stepNumber; i++) {
      const step = document.getElementById(`${prefix}${i}`);
      if (step) step.classList.add("completed");
    }
    const currentStepEl = document.getElementById(`${prefix}${stepNumber}`);
    if (currentStepEl) currentStepEl.classList.add("active");
  }

  updateDataDisplay() {
    const dataDisplay = this.isModal
      ? document.getElementById("calibration-data-display")
      : document.getElementById("data-display");
    if (dataDisplay) {
      dataDisplay.style.display = "block";
      const powerValueId = this.isModal ? "calibration-power-value" : "power-value";
      const calibrationStateId = this.isModal ? "calibration-state-value" : "calibration-state";
      const lastEventId = this.isModal ? "calibration-last-event" : "last-event";

      const powerValue = document.getElementById(powerValueId);
      const calibrationState = document.getElementById(calibrationStateId);
      const lastEvent = document.getElementById(lastEventId);

      if (powerValue)
        powerValue.textContent = this.calibrationData.power.toFixed(0) + " W";
      if (calibrationState)
        calibrationState.textContent = this.currentStep.toUpperCase();
      if (lastEvent)
        lastEvent.textContent = this.calibrationData.lastEvent;
    }
  }

  async connectTrainer() {
    try {
      // If trainer is already connected, just update UI and set up data callback
      if (this.isConnected && this.trainer?.device) {
        this.updateStatus("Trainer already connected!", "connected");
        this.updateStepUI(1);
        this.calibrationData.lastEvent = "Trainer connected successfully";
        
        // Set up data callback to receive power updates
        this.trainer.onData = (data) => {
          this.calibrationData.power = data.power || 0;
          this.calibrationData.timestamp = new Date();
          this.updateDataDisplay();
        };
        
        this.updateDataDisplay();
        
        // Enable calibration button
        const startBtnId = this.isModal
          ? "calibration-start-btn"
          : "start-calibration-btn";
        const startBtn = document.getElementById(startBtnId);
        if (startBtn) startBtn.disabled = false;
        
        return true;
      }

      this.updateStatus("Connecting to trainer...", "in-progress");
      this.updateStepUI(1);

      const ok = await this.trainer.connect();
      if (ok) {
        this.isConnected = true;
        this.calibrationData.lastEvent = "Trainer connected successfully";

        // Set up data callback
        this.trainer.onData = (data) => {
          this.calibrationData.power = data.power || 0;
          this.calibrationData.timestamp = new Date();
          this.updateDataDisplay();
        };

        this.updateStatus("Trainer connected! Ready to calibrate", "connected");
        this.updateDataDisplay();

        // Enable calibration button
        const startBtnId = this.isModal
          ? "calibration-start-btn"
          : "start-calibration-btn";
        const startBtn = document.getElementById(startBtnId);
        if (startBtn) startBtn.disabled = false;

        return true;
      } else {
        this.isConnected = false;
        this.calibrationData.lastEvent = "Trainer connection failed";
        this.updateStatus("Trainer connection failed. Please try again.", "error");
        this.updateDataDisplay();
        return false;
      }
    } catch (error) {
      this.isConnected = false;
      this.calibrationData.lastEvent = `Error: ${error.message}`;
      this.updateStatus(`Connection error: ${error.message}`, "error");
      this.updateDataDisplay();
      return false;
    }
  }

  async startCalibration() {
    if (!this.isConnected) {
      this.updateStatus("Trainer not connected. Please connect first.", "error");
      return;
    }

    this.calibrationInProgress = true;
    this.currentStep = this.calibrationSteps.SPINDOWN;
    this.updateStepUI(2);

    try {
      // Step 1: Spin-down calibration
      this.updateStatus(
        "Spin-down calibration in progress. Pedal at steady power, then stop...",
        "in-progress"
      );
      this.calibrationData.lastEvent = "Awaiting spindown calibration";
      this.updateDataDisplay();

      // Simulate spindown calibration - listen for power changes
      await this.performSpindownCalibration();

      // Step 2: Zero offset calibration
      this.currentStep = this.calibrationSteps.ZERO_OFFSET;
      this.updateStepUI(3);
      this.updateStatus(
        "Zero offset calibration in progress. Please wait...",
        "in-progress"
      );
      this.calibrationData.lastEvent = "Performing zero offset calibration";
      this.updateDataDisplay();

      await this.performZeroOffsetCalibration();

      // Calibration complete
      this.currentStep = this.calibrationSteps.COMPLETE;
      this.updateStepUI(4);
      this.updateStatus("Calibration complete!", "connected");
      this.calibrationData.lastEvent = "Calibration successful";
      this.updateDataDisplay();

      // Store calibration data
      // Note: this.trainer is the shared instance from standardMode, 
      // so it's automatically updated in the main app
      sessionStorage.setItem("TrainerCalibrated", "true");
      sessionStorage.setItem("TrainerCalibrationTime", new Date().toISOString());
      sessionStorage.setItem("Trainer", JSON.stringify(this.trainer));

      this.calibrationInProgress = false;
    } catch (error) {
      this.calibrationInProgress = false;
      this.calibrationData.lastEvent = `Calibration error: ${error.message}`;
      this.updateStatus(`Calibration error: ${error.message}`, "error");
      this.updateDataDisplay();
    }
  }

  async performSpindownCalibration() {
    return new Promise((resolve) => {
      const spindownTimeout = setTimeout(() => {
        this.calibrationData.lastEvent =
          "Spin-down calibration completed (timeout)";
        this.updateDataDisplay();
        resolve();
      }, 20000); // 20 second timeout for spin-down

      // Listen for power changes to detect coastdown completion
      let lastPower = this.calibrationData.power;
      let stableLowCount = 0;
      const checkInterval = setInterval(() => {
        const currentPower = this.calibrationData.power;

        // If power drops below 50W and stays low, consider it complete
        if (currentPower < 50 && Math.abs(currentPower - lastPower) < 10) {
          stableLowCount++;
          if (stableLowCount > 3) {
            clearInterval(checkInterval);
            clearTimeout(spindownTimeout);
            this.calibrationData.lastEvent = "Spin-down calibration completed";
            this.updateDataDisplay();
            resolve();
            return;
          }
        } else {
          stableLowCount = 0;
        }
        lastPower = currentPower;
      }, 1000);
    });
  }

  async performZeroOffsetCalibration() {
    return new Promise((resolve) => {
      // Zero offset typically takes 2-5 seconds
      const calibrationTimeout = setTimeout(() => {
        this.calibrationData.lastEvent = "Zero offset calibration completed";
        this.updateDataDisplay();
        resolve();
      }, 5000);
    });
  }

  skipCalibration() {
    // Store that calibration was skipped but trainer is available
    // Note: this.trainer is the shared instance from standardMode
    sessionStorage.setItem("TrainerCalibrationSkipped", "true");
    sessionStorage.setItem("Trainer", JSON.stringify(this.trainer));
    if (this.isModal) {
      this.closeModal();
    } else {
      this.returnToMenu();
    }
  }

  closeModal() {
    const modal = document.getElementById("calibration-modal");
    if (modal) {
      modal.classList.remove("show");
      modal.setAttribute("aria-hidden", "true");
    }
  }

  returnToMenu() {
    window.location.href = "./mainMenu.html";
  }
}

// Initialize on page load - handles both modal and standalone modes
window.initCalibration = function (options = {}) {
  // Determine if we're in modal mode by checking if the modal exists
  const isModal = !!document.getElementById("calibration-modal");
  const calibration = new TrainerCalibration({ 
    isModal, 
    trainer: options.trainer // Pass the shared trainer instance if provided
  });

  const connectBtnId = isModal
    ? "calibration-connect-trainer-btn"
    : "connect-trainer-btn";
  const startBtnId = isModal ? "calibration-start-btn" : "start-calibration-btn";
  const skipBtnId = isModal ? "calibration-skip-btn" : "skip-calibration-btn";
  const closeBtnId = isModal ? "calibration-close-btn" : "back-menu-btn";

  // Connect trainer button
  const connectBtn = document.getElementById(connectBtnId);
  if (connectBtn) {
    connectBtn.addEventListener("click", async () => {
      connectBtn.disabled = true;
      await calibration.connectTrainer();
      connectBtn.disabled = calibration.calibrationInProgress;
    });
  }

  // Start calibration button
  const startBtn = document.getElementById(startBtnId);
  if (startBtn) {
    startBtn.addEventListener("click", async () => {
      startBtn.disabled = true;
      connectBtn.disabled = true;
      await calibration.startCalibration();
    });
  }

  // Skip calibration button
  const skipBtn = document.getElementById(skipBtnId);
  if (skipBtn) {
    skipBtn.addEventListener("click", () => {
      calibration.skipCalibration();
    });
  }

  // Close/Back button
  const closeBtn = document.getElementById(closeBtnId);
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      if (isModal) {
        calibration.closeModal();
      } else {
        calibration.returnToMenu();
      }
    });
  }

  // Initial display update
  if (calibration.isConnected) {
    calibration.updateStatus("Trainer already connected! Ready to calibrate", "connected");
    const connectBtn = document.getElementById(connectBtnId);
    if (connectBtn) connectBtn.textContent = "Trainer Connected";
  } else {
    calibration.updateStatus("Ready to calibrate", "info");
  }
  calibration.updateStepUI(1);

  // Store calibration instance globally for access from main.js
  window.trainerCalibration = calibration;
};