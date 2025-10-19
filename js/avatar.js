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
        this.personBody = null;
        //Spine
        this.spine = null;
        this.spine1 = null;
        this.spine2 = null;
        this.spine3 = null;
        this.spine4 = null;
        this.spine5 = null;
        this.spine6 = null;
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

        const personModel = document.createElement('a-entity');
        personModel.setAttribute('gltf-model', '#maleGLB');
        personModel.setAttribute('position', '0 0 0');
        personModel.setAttribute('rotation', '0 -90 0');
        personModel.setAttribute('scale', '0.5 0.5 0.5');
        avatar.appendChild(personModel);

        //Assign person and person bones
        this.personModel = personModel;
        personModel.addEventListener('model-loaded', (e) => {
            const model = e.detail.model;
            this.personBody = model.getObjectByName("Body")

            //Assign Bones
            model.traverse((child) => {
                if (child.isSkinnedMesh && child.skeleton) {
                    const personSkeleton = child.skeleton;
                    //Spine
                    this.spine = personSkeleton.getBoneByName("spine");
                    this.spine1 = personSkeleton.getBoneByName("spine.001");
                    this.spine2 = personSkeleton.getBoneByName("spine.002");
                    this.spine3 = personSkeleton.getBoneByName("spine.003");
                    this.spine4 = personSkeleton.getBoneByName("spine.004");
                    this.spine5 = personSkeleton.getBoneByName("spine.005");
                    this.spine6 = personSkeleton.getBoneByName("spine.006");
                    //Left Side
                    this.leftBreast = personSkeleton.getBoneByName("breast.L");
                    this.leftShoulder = personSkeleton.getBoneByName("shoulder.L");
                    this.leftUpperArm = personSkeleton.getBoneByName("upper_arm.L");
                    this.leftForearm = personSkeleton.getBoneByName("forearm.L");
                    this.leftHand = personSkeleton.getBoneByName("hand.L");
                    this.leftPelvis = personSkeleton.getBoneByName("pelvis.L");
                    this.leftThigh = personSkeleton.getBoneByName("thigh.L");
                    this.leftShin = personSkeleton.getBoneByName("shin.L");
                    this.leftFoot = personSkeleton.getBoneByName("foot.L");
                    this.leftToe = personSkeleton.getBoneByName("toe.L");
                    this.leftHeel = personSkeleton.getBoneByName("heel.02.L");
                    //Right Side
                    this.rightBreast = personSkeleton.getBoneByName("breast.R");
                    this.rightShoulder = personSkeleton.getBoneByName("shoulder.R");
                    this.rightUpperArm = personSkeleton.getBoneByName("upper_arm.R");
                    this.rightForearm = personSkeleton.getBoneByName("forearm.R");
                    this.rightHand = personSkeleton.getBoneByName("hand.R");
                    this.rightPelvis = personSkeleton.getBoneByName("pelvis.R");
                    this.rightThigh = personSkeleton.getBoneByName("thigh.R");
                    this.rightShin = personSkeleton.getBoneByName("shin.R");
                    this.rightFoot = personSkeleton.getBoneByName("foot.R");
                    this.rightToe = personSkeleton.getBoneByName("toe.R");
                    this.rightHeel = personSkeleton.getBoneByName("heel.02.R");
                }
            })
        });

        const bikeModel = document.createElement('a-entity');
        bikeModel.setAttribute('gltf-model', '#bikeGLB');
        bikeModel.setAttribute('position', '0 0 0');
        bikeModel.setAttribute('rotation', '0 -90 0');
        bikeModel.setAttribute('scale', '0.5 0.5 0.5');
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
}