import {powerToSpeed} from "./main.js";

export class Avatar {
    constructor(id, color = '#0af', position = {x:1, y:1, z:0}, rotation = {x:0, y:90, z:0}, isPacer = false) {
        this.id = id;
        this.color = color;
        this.position = position;
        this.rotation = rotation;
        this.speed = 0;
        this.power = 0;
        this.avatarEntity = this.createEntity();

        //GLB Model
        this.personModel = null;
        this.personRig = null;
        //Spine
        this.spine = null; //low back
        this.spine1 = null; //Mid-low back
        this.spine2 = null; //Mid back
        this.spine3 = null; //Upper Back
        this.spine4 = null; //Lower Neck
        this.spine5 = null; //Upper Neck
        this.spine6 = null; //Head
        //Left Side
        this.leftBreast = null;
        this.leftShoulder = null;
        this.leftUpperArm = null;
        this.leftForearm = null;
        this.leftHand = null;
        this.leftPelvis = null;
        this.leftThigh = null;
        this.leftShin = null;
        this.leftFoot = null;
        this.leftToe = null;
        this.leftHeel = null;
        //Right Side
        this.rightBreast = null;
        this.rightShoulder = null;
        this.rightUpperArm = null;
        this.rightForearm = null;
        this.rightHand = null;
        this.rightPelvis = null;
        this.rightThigh = null;
        this.rightShin = null;
        this.rightFoot = null;
        this.rightToe = null;
        this.rightHeel = null;

        //GLB Bike
        this.bikeModel = null;
        this.frontWheel = null;
        this.rearWheel = null;
        this.bikeFrontFrame = null;
        this.bikeFrame = null;
        this.bikeGrips = null;
        this.bikeSeat = null;
        this.bikePedals = null;
        this.leftPedalBone = null;
        this.rightPedalBone = null;
        this.pedalCrankBone = null;
    }

    //Creates avatar entity
    createEntity() {
        const avatar = document.createElement('a-entity');
        avatar.setAttribute('id', this.id);
        avatar.setAttribute('position', `${this.position.x} ${this.position.y} ${this.position.z}`);
        avatar.setAttribute('rotation', `${this.rotation.x} ${this.rotation.y} ${this.rotation.z}`);

        //Create Person
        const personModel = document.createElement('a-entity');
        personModel.setAttribute('gltf-model', '#maleGLB');
        personModel.setAttribute('position', '0 0 0');
        personModel.setAttribute('rotation', '0 -90 0');
        personModel.setAttribute('scale', '0.35 0.35 0.35');
        avatar.appendChild(personModel);

        //Assign person and person bones
        this.personModel = personModel;
        personModel.addEventListener('model-loaded', (e) => {
            const model = e.detail.model;
            this.personRig = model.getObjectByName("metalrig")

            //Assign Bones
            model.traverse((child) => {
                if (child.isSkinnedMesh && child.skeleton) {
                    const personSkeleton = child.skeleton;
                    //Spine
                    this.spine = personSkeleton.getBoneByName("spine");
                    this.spine1 = personSkeleton.getBoneByName("spine001");
                    this.spine2 = personSkeleton.getBoneByName("spine002");
                    this.spine3 = personSkeleton.getBoneByName("spine003");
                    this.spine4 = personSkeleton.getBoneByName("spine004");
                    this.spine5 = personSkeleton.getBoneByName("spine005");
                    this.spine6 = personSkeleton.getBoneByName("spine006");
                    //Left Side
                    this.leftBreast = personSkeleton.getBoneByName("breastL");
                    this.leftShoulder = personSkeleton.getBoneByName("shoulderL");
                    this.leftUpperArm = personSkeleton.getBoneByName("upper_armL");
                    this.leftForearm = personSkeleton.getBoneByName("forearmL");
                    this.leftHand = personSkeleton.getBoneByName("handL");
                    this.leftPelvis = personSkeleton.getBoneByName("pelvisL");
                    this.leftThigh = personSkeleton.getBoneByName("thighL");
                    this.leftShin = personSkeleton.getBoneByName("shinL");
                    this.leftFoot = personSkeleton.getBoneByName("footL");
                    this.leftToe = personSkeleton.getBoneByName("toeL");
                    this.leftHeel = personSkeleton.getBoneByName("heel02L");
                    //Right Side
                    this.rightBreast = personSkeleton.getBoneByName("breastR");
                    this.rightShoulder = personSkeleton.getBoneByName("shoulderR");
                    this.rightUpperArm = personSkeleton.getBoneByName("upper_armR");
                    this.rightForearm = personSkeleton.getBoneByName("forearmR");
                    this.rightHand = personSkeleton.getBoneByName("handR");
                    this.rightPelvis = personSkeleton.getBoneByName("pelvisR");
                    this.rightThigh = personSkeleton.getBoneByName("thighR");
                    this.rightShin = personSkeleton.getBoneByName("shinR");
                    this.rightFoot = personSkeleton.getBoneByName("footR");
                    this.rightToe = personSkeleton.getBoneByName("toeR");
                    this.rightHeel = personSkeleton.getBoneByName("heel02R");

                    this.setInitialPose();
                }
            });
        });

        //Create bike
        const bikeModel = document.createElement('a-entity');
        bikeModel.setAttribute('gltf-model', '#bikeGLB');
        bikeModel.setAttribute('position', '0 0 0');
        bikeModel.setAttribute('rotation', '0 -90 0');
        bikeModel.setAttribute('scale', '0.35 0.35 0.35');
        avatar.appendChild(bikeModel);

        //Assign bike and assign bike parts
        this.bikeModel = bikeModel;
        bikeModel.addEventListener('model-loaded', (e) => {
            const model = e.detail.model; //Three.js root of GLB
            this.rearWheel = model.getObjectByName("RearTire");
            this.frontWheel = model.getObjectByName("FrontTire");
            this.bikeFrontFrame = model.getObjectByName("FrontFrame");
            this.bikeFrame = model.getObjectByName("Frame");
            this.bikeGrips = model.getObjectByName("Grips");
            this.bikeSeat = model.getObjectByName("Seat")
            this.bikePedals = model.getObjectByName("Pedals")

            //Assign bike bones
            model.traverse((child) => {
                if (child.isSkinnedMesh && child.skeleton) {
                    const bikeSkeleton = child.skeleton;
                    this.leftPedalBone = bikeSkeleton.getBoneByName("b_leftPedal");
                    this.rightPedalBone = bikeSkeleton.getBoneByName("b_rightPedal");
                    this.pedalCrankBone = bikeSkeleton.getBoneByName("b_pedalcrank");
                }
            });
        });


        document.querySelector('a-scene').appendChild(avatar);
        return avatar;
    }

    setInitialPose () {
        const pi = Math.PI;

        //Spine
        this.spine1.rotation.x = pi / 20;
        this.spine2.rotation.x = 11 * pi / 90;
        this.spine3.rotation.x = pi / 20;
        this.spine4.rotation.x = -2 * pi / 15;
        this.spine5.rotation.x = pi / 60;
        this.spine6.rotation.x = -pi / 12;

        //Arms
        this.rightShoulder.rotation.y = pi / 8;
        this.rightUpperArm.rotation.x = pi / 3;
        this.rightUpperArm.rotation.y = -pi / 4;
        this.rightUpperArm.rotation.z = pi / 2;
        this.rightForearm.rotation.x = 2.1 * pi / 5;
        this.rightForearm.rotation.z = -pi / 20;
        this.rightHand.rotation.x = pi / 10;
        this.rightHand.rotation.y = -pi / 15;

        this.leftShoulder.rotation.y = -pi / 8;
        this.leftUpperArm.rotation.x = pi / 3;
        this.leftUpperArm.rotation.y = pi / 4;
        this.leftUpperArm.rotation.z = -pi / 2;
        this.leftForearm.rotation.x = 2.1 * pi / 5;
        this.leftForearm.rotation.z = pi / 20;
        this.leftHand.rotation.x = pi / 10;
        this.leftHand.rotation.y = pi / 15;

        //Legs
        this.rightThigh.rotation.z = pi / 15;
        this.rightThigh.rotation.x = 3 * pi / 4;
        this.rightShin.rotation.x = pi / 4;
        this.rightShin.rotation.z = -pi / 20;
        this.rightFoot.rotation.x = -pi / 8;

        //Legs
        this.leftThigh.rotation.z = -pi / 15;
        this.leftThigh.rotation.x =  pi / 2;
        this.leftShin.rotation.x = 13 * pi / 20;
        this.leftShin.rotation.z = -pi / 90;
        this.leftFoot.rotation.x = -pi / 6;
    }

    //Helper to interpolate smoothly between A and B
    cycleInterpolate (a, b, phase) {
        return a + (1 - Math.cos(phase)) * 0.5 * (b - a);
    }

    animatePedalingPerson (dt) {
        const pi = Math.PI;

        // se the crank rotation as the driving phase
        const crankAngle = this.pedalCrankBone.rotation.x;

        //Base pose angles from setInitialPose()
        const baseRightThighX = 3 * pi / 4;
        const baseLeftThighX = pi / 2;
        const baseRightShinX = pi / 4;
        const baseLeftShinX = 13 * pi / 20;
        const baseRightFootX = -pi / 8;
        const baseLeftFootX = -pi / 6;

        const thighForwardSwing = 0.1;
        const shinForwardSwing = 0.3;
        const footForwardSwing = 0.25;

        //Right leg transitions between its own base and the left leg’s base
        this.rightThigh.rotation.x = this.cycleInterpolate(baseRightThighX, baseLeftThighX, crankAngle)
            + Math.sin(crankAngle + Math.PI) * thighForwardSwing;
        this.rightShin.rotation.z = this.cycleInterpolate(-10 * pi / 200, pi / 180, crankAngle);
        this.rightShin.rotation.x  = this.cycleInterpolate(baseRightShinX,  baseLeftShinX,  crankAngle)
            + Math.sin(crankAngle + Math.PI) * shinForwardSwing;
        this.rightFoot.rotation.x  = this.cycleInterpolate(baseRightFootX,  baseLeftFootX,  crankAngle)
            + Math.sin(crankAngle + Math.PI) * footForwardSwing;

        //Left leg transitions in opposite phase
        this.leftThigh.rotation.x = this.cycleInterpolate(baseLeftThighX, baseRightThighX, crankAngle)
            + Math.sin(crankAngle) * thighForwardSwing;
        this.leftShin.rotation.z = this.cycleInterpolate(pi / 200, 12 * pi / 200, crankAngle);
        this.leftShin.rotation.x  = this.cycleInterpolate(baseLeftShinX,  baseRightShinX,  crankAngle)
            + Math.sin(crankAngle) * shinForwardSwing;
        this.leftFoot.rotation.x  = this.cycleInterpolate(baseLeftFootX,  baseRightFootX,  crankAngle)
            + Math.sin(crankAngle) * footForwardSwing;
    }



    animatePedalingBike(dt) {
        //variables for frequency 1.5 Hz at 30 km/h, scale with speed
        const baseSpeed = 30; //km/h
        const baseFreqHz = 1.5; //Hz at 30 km/h
        const angularSpeedAdjuster = baseFreqHz * 2 * Math.PI;

        //Rotate wheels if loaded
        if (this.rearWheel && this.frontWheel) {
            const angularSpeed = ((this.speed * angularSpeedAdjuster / baseSpeed * 1000 / 3600)) / 0.37
            const wheelRotationAmount = angularSpeed * dt;
            this.rearWheel.rotation.x -= wheelRotationAmount;
            this.frontWheel.rotation.x -= wheelRotationAmount;
        }

        //Rotate crank and pedals
        if (this.leftPedalBone && this.rightPedalBone && this.pedalCrankBone) {
            if (this.id === "pacer") {
                //Rotate crank
                const pacerCrankAngularSpeed = ((this.speed * angularSpeedAdjuster / baseSpeed * 1000 / 3600)) / 0.16;
                const pacerCrankRotationAmount = pacerCrankAngularSpeed * dt;
                this.pedalCrankBone.rotation.x -= pacerCrankRotationAmount;

                //Rotate pedals
                this.leftPedalBone.rotation.y = this.pedalCrankBone.rotation.x;
                this.rightPedalBone.rotation.y = -this.pedalCrankBone.rotation.x;
            } else {
                //Rotate crank
                const speedKmh = powerToSpeed({power: this.power});
                const crankAngularSpeed = ((speedKmh * angularSpeedAdjuster / baseSpeed * 1000 / 3600)) / 0.16;
                const crankRotationAmount = crankAngularSpeed * dt;
                this.pedalCrankBone.rotation.x -= crankRotationAmount;

                //Rotate pedals
                this.leftPedalBone.rotation.y = this.pedalCrankBone.rotation.x;
                this.rightPedalBone.rotation.y = -this.pedalCrankBone.rotation.x;
            }
        }
    }

    //Setter for avatar speed
    setSpeed(speed) {
        this.speed = speed;
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
}