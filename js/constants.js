class Constants {
    mass = 70;
    g = 9.8067; // gravity

    bikeWheelRadius = 0.220;
    bikeWheelThickness = 0.04;
    //This is assuming the cross-sectional area is a rectangle matching the wheel
    bikeCrossSectionalArea = this.bikeWheelRadius * 2 * this.bikeWheelThickness; //(I am going to assume in m^2. I don't know what units they used for the current implementation)
    airDensity = 1.225; // kg/m^3
    airTemperature = 303; //in Kelvin
    airViscosity = ((1.458 * Math.pow(10, -6) * Math.pow(this.airTemperature, 3 / 2)) / (this.airTemperature + 110.4)) / this.airDensity; //m^2/s
    windResistance(velocity) { //m/s
        let equivalentDiameter = 1.3 * (Math.pow(this.bikeWheelRadius * 2 * this.bikeWheelThickness, 0.625)) / (Math.pow(this.bikeWheelRadius * 2 + this.bikeWheelThickness, 0.25));
        //let reynoldsNumber = (equivalentDiameter * velocity) / this.airViscosity;
        let shearStress = this.airViscosity / this.bikeCrossSectionalArea;
        let dragCoefficient = (shearStress) / (this.airDensity * velocity * velocity);
        return 0.5 * this.airDensity * velocity * velocity * this.bikeCrossSectionalArea * dragCoefficient;
    };

    coefficientOfFriction = 0.6; //https://www.engineeringtoolbox.com/friction-coefficients-d_778.html Rubber on Dry Asphalt
    normalForce = mass * g;
    frictionForce = this.coefficientOfFriction * normalForce;
}
export const constants = new Constants();