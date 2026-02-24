// Displays after workout stats

import { units } from "./units/index.js";
import {features} from "./constants.js";

export class WorkoutSummary {
  constructor({ workoutStorage, onClose }) {
    this.storage = workoutStorage;
    this.onClose = onClose;
    this.overlayElement = null;
  }

  show(workoutStats, newRecords, streak) {
    // Creates and shows overlay
    this.createOverlay(workoutStats, newRecords, streak);
  }

  createOverlay(stats, newRecords, streak) {
    // Remove existing overlay if present
    if (this.overlayElement) {
      this.overlayElement.remove();
    }

    // create overlay
    const overlay = document.createElement("div");
    overlay.id = "workout-summary-overlay";
    overlay.innerHTML = this.generateHTML(stats, newRecords, streak);

    document.body.appendChild(overlay);
    this.overlayElement = overlay;

    this.setupEventListeners();

    requestAnimationFrame(() => {
      overlay.classList.add("visible");
    });
  }

  generateHTML(stats, newRecords, streak) {
    // load personal records to compare
    const records = this.storage.getPersonalRecords();

    // map for quick reference
    const recordKeys = newRecords
      ? newRecords.reduce((acc, r) => {
          acc[r.key] = true;
          return acc;
        }, {})
      : {};

    const formatTime = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, "0")}:${String(
          secs
        ).padStart(2, "0")}`;
      }
      return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
        2,
        "0"
      )}`;
    };

    // helper method
    const getRecordDisplay = (recordKey, currentValue, unit = "") => {
      const isNewRecord = recordKeys[recordKey];
      const existingRecord = records[recordKey];

      if (isNewRecord) {
        // displays new personal records with special formatting
        return `<span class="new-record">${currentValue}${unit}</span>`;
      } else if (existingRecord) {
        let displayValue = existingRecord.value;

        if (recordKey === "longestTime") {
          const hours = Math.floor(displayValue / 3600);
          const minutes = Math.floor((displayValue % 3600) / 60);
          const secs = displayValue % 60;
          displayValue =
            hours > 0
              ? `${hours}:${String(minutes).padStart(2, "0")}:${String(
                  secs
                ).padStart(2, "0")}`
              : `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
                  2,
                  "0"
                )}`;
          return displayValue;
        } else if (recordKey.includes("Distance")) {
          return `${units.distanceUnit.convertTo(displayValue).toFixed(2)} ${
            units.distanceUnit.name
          }`;
        } else if (recordKey.includes("Speed")) {
          return `${units.speedUnit.convertTo(displayValue).toFixed(1)} ${
            units.speedUnit.name
          }`;
        } else if (recordKey.includes("Power")) {
          return `${Math.round(displayValue)} W`;
        } else if (recordKey === "mostCalories") {
          return `${Math.round(displayValue)} kcal`;
        } else if (recordKey === "highestFtp") {
          return `${Math.round(displayValue)} W`;
        }
        return `${displayValue}${unit}`;
      }

      // If first stat then just show a dash
      return "—";
    };

    return `
      <div id="workout-summary-container">
        <h2>Workout Complete!</h2>
        
        ${
          streak > 1
            ? `
          <div class="streak-display ${
            newRecords.length > 0 ? "has-records" : ""
          }">
            <span class="streak-number">${streak}</span>
            <span class="streak-label">Day Streak</span>
          </div>
        `
            : ""
        }
        
        <div class="stats-container">
          <table class="summary-stats-table">
            <thead>
              <tr>
                <th>Stat</th>
                <th>Value</th>
                <th>Personal Best</th>
              </tr>
            </thead>
            <tbody>
              <tr class="${recordKeys.longestTime ? "record-row" : ""}">
                <td>Total Time</td>
                <td>${formatTime(stats.totalTime)}</td>
                <td class="record-cell">${getRecordDisplay(
                  "longestTime",
                  formatTime(stats.totalTime)
                )}</td>
              </tr>
              
              <tr class="${recordKeys.longestDistance ? "record-row" : ""}">
                <td>Total Distance</td>
                <td>${units.distanceUnit
                  .convertTo(stats.totalDistance)
                  .toFixed(2)} ${units.distanceUnit.name}</td>
                <td class="record-cell">${getRecordDisplay(
                  "longestDistance",
                  units.distanceUnit.convertTo(stats.totalDistance).toFixed(2),
                  ` ${units.distanceUnit.name}`
                )}</td>
              </tr>
              
              <tr class="${recordKeys.mostCalories ? "record-row" : ""}">
                <td>Total Calories</td>
                <td>${Math.round(stats.totalCalories)} kcal</td>
                <td class="record-cell">${getRecordDisplay(
                  "mostCalories",
                  Math.round(stats.totalCalories),
                  " kcal"
                )}</td>
              </tr>
              
              <tr class="${recordKeys.highestAvgSpeed ? "record-row" : ""}">
                <td>Avg Speed</td>
                <td>${units.speedUnit.convertTo(stats.avgSpeed).toFixed(1)} ${
      units.speedUnit.name
    }</td>
                <td class="record-cell">${getRecordDisplay(
                  "highestAvgSpeed",
                  units.speedUnit.convertTo(stats.avgSpeed).toFixed(1),
                  ` ${units.speedUnit.name}`
                )}</td>
              </tr>
              
              <tr class="${recordKeys.highestAvgPower ? "record-row" : ""}">
                <td>Avg Power</td>
                <td>${Math.round(stats.avgPower)} W</td>
                <td class="record-cell">${getRecordDisplay(
                  "highestAvgPower",
                  Math.round(stats.avgPower),
                  " W"
                )}</td>
              </tr>
              
              <tr class="${recordKeys.highestMaxSpeed ? "record-row" : ""}">
                <td>Max Speed</td>
                <td>${units.speedUnit.convertTo(stats.maxSpeed).toFixed(1)} ${
      units.speedUnit.name
    }</td>
                <td class="record-cell">${getRecordDisplay(
                  "highestMaxSpeed",
                  units.speedUnit.convertTo(stats.maxSpeed).toFixed(1),
                  ` ${units.speedUnit.name}`
                )}</td>
              </tr>
              
              <tr class="${recordKeys.highestMaxPower ? "record-row" : ""}">
                <td>Max Power</td>
                <td>${Math.round(stats.maxPower)} W</td>
                <td class="record-cell">${getRecordDisplay(
                  "highestMaxPower",
                  Math.round(stats.maxPower),
                  " W"
                )}</td>
              </tr>

              ${
                stats.ftp != null
                  ? `
                <tr class="${recordKeys.highestFtp ? "record-row" : ""}">
                  <td>FTP (estimate)</td>
                  <td>${Math.round(stats.ftp)} W</td>
                  <td class="record-cell">${getRecordDisplay(
                    "highestFtp",
                    Math.round(stats.ftp),
                    " W"
                  )}</td>
                </tr>
                ${
                  stats.peakMinutePower
                    ? `
                <tr class="${recordKeys.highestPeakMinutePower ? "record-row" : ""}">
                  <td>Best 1-min Power</td>
                  <td>${Math.round(stats.peakMinutePower)} W</td>
                  <td class="record-cell">${getRecordDisplay(
                    "highestPeakMinutePower",
                    Math.round(stats.peakMinutePower),
                    " W"
                  )}</td>
                </tr>
                `
                    : ""
                }
              `
                  : ""
              }
              
            </tbody>
          </table>
        </div>
        
        <div class="export-buttons">
          <button id="summary-export-tcx" class="summary-btn">Download TCX</button>
          ${features.stravaEnabled 
            ? `<button id="summary-export-strava" class="summary-btn">Export to Strava</button>`
            : ""
          }
        </div>
        
        <button id="close-summary" class="close-btn">Close</button>
      </div>
    `;
  }

  setupEventListeners() {
    // add a close button
    const closeBtn = document.getElementById("close-summary");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.dismiss());
    }
  }

  dismiss() {
    if (!this.overlayElement) return;

    this.overlayElement.classList.remove("visible");

    setTimeout(() => {
      if (this.overlayElement) {
        this.overlayElement.remove();
        this.overlayElement = null;
      }

      if (this.onClose) {
        this.onClose();
      }
    }, 300);
  }

  isShowing() {
    return this.overlayElement !== null;
  }
}

export function showStopConfirmation(onConfirm, onCancel) {
  // this is for the confirmation end workout (stop button)
  const overlay = document.createElement("div");
  overlay.id = "stop-confirmation-overlay";
  overlay.innerHTML = `
    <div id="stop-confirmation-container">
      <h3>End Workout?</h3>
      <p>Are you sure you want to end this workout?</p>
      <div class="confirmation-buttons">
        <button id="confirm-stop" class="confirm-btn">End Workout</button>
        <button id="cancel-stop" class="cancel-btn">Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const confirmBtn = document.getElementById("confirm-stop");
  const cancelBtn = document.getElementById("cancel-stop");

  const cleanup = () => {
    overlay.classList.remove("visible");
    setTimeout(() => overlay.remove(), 300);
  };

  confirmBtn.addEventListener("click", () => {
    cleanup();
    if (onConfirm) onConfirm();
  });

  cancelBtn.addEventListener("click", () => {
    cleanup();
    if (onCancel) onCancel();
  });

  requestAnimationFrame(() => {
    overlay.classList.add("visible");
  });
}
