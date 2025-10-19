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

        //GLB Bike
        this.bikeModel = null;
        this.frontWheel = null;
        this.rearWheel = null;
        this.bikeFrontFrame = null;
        this.bikeFrame = null;
        this.bikeGrips = null;
        this.bikeSeat = null;
        this.bikePedals = null;
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