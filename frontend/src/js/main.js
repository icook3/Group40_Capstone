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

  try {
      await strava.uploadActivity(workout);
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

// =====================
// TCX EXPORT (RideHistory samples: { elapsedMs, epochMs, power, speed, distance })
// =====================

// Generates TCX file
export function generateTCXFile() {
  const history = rideHistory.samples;

  // Need at least 2 points to compute duration/track
  if (!history || history.length < 2) return null;

  // Defensive: ensure required fields exist
  const hasEpoch = history[0]?.epochMs != null && history.at(-1)?.epochMs != null;
  const hasElapsed = history.at(-1)?.elapsedMs != null;
  if (!hasEpoch) {
    console.error("TCX export failed: samples missing epochMs", history[0], history.at(-1));
    return null;
  }

  const startEpochMs = history[0].epochMs;
  const endEpochMs = history.at(-1).epochMs;
  const startTime = new Date(startEpochMs);

  // Prefer elapsedMs for total time (it’s exactly what you recorded), else fall back to epoch delta
  const totalTimeSeconds = Math.max(
    0,
    Math.floor(((hasElapsed ? history.at(-1).elapsedMs : (endEpochMs - startEpochMs)) || 0) / 1000)
  );

  const distanceMeters = ((history.at(-1).distance || 0) * 1000).toFixed(1);

  let tcx = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  tcx += `<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd">\n`;
  tcx += `  <Activities>\n`;
  tcx += `    <Activity Sport="Biking">\n`;
  tcx += `      <Id>${startTime.toISOString()}</Id>\n`;
  tcx += `      <Lap StartTime="${startTime.toISOString()}">\n`;
  tcx += `        <TotalTimeSeconds>${totalTimeSeconds}</TotalTimeSeconds>\n`;
  tcx += `        <DistanceMeters>${distanceMeters}</DistanceMeters>\n`;
  tcx += `        <Intensity>Active</Intensity>\n`;
  tcx += `        <TriggerMethod>Manual</TriggerMethod>\n`;
  tcx += `        <Track>\n`;

  for (const pt of history) {
    // Guard against bad points
    if (pt?.epochMs == null) continue;

    const timeISO = new Date(pt.epochMs).toISOString();
    const distM = ((pt.distance || 0) * 1000).toFixed(1);
    const watts = Math.round(pt.power || 0);

    // Your pt.speed is in km/h (based on your code earlier), convert to m/s for TCX extension
    const speedMs = constants.kmhToMs(pt.speed || 0).toFixed(3);

    tcx += `          <Trackpoint>\n`;
    tcx += `            <Time>${timeISO}</Time>\n`;
    tcx += `            <Position><LatitudeDegrees>0</LatitudeDegrees><LongitudeDegrees>0</LongitudeDegrees></Position>\n`;
    tcx += `            <DistanceMeters>${distM}</DistanceMeters>\n`;
    tcx += `            <Extensions>\n`;
    tcx += `              <ns3:TPX xmlns:ns3="http://www.garmin.com/xmlschemas/ActivityExtension/v2">\n`;
    tcx += `                <ns3:Watts>${watts}</ns3:Watts>\n`;
    tcx += `                <ns3:Speed>${speedMs}</ns3:Speed>\n`;
    tcx += `              </ns3:TPX>\n`;
    tcx += `            </Extensions>\n`;
    tcx += `          </Trackpoint>\n`;
  }

  tcx += `        </Track>\n`;
  tcx += `      </Lap>\n`;
  tcx += `    </Activity>\n`;
  tcx += `  </Activities>\n`;
  tcx += `</TrainingCenterDatabase>\n`;

  return new Blob([tcx], { type: "application/vnd.garmin.tcx+xml" });
}

/**
 * Save a TCX file
 */
export function saveTCX() {
  try {
    const tcxBlob = generateTCXFile();
    if (!tcxBlob) {
      alert("Not enough data to export.");
      return;
    }

    const url = URL.createObjectURL(tcxBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "zlow-ride.tcx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    rideHistory.reset();
  } catch (err) {
    console.error("TCX export error:", err);
    alert("TCX export failed. Check the console for details.");
  }
}

