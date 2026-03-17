export class AvatarCreator {
    constructor(id, position = {x:1, y:1, z:0}, rotation = {x:0, y:90, z:0}, onReady = null) {
        this.id = id;
        this.position = position;
        this.rotation = rotation;
        this.onReady = onReady;
        this.autoRotate = false;
        this.rotationSpeed = 0.2;

        //GLB Flags
        this.personLoaded = false;
        this.bikeLoaded = false;
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

        //Player and bike colors
        this.playerModel = "male";
        this.skinColor = "#ff5500";
        this.shirtColor = "#ff0000";
        this.shortsColor = "#000000";
        this.shoesColor = "#000000";

        this.bikeFrameColor = "#ff5500";
        this.bikeTireColor = "#333333";
        this.bikeGripColor = "#000000";
        this.bikeSeatColor = "#222222";
        this.bikePedalColor = "#555555";
        this.bikeCrankColor = "#888888";

        //Helmet
        this.helmetModel = null;
        this.helmetColor = "#A7E800";
        this.helmetPaddingColor = "#333333";

        this.loadPlayerData();
        this.avatarEntity = this.createEntity();
    }

    //Creates avatar entity
    createEntity() {
        const avatar = document.createElement('a-entity');
        avatar.setAttribute('id', this.id);
        avatar.setAttribute('position', `${this.position.x} ${this.position.y} ${this.position.z}`);
        avatar.setAttribute('rotation', `${this.rotation.x} ${this.rotation.y} ${this.rotation.z}`);

        //Create Person
        this.createPlayerModel(avatar);
        this.createBikeModel(avatar);

        document.querySelector('a-scene').appendChild(avatar);
        return avatar;
    }

    createPlayerModel (avatarEntity) {
        const checkReady = () => {
            if (this.personLoaded && this.bikeLoaded) {
                if (this.onReady) this.onReady(this);
            }
        };

        const personModel = document.createElement('a-entity');
        personModel.setAttribute('gltf-model', `#${this.playerModel}GLB`);
        personModel.setAttribute('position', '0 0 0');
        personModel.setAttribute('rotation', '0 -90 0');
        personModel.setAttribute('scale', '0.35 0.35 0.35');
        personModel.setAttribute('no-cull', ''); // Fixes avatar partially disappearing
        avatarEntity.appendChild(personModel);

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

                    this.applyPlayerColors();
                    this.setInitialPose();
                    this.personLoaded = true;
                    checkReady();
                    this.createHelmetModel(avatarEntity);
                }
            });
        });
    }

    setPlayerModel(model) {
        this.playerModel = model;
        if (this.avatarEntity) {
            //Remove old model
            if (this.personModel) {
                this.avatarEntity.removeChild(this.personModel);
            }
            //Add new model
            this.createPlayerModel(this.avatarEntity);
        }
        this.savePlayerData();
    }

    setPlayerColors(skin, shirt, shorts, shoes) {
        this.skinColor = skin;
        this.shirtColor = shirt;
        this.shortsColor = shorts;
        this.shoesColor = shoes;

        this.applyPlayerColors();
        this.savePlayerData();
    }

    applyPlayerColors() {
        if (!this.personModel || !this.personModel.object3D) {
            return;
        }

        this.personModel.object3D.traverse((child) => {
            if (child.isMesh && child.material) {
                if (child.material.name.includes("Skin")) child.material.color.set(this.skinColor);
                if (child.material.name.includes("Shirt")) child.material.color.set(this.shirtColor);
                if (child.material.name.includes("Shorts")) child.material.color.set(this.shortsColor);
                if (child.material.name.includes("Shoes")) child.material.color.set(this.shoesColor);
            }
        });
    }

    createBikeModel(avatarEntity) {
        const checkReady = () => {
            if (this.personLoaded && this.bikeLoaded) {
                if (this.onReady) this.onReady(this);
            }
        };

        const bikeModel = document.createElement('a-entity');
        bikeModel.setAttribute('gltf-model', '#bikeGLB');
        bikeModel.setAttribute('position', '0 0 0');
        bikeModel.setAttribute('rotation', '0 -90 0');
        bikeModel.setAttribute('scale', '0.35 0.35 0.35');
        avatarEntity.appendChild(bikeModel);

        //Assign bike and assign bike parts
        this.bikeModel = bikeModel;
        bikeModel.addEventListener('model-loaded', (e) => {
            const model = e.detail.model;
            this.rearWheel = model.getObjectByName("RearTire");
            this.frontWheel = model.getObjectByName("FrontTire");
            this.bikeFrontFrame = model.getObjectByName("FrontFrame");
            this.bikeFrame = model.getObjectByName("Frame");
            this.bikeGrips = model.getObjectByName("Grips");
            this.bikeSeat = model.getObjectByName("Seat")
            this.bikePedals = model.getObjectByName("Pedals")
            console.log("loading model");
            //Assign bike bones
            model.traverse((child) => {
                if (child.isSkinnedMesh && child.skeleton) {
                    const bikeSkeleton = child.skeleton;
                    this.leftPedalBone = bikeSkeleton.getBoneByName("b_leftPedal");
                    this.rightPedalBone = bikeSkeleton.getBoneByName("b_rightPedal");
                    this.pedalCrankBone = bikeSkeleton.getBoneByName("b_pedalcrank");

                    this.applyBikeColors();
                    this.bikeLoaded = true;
                    checkReady();
                }
            });
        });
    }

    //helmetModel.setAttribute('scale', '0.35 0.35 0.35');
    //helmetModel.setAttribute('position', '.38 -.18 0');

createHelmetModel(avatarEntity) {
    const helmetModel = document.createElement('a-entity');
    helmetModel.setAttribute('gltf-model', '#helmetGLB');
    helmetModel.setAttribute('no-cull', '');
    avatarEntity.appendChild(helmetModel);

    this.helmetModel = helmetModel;
    helmetModel.addEventListener('model-loaded', (e) => {
        if (this.spine6) {
            const loadedModel = e.detail.model;
            
            // Helmet should dynamically follow the head
            loadedModel.position.set(0, .2, -0.03);
            loadedModel.rotation.set(0, 135, 0);
            loadedModel.scale.set(.35, .35, .35);
            this.spine6.add(loadedModel);
            
            // Store reference for color changes
            this.helmetObject = loadedModel;
        }

        this.applyHelmetColors();
    });
}

setHelmetColors(helmet, padding) {
    this.helmetColor = helmet;
    this.helmetPaddingColor = padding;
    this.applyHelmetColors();
    this.savePlayerData();
}

applyHelmetColors() {
    if (!this.helmetObject) {
        return;
    }

    this.helmetObject.traverse((child) => {
        if (child.isMesh && child.material) {
            if (child.material.name.includes("Helmet")) {
                child.material.color.set(this.helmetColor);
            }
            if (child.material.name.includes("Padding")) {
                child.material.color.set(this.helmetPaddingColor);
            }
        }
    });
}

    setBikeColors(frame, tires, grip, seat, pedals, pedalCrank) {
        this.bikeFrameColor = frame;
        this.bikeTireColor = tires;
        this.bikeGripColor = grip;
        this.bikeSeatColor = seat;
        this.bikePedalColor = pedals;
        this.bikeCrankColor = pedalCrank;

        this.applyBikeColors();
        this.savePlayerData();
    }

    applyBikeColors () {
        if (!this.bikeModel || !this.bikeModel.object3D) {
            return;
        }

        this.bikeModel.object3D.traverse((child) => {
            if (child.isMesh && child.material) {
                if (child.material.name.includes("Frame_Mat")) child.material.color.set(this.bikeFrameColor);
                if (child.material.name.includes("Tire_Mat")) child.material.color.set(this.bikeTireColor);
                if (child.material.name.includes("Grip_Mat")) child.material.color.set(this.bikeGripColor);
                if (child.material.name.includes("Seat_Mat")) child.material.color.set(this.bikeSeatColor);
                if (child.material.name.includes("Pedal_Mat")) child.material.color.set(this.bikePedalColor);
                if (child.material.name.includes("PedalCrank_Mat")) child.material.color.set(this.bikeCrankColor);
            }
        });
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
        this.leftShin.rotation.x = 12 * pi / 20;
        this.leftShin.rotation.z = -pi / 90;
        this.leftFoot.rotation.x = -pi / 6;
    }


    setMenuPosition() {
        this.avatarEntity.setAttribute('position', `0 0 0`);
        this.avatarEntity.setAttribute('rotation', `0 180 0`);

        this.setInitialPose();
    }

    enableMenuRotation(speed = 0.5) {
        this.autoRotate = true;
        this.rotationSpeed = speed;
    }

    startRotationLoop() {
        if (this._rotationLoopRunning) return;
        this._rotationLoopRunning = true;

        const rotate = () => {
            if (this.avatarEntity && this.autoRotate) {
                const rot = this.avatarEntity.getAttribute('rotation');
                this.avatarEntity.setAttribute('rotation', {
                    x: rot.x,
                    y: rot.y + this.rotationSpeed,
                    z: rot.z
                });
            }
            requestAnimationFrame(rotate);
        };
        rotate();
    }

    savePlayerData() {
        const data = {
            model: this.playerModel || "male",
            colors: {
                skin: this.skinColor,
                shirt: this.shirtColor,
                shorts: this.shortsColor,
                shoes: this.shoesColor
            },
            bikeColors: {
                frame: this.bikeFrameColor,
                tires: this.bikeTireColor,
                grip: this.bikeGripColor,
                seat: this.bikeSeatColor,
                pedals: this.bikePedalColor,
                pedalCrank: this.bikeCrankColor
            },
            helmetColors: {
            helmet: this.helmetColor,
            padding: this.helmetPaddingColor
            }
        };

        localStorage.setItem("playerData", JSON.stringify(data));
    }

    loadPlayerData() {
        const data = JSON.parse(localStorage.getItem("playerData"));
        if (!data) {
            return;
        }

        this.playerModel = data.model || this.playerModel;

        const player = data.colors || {};
        this.skinColor = player.skin || this.skinColor;
        this.shirtColor = player.shirt || this.shirtColor;
        this.shortsColor = player.shorts || this.shortsColor;
        this.shoesColor = player.shoes || this.shoesColor;

        const bike = data.bikeColors || {};
        this.bikeFrameColor = bike.frame || this.bikeFrameColor;
        this.bikeTireColor = bike.tires || this.bikeTireColor;
        this.bikeGripColor = bike.grip || this.bikeGripColor;
        this.bikeSeatColor = bike.seat || this.bikeSeatColor;
        this.bikePedalColor = bike.pedals || this.bikePedalColor;
        this.bikeCrankColor = bike.pedalCrank || this.bikeCrankColor;

        const helmet = data.helmetColors || {};
        this.helmetColor = helmet.helmet || this.helmetColor;
        this.helmetPaddingColor = helmet.padding || this.helmetPaddingColor;
    }

    loadOtherData(json) {
        const data = JSON.parse(json);
        if (!data) {
            return;
        }

        this.playerModel = data.model || this.playerModel;

        const player = data.colors || {};
        this.skinColor = player.skin || this.skinColor;
        this.shirtColor = player.shirt || this.shirtColor;
        this.shortsColor = player.shorts || this.shortsColor;
        this.shoesColor = player.shoes || this.shoesColor;

        const bike = data.bikeColors || {};
        this.bikeFrameColor = bike.frame || this.bikeFrameColor;
        this.bikeTireColor = bike.tires || this.bikeTireColor;
        this.bikeGripColor = bike.grip || this.bikeGripColor;
        this.bikeSeatColor = bike.seat || this.bikeSeatColor;
        this.bikePedalColor = bike.pedals || this.bikePedalColor;
        this.bikeCrankColor = bike.pedalCrank || this.bikeCrankColor;

        const helmet = data.helmetColors || {};
        this.helmetColor = helmet.helmet || this.helmetColor;
        this.helmetPaddingColor = helmet.padding || this.helmetPaddingColor;
    }

    setPacerColors() {
        this.skinColor   = "#c1591a";
        this.shirtColor  = "#a32c06";
        this.shortsColor = "#290800";
        this.shoesColor  = "#4a1600";

        this.bikeFrameColor = "#FF9500"; // orange frame
        this.bikeTireColor  = "#333333"; // tires stay neutral
        this.bikeGripColor  = "#FF7F00";
        this.bikeSeatColor  = "#FF6F00";
        this.bikePedalColor = "#FF8C00";
        this.bikeCrankColor = "#FFA500";

        this.helmetColor = "#A7E800";
        this.helmetPaddingColor = "#333333";


        this.applyPlayerColors();
        this.applyBikeColors();
    }
}