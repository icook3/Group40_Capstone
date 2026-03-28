import { AvatarCreator } from "../avatarCreator.js";
import { achievementManager } from "../achievements/achievementManager.js";
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
        this.initBackButton();
        this.initTabs();
        this.initGenderToggle();
        this.initPlayerColors();
        this.initBikeColors();
        this.initHelmetColors();
        this.initSwatchHitboxes();

        this.setInitialPickerValues();

    }
    reset() {
        this.stopLoop=true;
    }

    avatar;
    scene;
    models;

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



    initBackButton() {
        document.getElementById("customize-back").addEventListener("click", () => {
            viewManager.setView(viewManager.views.mainMenu);
        });
    }

    initTabs() {
        const tabButtons = document.querySelectorAll("#customize-tabs .seg-btn");
        const playerTab = document.getElementById("player-tab");
        const bikeTab = document.getElementById("bike-tab");

        tabButtons.forEach((btn) => {
            btn.addEventListener("click", () => {
                // Update active button
                tabButtons.forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");

                // Show the matching tab
                if (btn.dataset.tab === "player") {
                    playerTab.style.display = "";
                    bikeTab.style.display = "none";
                } else {
                    playerTab.style.display = "none";
                    bikeTab.style.display = "";
                }
            });
        });
    }

    initGenderToggle({owner=this}={}) {
        if (owner.stopLoop) {
            return;
        }
        if (!window.avatarInstance) {
            requestAnimationFrame(()=>owner.initGenderToggle({owner}));
            return;
        }

        const maleBtn = document.getElementById("gender-male");
        const femaleBtn = document.getElementById("gender-female");

        // Sets initial state from saved char
        const savedModel = window.avatarInstance.playerModel || "male";
        if (savedModel.toLowerCase() === "female") {
            maleBtn.classList.remove("active");
            femaleBtn.classList.add("active");
        }

        maleBtn.addEventListener("click", () => {
            maleBtn.classList.add("active");
            femaleBtn.classList.remove("active");
            window.avatarInstance.setPlayerModel("male");
            achievementManager.obtainAchievement("CreateACharacter");
        });

        femaleBtn.addEventListener("click", () => {
            femaleBtn.classList.add("active");
            maleBtn.classList.remove("active");
            window.avatarInstance.setPlayerModel("female");
            achievementManager.obtainAchievement("CreateACharacter");
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
            "#player-tab .color-picker"
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
                achievementManager.obtainAchievement("CreateACharacter");
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
            "#bike-tab .color-picker"
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
                achievementManager.obtainAchievement("CreateACharacter");
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
            '#player-tab .color-picker[data-mat="Helmet"], #player-tab .color-picker[data-mat="Padding"]'
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
                achievementManager.obtainAchievement("CreateACharacter");
                avatar.setHelmetColors(helmet, padding);
            });
        });
    }

    initSwatchHitboxes() {
        const swatches = document.querySelectorAll(".customize-swatch");
        swatches.forEach((swatch) => {
            swatch.addEventListener("click", (e) => {
                // This prevents it from triggering if already triggered
                if (e.target.tagName === "INPUT") return;
                const input = swatch.querySelector("input[type='color']");
                if (input) input.click();
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
            '#player-tab .color-picker[data-mat="Skin"]'
        ).value = avatar.skinColor;
        document.querySelector(
            '#player-tab .color-picker[data-mat="Shirt"]'
        ).value = avatar.shirtColor;
        document.querySelector(
            '#player-tab .color-picker[data-mat="Shorts"]'
        ).value = avatar.shortsColor;
        document.querySelector(
            '#player-tab .color-picker[data-mat="Shoes"]'
        ).value = avatar.shoesColor;

        document.querySelector(
            '#bike-tab .color-picker[data-mat="Frame_Mat"]'
        ).value = avatar.bikeFrameColor;
        document.querySelector(
            '#bike-tab .color-picker[data-mat="Tire_Mat"]'
        ).value = avatar.bikeTireColor;
        document.querySelector(
            '#bike-tab .color-picker[data-mat="Grip_Mat"]'
        ).value = avatar.bikeGripColor;
        document.querySelector(
            '#bike-tab .color-picker[data-mat="Seat_Mat"]'
        ).value = avatar.bikeSeatColor;
        document.querySelector(
            '#bike-tab .color-picker[data-mat="Pedal_Mat"]'
        ).value = avatar.bikePedalColor;
        document.querySelector(
            '#bike-tab .color-picker[data-mat="PedalCrank_Mat"]'
        ).value = avatar.bikeCrankColor;

        document.querySelector(
            '#player-tab .color-picker[data-mat="Helmet"]'
        ).value = avatar.helmetColor;
        document.querySelector(
            '#player-tab .color-picker[data-mat="Padding"]'
        ).value = avatar.helmetPaddingColor;
    }
}