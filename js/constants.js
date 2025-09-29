// Conversion constants and helpers (DRY)
export const KMH_TO_MS = 1000 / 3600;
export const MS_TO_KMH = 3600 / 1000;
export function kmhToMs(kmh) { return kmh * KMH_TO_MS; }
export function msToKmh(ms) { return ms * MS_TO_KMH; }

export const cda = 0.38; // drag area (m^2) - slightly higher for realism
export const crr = 0.006; // rolling resistance coefficient - slightly higher for realism
export const airDensity = 1.225; // kg/m^3
export const g = 9.8067; // gravity

// technically not constants, but close enough
// should still be refactored out of main.js
export let mass = 70; // total mass (kg)
export let slope = 0; // road grade (decimal)
export let lastTime = Date.now();
export let historyStartTime = Date.now();
export let keyboardMode = false;
export let keyboardSpeed = kmhToMs(100);
export let keyboardHalfSpeed = kmhToMs(50);
export let riderState = { power: 0, speed: 0 };
export let rideHistory = [];
export let lastHistorySecond = null;
export let pacerStarted = false;
