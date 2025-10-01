/**
 * Constants class is a singleton that stores various important constants
 * It also currently stores other variables - this is something to change later
 */
class Constants {
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
    // keyboard mode values - should go in own class for keyboard mode
    keyboardMode = false;
    keyboardSpeed = this.kmhToMs(100);
    keyboardHalfSpeed = this.kmhToMs(50);
    wKeyDown = false;
    sKeyDown = false;

    riderState = { power: 0, speed: 0 };
    rideHistory = [];
    lastHistorySecond = null;
    pacerStarted = false;
    dragCoefficient = 1.0;
    bikeWheelRadius = 0.220;
    bikeWheelThickness = 0.04;
    //This is assuming the cross-sectional area is a rectangle matching the wheel
    bikeCrossSectionalArea = this.bikeWheelRadius * 2 * this.bikeWheelThickness; //(I am going to assume in m^2. I don't know what units they used for the current implementation)
    airDensity = 1.225; // kg/m^3
    airTemperature = 303; //in Kelvin
    airViscosity = ((1.458 * Math.pow(10, -6) * Math.pow(this.airTemperature, 3 / 2)) / (this.airTemperature + 110.4)) / this.airDensity; //m^2/s
    windResistance(velocity) { //m/s
        return 0.5 * this.airDensity * this.dragCoefficient * velocity * velocity * this.bikeCrossSectionalArea * dragCoefficient;
    };

    coefficientOfFriction = 0.6; //https://www.engineeringtoolbox.com/friction-coefficients-d_778.html Rubber on Dry Asphalt
    normalForce = this.mass * this.g;
    frictionForce = this.coefficientOfFriction * this.normalForce;
}
export const constants = new Constants();