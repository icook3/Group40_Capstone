// Conversion constants and helpers (DRY)
export const KMH_TO_MS = 1000 / 3600;
export const MS_TO_KMH = 3600 / 1000;
export function kmhToMs(kmh) { return kmh * KMH_TO_MS; }
export function msToKmh(ms) { return ms * MS_TO_KMH; }

export const cda = 0.38; // drag area (m^2) - slightly higher for realism
export const crr = 0.006; // rolling resistance coefficient - slightly higher for realism
export const airDensity = 1.225; // kg/m^3
export const g = 9.8067; // gravity

