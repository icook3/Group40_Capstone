export class Constants {
    constructor() {

    }
    // Conversion constants and helpers (DRY)
    KMH_TO_MS = 1000 / 3600;
    MS_TO_KMH = 3600 / 1000;
    kmhToMs(kmh) {
        return kmh * this.KMH_TO_MS;
    }
    msToKmh(ms) {
        return ms * this.MS_TO_KMH;
    }

    cda = 0.38; // drag area (m^2) - slightly higher for realism
    crr = 0.006; // rolling resistance coefficient - slightly higher for realism
    airDensity = 1.225; // kg/m^3
    g = 9.8067; // gravity

    // technically not constants, but close enough
    // should still be refactored out of main.js

    // mass should probabally go in avatar.js, when everything is fully merged
    mass = 70; // total mass (kg)
    slope = 0; // road grade (decimal)
    lastTime = Date.now();
    historyStartTime = Date.now();
    keyboardMode = false;
    keyboardSpeed = this.kmhToMs(100);
    keyboardHalfSpeed = this.kmhToMs(50);
    riderState = { power: 0, speed: 0 };
    rideHistory = [];
    lastHistorySecond = null;
    pacerStarted = false;
    wKeyDown = false;
    sKeyDown = false;
}
export const constants = new Constants();