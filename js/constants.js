class Constants {
    bikeWheelRadius = 0.220;
    bikeWheelThickness = 0.04;
    //This is assuming the cross-sectional area is a rectangle matching the wheel
    bikeCrossSectionalArea = this.bikeWheelRadius * 2 * this.bikeWheelThickness; //(I am going to assume in m^2. I don't know what units they used for the current implementation)
    airDensity = 1.225; // kg/m^3
    airTemperature = 303; //in Kelvin
    airViscosity = ((1.458 * 10 ^ -6 * this.airTemperature ^ (3 / 2)) / (this.airTemperature + 110.4)) / this.airDensity; //m^2/s
    windResistance(velocity) { //m/s
        let equivalentDiameter = 1.3 * ((this.bikeWheelRadius * 2 * this.bikeWheelThickness) ^ 0.625) / ((this.bikeWheelRadius * 2 + this.bikeWheelThickness) ^ 0.25);
        let reynoldsNumber = (equivalentDiameter * velocity) / this.airViscosity;
        let dragCoefficient = reynoldsNumber
        return 0.5 * this.airDensity * velocity * velocity * this.bikeCrossSectionalArea * dragCoefficient;
    };
}
export const constants = new Constants();