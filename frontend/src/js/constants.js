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

  cda = 0.45; // drag area (m^2) - slightly higher for realism
  crr = 0.004; // rolling resistance coefficient - slightly higher for realism
  airDensity = 1.225; // kg/m^3
  g = 9.8067; // gravity
  coastingFactor = 2.2; //for more realistic coasting

  // technically not constants, but close enough
  // should still be refactored out of main.js

  // mass should probabally go in avatar.js, when everything is fully merged
  riderMass = 58; // rider mass (kg)
  bikeMass = 7; // bike mass (kg)
  get mass() {
    return this.riderMass + this.bikeMass;
  }
  slope = 0; // road grade (decimal)
  lastTime = Date.now();
  historyStartTime = Date.now();
  // keyboard mode values - should go in own class for keyboard mode
  keyboardMode = false;
  keyboardSpeed = this.kmhToMs(100);
  keyboardHalfSpeed = this.kmhToMs(50);
  wKeyDown = false;
  sKeyDown = false;
  qKeyDown = false;
  aKeyDown = false;

  rideHistory = [];
  lastHistorySecond = null;
  pacerStarted = false;
  dragCoefficient = 1.0;
  bikeWheelRadius = 0.22;
  bikeWheelThickness = 0.04;
  //This is assuming the cross-sectional area is a rectangle matching the wheel
  bikeCrossSectionalArea = this.bikeWheelRadius * 2 * this.bikeWheelThickness; //(I am going to assume in m^2. I don't know what units they used for the current implementation)
  airTemperature = 303; //in Kelvin
  airViscosity =
    (1.458 * Math.pow(10, -6) * Math.pow(this.airTemperature, 3 / 2)) /
    (this.airTemperature + 110.4) /
    this.airDensity; //m^2/s

  windResistance(velocity) {
    //m/s
    return (
      0.5 *
      this.airDensity *
      this.dragCoefficient *
      velocity *
      velocity *
      this.cda
    );
  }

  coefficientOfFriction = 0.6; //https://www.engineeringtoolbox.com/friction-coefficients-d_778.html Rubber on Dry Asphalt
  normalForce = this.mass * this.g;
  frictionForce = this.coefficientOfFriction * this.normalForce;

  // Constants governing terrain generation
  worldZ = 0;
  trackLastUpdate = 0;

  tileSize = 10;
  // Colors can be refactored out once grid is fully abandoned
  groundColor1 = "#5a7d3a";
  groundColor2 = "#7c5a3a";
  gridWidth = 12; // 12 tiles wide (120 units)
  gridDepth = 80; // 80 tiles deep (800 units)
  height = 1;
  roughness = 0.97;
  metalness = 0.01;
  startX = -((this.gridWidth * this.tileSize) / 2) + this.tileSize / 2;
  startZ = 40; // Start well in front of the camera

  // Constants governing path generation
  pathWidth = 8;
  pathHeight = 1.02;
  pathDepth = 60;
  pathPositionX = 0;
  pathPositionY = 0;
  pathPositionZ = 0;
  dirtColor = "#a0895a";

  // Constants governing circular motion
  curveRadius = 35;

  // Constants governing cloud speed
  lastCloud = Date.now();
  cloudSpeed = 0;
  updateEvery = 0;
  totalCloudTypes = 3;


  // Constants to locate the peerServer
  // If you change the backend environment variables, change this
  // Also change this before hosting it publicly
  peerHost = "127.0.0.1";
  peerPath = "/peerServer";
  peerPort = "9000";
}

export const constants = new Constants();
