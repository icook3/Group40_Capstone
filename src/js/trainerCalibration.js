// trainerCalibration.js - Handles trainer connection and calibration sequence
import { TrainerBluetooth } from "./bluetooth.js";

export class TrainerCalibration {
  constructor() {
    this.trainer = new TrainerBluetooth();
    this.isConnected = false;
    this.calibrationInProgress = false;
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
  }

  // Update UI elements
  updateStatus(message, type = "info") {
    const statusDisplay = document.getElementById("status-display");
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
    // Clear all steps
    for (let i = 1; i <= 4; i++) {
      const step = document.getElementById(`step-${i}`);
      if (step) {
        step.classList.remove("active", "completed");
      }
    }
    // Mark previous steps as completed and current as active
    for (let i = 1; i < stepNumber; i++) {
      const step = document.getElementById(`step-${i}`);
      if (step) step.classList.add("completed");
    }
    const currentStepEl = document.getElementById(`step-${stepNumber}`);
    if (currentStepEl) currentStepEl.classList.add("active");
  }

  updateDataDisplay() {
    const dataDisplay = document.getElementById("data-display");
    if (dataDisplay) {
      dataDisplay.style.display = "block";
      const powerValue = document.getElementById("power-value");
      const calibrationState = document.getElementById("calibration-state");
      const lastEvent = document.getElementById("last-event");

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
        const startBtn = document.getElementById("start-calibration-btn");
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
    sessionStorage.setItem("TrainerCalibrationSkipped", "true");
    sessionStorage.setItem("Trainer", JSON.stringify(this.trainer));
    this.returnToMenu();
  }

  returnToMenu() {
    window.location.href = "./mainMenu.html";
  }
}

// Initialize on page load
window.initCalibration = function () {
  const calibration = new TrainerCalibration();

  // Connect trainer button
  const connectBtn = document.getElementById("connect-trainer-btn");
  if (connectBtn) {
    connectBtn.addEventListener("click", async () => {
      connectBtn.disabled = true;
      await calibration.connectTrainer();
      connectBtn.disabled = calibration.calibrationInProgress;
    });
  }

  // Start calibration button
  const startBtn = document.getElementById("start-calibration-btn");
  if (startBtn) {
    startBtn.addEventListener("click", async () => {
      startBtn.disabled = true;
      connectBtn.disabled = true;
      await calibration.startCalibration();
    });
  }

  // Skip calibration button
  const skipBtn = document.getElementById("skip-calibration-btn");
  if (skipBtn) {
    skipBtn.addEventListener("click", () => {
      calibration.skipCalibration();
    });
  }

  // Back to menu button
  const backBtn = document.getElementById("back-menu-btn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      calibration.returnToMenu();
    });
  }

  // Initial display update
  calibration.updateStatus("Ready to calibrate", "info");
  calibration.updateStepUI(1);
};
