import {powerToSpeed} from "./main.js";
import { AvatarCreator } from "./avatarCreator.js";
import { constants } from "./constants.js";
import { units } from "./units/index.js";
export class AvatarMovement {
    constructor(id, options = {}) {
        this.creator = new AvatarCreator(id, options.position);
        this.avatarEntity = this.creator.avatarEntity;
        this.speed = 0;
        this.power = 0;
        this.isPacer = options.isPacer || false;
    }

    //Helper to interpolate smoothly between A and B
    cycleInterpolate (a, b, phase) {
        return a + (1 - Math.cos(phase)) * 0.5 * (b - a);
    }

    animatePedalingPerson (dt) {
        const pi = Math.PI;

        // se the crank rotation as the driving phase
        const crankAngle = this.creator.pedalCrankBone.rotation.x;

        //Base pose angles from setInitialPose()
        const baseRightThighX = 3 * pi / 4;
        const baseLeftThighX = pi / 2;
        const baseRightShinX = pi / 4;
        const baseLeftShinX = 12 * pi / 20;
        const baseRightFootX = -pi / 8;
        const baseLeftFootX = -pi / 6;

        const thighForwardSwing = 0.1;
        const shinForwardSwing = 0.3;
        const footForwardSwing = 0.25;

        //Right leg transitions between its own base and the left leg’s base
        this.creator.rightThigh.rotation.x = this.cycleInterpolate(baseRightThighX, baseLeftThighX, crankAngle)
            + Math.sin(crankAngle + Math.PI) * thighForwardSwing;
        this.creator.rightShin.rotation.z = this.cycleInterpolate(-10 * pi / 200, pi / 180, crankAngle);
        this.creator.rightShin.rotation.x  = this.cycleInterpolate(baseRightShinX,  baseLeftShinX,  crankAngle)
            + Math.sin(crankAngle + Math.PI) * shinForwardSwing;
        this.creator.rightFoot.rotation.x  = this.cycleInterpolate(baseRightFootX,  baseLeftFootX,  crankAngle)
            + Math.sin(crankAngle + Math.PI) * footForwardSwing;

        //Left leg transitions in opposite phase
        this.creator.leftThigh.rotation.x = this.cycleInterpolate(baseLeftThighX, baseRightThighX, crankAngle)
            + Math.sin(crankAngle) * thighForwardSwing;
        this.creator.leftShin.rotation.z = this.cycleInterpolate(pi / 200, 12 * pi / 200, crankAngle);
        this.creator.leftShin.rotation.x  = this.cycleInterpolate(baseLeftShinX,  baseRightShinX,  crankAngle)
            + Math.sin(crankAngle) * shinForwardSwing;
        this.creator.leftFoot.rotation.x  = this.cycleInterpolate(baseLeftFootX,  baseRightFootX,  crankAngle)
            + Math.sin(crankAngle) * footForwardSwing;
    }



    animatePedalingBike(dt) {
        //variables for frequency 1.5 Hz at 30 km/h, scale with speed
        const baseSpeed = 30; //km/h
        const baseFreqHz = 1.5; //Hz at 30 km/h
        const angularSpeedAdjuster = baseFreqHz * 2 * Math.PI;

        //Rotate wheels if loaded
        if (this.creator.rearWheel && this.creator.frontWheel) {
            const angularSpeed = ((this.speed * angularSpeedAdjuster / baseSpeed * 1000 / 3600)) / 0.37
            const wheelRotationAmount = angularSpeed * dt;
            this.creator.rearWheel.rotation.x -= wheelRotationAmount;
            this.creator.frontWheel.rotation.x -= wheelRotationAmount;
        }

        //Rotate crank and pedals
        if (this.creator.leftPedalBone && this.creator.rightPedalBone && this.creator.pedalCrankBone) {
            if (this.creator.id === "pacer") {
                //Rotate crank
                const pacerCrankAngularSpeed = ((this.speed * angularSpeedAdjuster / baseSpeed * 1000 / 3600)) / 0.16;
                const pacerCrankRotationAmount = pacerCrankAngularSpeed * dt;
                this.creator.pedalCrankBone.rotation.x -= pacerCrankRotationAmount;

                //Rotate pedals
                this.creator.leftPedalBone.rotation.y = this.creator.pedalCrankBone.rotation.x;
                this.creator.rightPedalBone.rotation.y = -this.creator.pedalCrankBone.rotation.x;
            } else {
                //Rotate crank
                const speedKmh = powerToSpeed({power: this.power});
                const crankAngularSpeed = ((speedKmh * angularSpeedAdjuster / baseSpeed * 1000 / 3600)) / 0.16;
                const crankRotationAmount = crankAngularSpeed * dt;
                this.creator.pedalCrankBone.rotation.x -= crankRotationAmount;

                //Rotate pedals
                this.creator.leftPedalBone.rotation.y = this.creator.pedalCrankBone.rotation.x;
                this.creator.rightPedalBone.rotation.y = -this.creator.pedalCrankBone.rotation.x;
            }
        }
    }

    //Setter for avatar speed
    setSpeed(speed) {
        if (this.isPacer) {
            this.speed = units.speedUnit.convertFrom(speed);
        } else {
            this.speed = speed;
        }
    }

    //Setter for avatar power
    setPower(power) {
        this.power = power;
    }

    update(dt) {
        if (this.speed === 0) {
            return;
        }
        this.animatePedalingBike(dt);
        this.animatePedalingPerson(dt)
    }

    setPosition(pos) {
        this.avatarEntity.setAttribute('position', `${pos.x} ${pos.y} ${pos.z}`);
    }
    setHorizontalPosition(pos) {
        let val = this.avatarEntity.getAttribute('position');
        if (typeof val === 'string') val = AFRAME.utils.coordinates.parse(val);
        this.avatarEntity.setAttribute('position', `${pos.x} ${val.y} ${pos.z}`);
    }

    setRotation(rot) {
        this.avatarEntity.setAttribute('rotation',`${rot.x} ${rot.y} ${rot.z}`);
    }
}