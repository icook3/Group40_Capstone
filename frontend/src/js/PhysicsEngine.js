import { constants } from "./constants.js";

export class PhysicsEngine {
    constructor() {
        this.speed = 0; // kph
    }

    update(power, dt) {
        if (power > 0) {
            this.speed = calculateAccelerationSpeed(this.speed, power, dt);
        } else {
            this.speed = calculateCoastingSpeed(this.speed, dt)
        }

        return this.speed;
    }

    setSpeed(speed) {
        this.speed = speed;
    }

    getSpeed() {
        return this.speed;
    }
}

// Calculates acceleration to make speed increases gradual and more realistic
function calculateAccelerationSpeed(currentSpeed, currentPower, dt) {
    // convert km to m (for standard physics equations)
    const v_ms = constants.kmhToMs(currentSpeed);

    // this prevents division by zero
    const v_for_calc = Math.max(v_ms, 1);

    // Calculates driving force from power: F = P / v; avoids rocket speed from standstill
    const drivingForce = Math.min(currentPower / v_for_calc, 120);

    // calculates forces against cyclist
    const airDragForce = constants.windResistance(v_ms);
    const rollingResistanceForce = constants.crr * constants.mass * constants.g;

    // total force = forward force - resistance forces
    const netForce = drivingForce - airDragForce - rollingResistanceForce;

    // calculates acceleration using F = ma aka a = F/m
    const acceleration = netForce / constants.mass;

    // apply acceleration/delta time
    const v_new_ms = v_ms + acceleration * dt;

    // avoid going backwards (negative speed)
    const finalSpeed_ms = Math.max(0, v_new_ms);

    return constants.msToKmh(finalSpeed_ms);
}

// Applies realistic coasting when power becomes zero
// Returns new calculated speed after dt seconds of coasting
function calculateCoastingSpeed(currentSpeed, dt) {
    // Use meters for calculations
    const v_ms = constants.kmhToMs(currentSpeed);

    // If bycicle has stopped, speed stays at zero
    if (v_ms <= 0) return 0;

    // Calculate air drag from windResistance function
    const airDragForce = constants.windResistance(v_ms);

    // Calculate rolling resistance force
    const rollingResistanceForce = constants.crr * constants.mass * constants.g;

    // Calculate total resistance force
    const totalForce =
        (airDragForce + rollingResistanceForce);

    // Calculate deceleration using acceleration = force / mass
    const deceleration = totalForce / constants.mass;

    // Apply deceleration as a function of time: new speed = current speed - (deceleration * delta time)
    const v_new_ms = v_ms - deceleration * dt;

    // Prevent the new speed from going negative (reverse)
    const finalSpeed_ms = Math.max(0, v_new_ms);

    // Convert speed to km/s
    return constants.msToKmh(finalSpeed_ms);
}