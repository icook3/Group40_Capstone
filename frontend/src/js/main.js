// main.js: Some important state management
import { Strava } from "./strava.js";
import { constants } from "./constants.js";
import { rideHistory } from "./rideHistoryStore.js";

// Prevent meshes from disappearing due to frustum culling
AFRAME.registerComponent("no-cull", {
  init() {
    this.el.addEventListener("model-loaded", () => {
      this.el.object3D.traverse((obj) => (obj.frustumCulled = false));
    });
  },
});

export function activatePacer() {
  //if (peerState!=0) {return;}
  if (!constants.pacerStarted) {
    //scene.activatePacer();
    constants.pacerStarted = true;
  }
}

// Gets workout summary
export function getWorkoutSummary() {
  const history = rideHistory.samples;
  if (!history || history.length < 2) return null;

  const startTime = history[0].time;
  const endTime = history[history.length - 1].time;

  const duration = Math.floor((endTime - startTime) / 1000);
  const distanceKm = history[history.length - 1].distance;
  const avgPower =
    history.reduce((sum, p) => sum + p.power, 0) / history.length;

  return {
    name: "Zlow Ride",
    description: "Workout synced from Zlow Cycling",
    distance: distanceKm, // km to m Strava converter happens inside upload
    duration: duration,
    avgPower: Math.round(avgPower),
  };
}

export async function exportToStrava() {
  const strava = new Strava();

  if (!Strava.isConnected()) {
    alert("You must connect to Strava first (from main menu).\n" +
        "Please upload the TCX manually.");
    return;
  }

  const workout = getWorkoutSummary();
  if (!workout) {
    alert("No workout data yet. Ride first!");
    return;
  }

  const tcxString = buildTCX({
    samples: rideHistory.samples,
    kmhToMs: (kmh) => constants.kmhToMs(kmh),
  })
  const tcxBlob = tcxToBlob(tcxString);

  try {
      await strava.uploadActivity({
          tcxBlob: tcxBlob,
          name: workout.name,
          description: workout.description,
      });
      alert("Workout sent to Strava! It may take a few seconds to appear.");
  } catch (err) {
      handleStravaExportFailure(err);
  }
}

function handleStravaExportFailure(err) {
    // Rate limit hit
    if (err?.status === 429) {
        alert(
            "Strava upload limit reached.\n" +
            "Please download the TCX file and upload it manually to Strava."
        );
        return;
    }

    // Backend down / Strava unavailable
    if (err?.status === 500 || err?.status === 503) {
        alert(
            "Strava service is currently unavailable.\n" +
            "Please download the TCX file and upload it manually to Strava."
        );
        return;
    }

    // Fallback
    alert(
        "Unable to upload to Strava.\n" +
        "Please download the TCX file and upload it manually."
    );
}

/**
 * Save a TCX file
 */
export function saveTCX() {
  const tcxString = buildTCX({
    samples: rideHistory.samples,
    kmhToMs: (kmh) => constants.kmhToMs(kmh),
  })

  if (!tcxString) {
    alert("Not enough data to export.");
    return;
  }

  const blob = tcxToBlob(tcxString);
  downloadBlob(blob, "zlow-ride.tcx");
}



