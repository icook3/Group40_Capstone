const FIFTEEN_MINUTES = 15 * 60 * 1000;
const FIFTEEN_MINUTES_LIMIT = 200;
const ONE_DAY = 24 * 60 * 60 * 1000;
const ONE_DAY_LIMIT = 2000;

let fifteenMinutes = [];
let daily = [];

function prune() {
    const now = Date.now();
    fifteenMinutes = fifteenMinutes.filter(time => now - time < FIFTEEN_MINUTES);
    daily = daily.filter(time => now - time < ONE_DAY)
}

export function canMakeCall() {
    prune();
    return fifteenMinutes.length < FIFTEEN_MINUTES_LIMIT && daily.length < ONE_DAY_LIMIT;
}

export function recordCall() {
    const now = Date.now();
    fifteenMinutes.push(now);
    daily.push(now);
}

export function getStatus() {
    prune();
    return {
        fifteenMinutes: fifteenMinutes.length,
        daily: daily.length,
        limits: {
            fifteenMinutes: FIFTEEN_MINUTES_LIMIT,
            daily: ONE_DAY_LIMIT
        }
    }
}