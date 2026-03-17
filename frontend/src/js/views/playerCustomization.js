import { AvatarCreator } from "../avatarCreator.js";
export class playerCustomizationView {
    content;
    ready=false;
    constructor(setWhenDone) {
        fetch("../html/playerCustomization.html").then((content)=> {
            return content.text();
        }).then((content)=> {
            this.content=content;
            if (setWhenDone) {
                this.setPage();
            }
            this.ready=true;
        });
    }

    setPage() {
        document.getElementById("mainDiv").innerHTML=this.content;
        this.stopLoop=false;
        this.createAvatar();
        const colorPicker = document.getElementById("colorPicker");
        this.createGenderLabels();
        this.initPlayerColors();
        this.initBikeColors();
        this.initHelmetColors();

        this.setInitialPickerValues();

    }
    reset() {
        this.stopLoop=true;
    }

    avatar;
    scene;
    models;
    genderLabel;
    leftArrow;
    rightArrow;
    stopLoop = true;
    createAvatar() {
        this.scene = document.querySelector("#playerCustomizerScene");
        if (!this.scene) {
          console.error("Scene not found!");
          return;
        }

        //Create the avatar immediately
        this.avatar = new AvatarCreator(
          "menuAvatar",
          { x: 0, y: 0, z: -1 },
          { x: 0, y: 90, z: 0 },
          (avatarInstance) => {
            avatarInstance.setMenuPosition();
            avatarInstance.enableMenuRotation();
            avatarInstance.startRotationLoop();

            window.avatarInstance = avatarInstance;
          }
        );
    }

    createGenderLabels() {
        this.models = ["Male", "Female"];

        this.genderLabel = document.getElementById("genderLabel");
        this.leftArrow = document.getElementById("leftArrow");
        this.rightArrow = document.getElementById("rightArrow");
        this.initGenderLabel();
    }

    initGenderLabel({owner=this}={}) {
        if (owner.stopLoop) {
            return;
        }
        if (!window.avatarInstance) {
            requestAnimationFrame(()=>owner.initGenderLabel({owner}));
            return;
        }

        const savedModel = window.avatarInstance.playerModel || "male";
        let currentModelIndex = savedModel.toLowerCase() === "female" ? 1 : 0;
        this.genderLabel.textContent = this.models[currentModelIndex];

        function updateGenderDisplay() {
            owner.genderLabel.textContent = owner.models[currentModelIndex];
            window.avatarInstance.setPlayerModel(
                owner.models[currentModelIndex].toLowerCase()
            );
        }

        owner.leftArrow.addEventListener("click", () => {
            currentModelIndex =
                (currentModelIndex - 1 + owner.models.length) % owner.models.length;
            updateGenderDisplay();
        });

        this.rightArrow.addEventListener("click", () => {
            currentModelIndex = (currentModelIndex + 1) % owner.models.length;
            updateGenderDisplay();
        });
    }

    initPlayerColors({owner=this}={}) {
        if (owner.stopLoop) {
            return;
        }
        if (!window.avatarInstance) {
            requestAnimationFrame(()=>owner.initPlayerColors({owner}));
            return;
        }

        const colorPickers = document.querySelectorAll(
            "#playerControls .color-picker"
        );

        colorPickers.forEach((picker) => {
            picker.addEventListener("input", (e) => {
            const mat = picker.dataset.mat; // Skin, Shirt, Shorts, Shoes
            const color = e.target.value;

            //Get current colors
            const avatar = window.avatarInstance;
            let skin = avatar.skinColor;
            let shirt = avatar.shirtColor;
            let shorts = avatar.shortsColor;
            let shoes = avatar.shoesColor;

            //Update only the changed one
            switch (mat) {
                case "Skin":
                    skin = color;
                    break;
                case "Shirt":
                    shirt = color;
                    break;
                case "Shorts":
                    shorts = color;
                    break;
                case "Shoes":
                    shoes = color;
                    break;
                }

                //Apply all colors
                avatar.setPlayerColors(skin, shirt, shorts, shoes);
            });
        });
    }
    initBikeColors({owner=this}={}) {
        if (owner.stopLoop) {
            return;
        }
        if (!window.avatarInstance) {
            requestAnimationFrame(()=>owner.initBikeColors({owner}));
            return;
        }

        const colorPickers = document.querySelectorAll(
            "#bikeControls .color-picker"
        );

        colorPickers.forEach((picker) => {
            picker.addEventListener("input", (e) => {
                const mat = picker.dataset.mat; // Frame_Mat, Tire_Mat, Grip_Mat, etc.
                const color = e.target.value;

                const avatar = window.avatarInstance;

                //Get current bike colors
                let frame = avatar.bikeFrameColor;
                let tires = avatar.bikeTireColor;
                let grip = avatar.bikeGripColor;
                let seat = avatar.bikeSeatColor;
                let pedals = avatar.bikePedalColor;
                let pedalCrank = avatar.bikeCrankColor;

                //Update only the changed one
                switch (mat) {
                    case "Frame_Mat":
                        frame = color;
                        break;
                    case "Tire_Mat":
                        tires = color;
                        break;
                    case "Grip_Mat":
                        grip = color;
                        break;
                    case "Seat_Mat":
                        seat = color;
                        break;
                    case "Pedal_Mat":
                        pedals = color;
                        break;
                    case "PedalCrank_Mat":
                        pedalCrank = color;
                        break;
                }

                //Apply all bike colors
                avatar.setBikeColors(
                    frame,
                    tires,
                    grip,
                    seat,
                    pedals,
                    pedalCrank
                );
            });
        });
    }
    initHelmetColors({owner=this}={}) {
        if (owner.stopLoop) {
            return;
        }
        if (!window.avatarInstance) {
            requestAnimationFrame(()=>owner.initHelmetColors({owner}));
            return;
        }

        const colorPickers = document.querySelectorAll(
            '#playerControls .color-picker[data-mat="Helmet"], #playerControls .color-picker[data-mat="Padding"]'
        );

        colorPickers.forEach((picker) => {
            picker.addEventListener("input", (e) => {
                const mat = picker.dataset.mat;
                const color = e.target.value;

                const avatar = window.avatarInstance;

                let helmet = avatar.helmetColor;
                let padding = avatar.helmetPaddingColor;

                switch (mat) {
                    case "Helmet":
                        helmet = color;
                        break;
                    case "Padding":
                        padding = color;
                        break;
                }

                avatar.setHelmetColors(helmet, padding);
            });
        });
    }

    setInitialPickerValues({owner=this}={}) {
        if (owner.stopLoop) {
            return;
        }
        if (!window.avatarInstance) {
            requestAnimationFrame(()=>owner.setInitialPickerValues({owner}));
            return;
        }

        const avatar = window.avatarInstance;

        document.querySelector(
            '#playerControls .color-picker[data-mat="Skin"]'
        ).value = avatar.skinColor;
        document.querySelector(
            '#playerControls .color-picker[data-mat="Shirt"]'
        ).value = avatar.shirtColor;
        document.querySelector(
            '#playerControls .color-picker[data-mat="Shorts"]'
        ).value = avatar.shortsColor;
        document.querySelector(
            '#playerControls .color-picker[data-mat="Shoes"]'
        ).value = avatar.shoesColor;

        document.querySelector(
            '#bikeControls .color-picker[data-mat="Frame_Mat"]'
        ).value = avatar.bikeFrameColor;
        document.querySelector(
            '#bikeControls .color-picker[data-mat="Tire_Mat"]'
        ).value = avatar.bikeTireColor;
        document.querySelector(
            '#bikeControls .color-picker[data-mat="Grip_Mat"]'
        ).value = avatar.bikeGripColor;
        document.querySelector(
            '#bikeControls .color-picker[data-mat="Seat_Mat"]'
        ).value = avatar.bikeSeatColor;
        document.querySelector(
            '#bikeControls .color-picker[data-mat="Pedal_Mat"]'
        ).value = avatar.bikePedalColor;
        document.querySelector(
            '#bikeControls .color-picker[data-mat="PedalCrank_Mat"]'
        ).value = avatar.bikeCrankColor;

        document.querySelector(
            '#playerControls .color-picker[data-mat="Helmet"]'
        ).value = avatar.helmetColor;
        document.querySelector(
            '#playerControls .color-picker[data-mat="Padding"]'
        ).value = avatar.helmetPaddingColor;
    }
}