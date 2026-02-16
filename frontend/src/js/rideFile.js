export function buildTCX({ samples, kmhToMs }) {
    if (!samples || samples.length < 2) return null;

    const tcx =
        xmlTCXHeader() +
        buildActivity(samples, kmhToMs) +
        xmlTCXFooter();

    return tcx;
}

function xmlTCXHeader() {
    let header = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    header += `<TrainingCenterDatabase
xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xsi:schemaLocation="
http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2
http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd">\n`;
    header += `  <Activities>\n`;


    return header;
}

function buildActivity(samples, kmhToMs) {
    const startEpochMs = samples[0].epochMs;
    const endEpochMs = samples.at(-1).epochMs;

    const startTime = new Date(startEpochMs);
    const totalTimeInSeconds = Math.floor(
        ((samples.at(-1).elapsedMs ?? (endEpochMs - startEpochMs)) || 0) / 1000
    );

    const distanceInMeters = ((samples.at(-1).distance || 0)).toFixed(1);

    let activity = `    <Activity Sport="Biking">\n`;
    activity += `      <Id>${startTime.toISOString()}</Id>\n`;
    activity += `      <Lap StartTime="${startTime.toISOString()}">\n`;
    activity += `        <TotalTimeSeconds>${totalTimeInSeconds}</TotalTimeSeconds>\n`;
    activity += `        <DistanceMeters>${distanceInMeters}</DistanceMeters>\n`;
    activity += `        <Intensity>Active</Intensity>\n`;
    activity += `        <TriggerMethod>Manual</TriggerMethod>\n`;
    activity += `        <Track>\n`;
    activity += buildTrackPoints(samples, kmhToMs);
    activity += `        </Track>\n`;
    activity += `      </Lap>\n`;
    activity += `    </Activity>\n`;

    return activity;
}

function buildTrackPoints(samples, kmhToMs) {
    let trackPoints = "";

    for (const sample of samples) {
        if (sample?.epochMs == null) continue;

        trackPoints += buildTrackPoint(sample, kmhToMs);
    }

    return trackPoints;
}

function buildTrackPoint(sample, kmhToMs) {
    const timeISO = new Date(sample.epochMs).toISOString();
    const distanceMeters = (sample.distance || 0).toFixed(1);
    const watts = Math.round(sample.power || 0);
    const speedMetersPerSecond = kmhToMs(sample.speed).toFixed(3);

    let trackPoint = `          <Trackpoint>\n`;
    trackPoint += `            <Time>${timeISO}</Time>\n`;
    trackPoint += `            <Position>\n`;
    trackPoint += `              <LatitudeDegrees>0</LatitudeDegrees>\n`;
    trackPoint += `              <LongitudeDegrees>0</LongitudeDegrees>\n`;
    trackPoint += `            </Position>\n`;
    trackPoint += `            <DistanceMeters>${distanceMeters}</DistanceMeters>\n`;
    trackPoint += `            <Extensions>\n`;
    trackPoint += `              <ns3:TPX xmlns:ns3="http://www.garmin.com/xmlschemas/ActivityExtension/v2">\n`;
    trackPoint += `                <ns3:Watts>${watts}</ns3:Watts>\n`;
    trackPoint += `                <ns3:Speed>${speedMetersPerSecond}</ns3:Speed>\n`;
    trackPoint += `              </ns3:TPX>\n`;
    trackPoint += `            </Extensions>\n`;
    trackPoint += `          </Trackpoint>\n`;

    return trackPoint;
}

function xmlTCXFooter() {
    let footer = `  </Activities>\n`;
    footer += `</TrainingCenterDatabase>`;

    return footer;
}

export function tcxToBlob(tcxString) {
    return new Blob([tcxString], {
        type: "application/vnd.garmin.tcx+xml",
    });
}