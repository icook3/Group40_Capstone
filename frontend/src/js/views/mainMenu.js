import {workoutMenu} from "../workoutMenu.js";
import { StandardMode } from "../standardMode.js";
import {constants, features} from "../constants.js";
import { Strava } from "../strava.js";
import { initMenuBackground } from "../scene/mainMenuBackground.js";

export class mainMenuView {
    content;
    ready=false;
    constructor(setWhenDone) {
        fetch("../html/mainMenu.html").then((content)=> {
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
        
        // Three.js background
        const canvas = initMenuBackground();
        canvas.style.position = "fixed";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.zIndex = "-1";
        canvas.style.filter = "blur(3px)";  // blurs the background
        document.getElementById("mainDiv").appendChild(canvas);
        // Everything else
        workoutMenu();
        this.initSettings();
        this.initStravaButton().catch((error)=> {
            console.error("init Strava button failed");
        });
        this.initPeerButtons();
    }

    reset() {}
    
    initSettings() {
        if (sessionStorage.getItem("peerToPeer")==='true') {
            jQuery("#peer-name").fadeToggle(500);
        }
        let standardMode = new StandardMode();
        //Connect Trainer
        const connectBtn = document.getElementById("connect-btn");
        connectBtn.addEventListener("click", async () => {
            await standardMode.connectTrainer();
            //store the trainer info using JSON
            sessionStorage.setItem("Trainer", JSON.stringify(standardMode.trainer));
            //const ok = await standardMode.trainer.connect();
            //if (ok) connectBtn.disabled = true;
        });

        //Test Mode
        const devToggle = document.getElementById("dev-toggle");
        // Sync toggle with stored state on load
        devToggle.checked = localStorage.getItem("testMode") === "true";

        devToggle.addEventListener("change", () => {
            localStorage.setItem("testMode", devToggle.checked);
            if (!devToggle.checked) {
                constants.riderState.speed = 0;
            }
        });

        // Pacer speed input
        const pacerSpeedInput = document.getElementById("pacer-speed");
        autoResizeInput(pacerSpeedInput);
        restrictNumberInput(pacerSpeedInput, 2, 1, 99.9);

        // Weight input
        const riderWeightInput = document.getElementById("rider-weight");
        autoResizeInput(riderWeightInput)
        restrictNumberInput(riderWeightInput, 3, 1, 999.9);

        // Units input
        // Speed unit toggle
        const speedBtns = document.querySelectorAll('.seg-btn[data-group="speed"]');
        const savedSpeed = sessionStorage.getItem("SpeedUnit");
        if (savedSpeed) {
            speedBtns.forEach(btn => {
                btn.classList.toggle("active", btn.dataset.unit === savedSpeed);
            });
        }
        speedBtns.forEach(btn => {
            btn.addEventListener("click", () => {
            speedBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            sessionStorage.setItem("SpeedUnit", btn.dataset.unit);
            let elements = document.getElementsByClassName("speedUnit");
                for (let i = 0; i < elements.length; i++) {
                    elements.item(i).innerHTML = btn.dataset.unit;
                }
            });
        });
        // Weight unit toggle
        const weightBtns = document.querySelectorAll('.seg-btn[data-group="weight"]');
        const savedWeight = sessionStorage.getItem("WeightUnit");
        if (savedWeight) {
            weightBtns.forEach(btn => {
                btn.classList.toggle("active", btn.dataset.unit === savedWeight);
            });
        }
        weightBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                weightBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                sessionStorage.setItem("WeightUnit", btn.dataset.unit);
                let elements = document.getElementsByClassName("weightUnit");
                for (let i = 0; i < elements.length; i++) {
                    elements.item(i).innerHTML = btn.dataset.unit;
                }
            });
        });
    }

    async initStravaButton() {
        if (!features.stravaEnabled) {
            const stravaBtn = document.getElementById("connect-strava-btn");
            stravaBtn.style.display = "none";
        }

        const strava = new Strava();
        Strava.loadFromRedirect();
        strava.loadToken();

        const stravaBtn = document.getElementById("connect-strava-btn");
        if (!stravaBtn) {
            return;
        }

        // Disable by default until we know backend state
        stravaBtn.disabled = true;

        const backendUp = await strava.isStravaBackendUp();
        if (!backendUp) {
            stravaBtn.textContent = "Strava Unavailable";
            return;
        }

        if (Strava.isConnected()) {
            stravaBtn.textContent = "Strava Connected";
            stravaBtn.disabled = true;
        } else {
            stravaBtn.textContent = "Connect Strava";
            stravaBtn.disabled = false;
            stravaBtn.addEventListener("click", () => strava.startOAuth());
        }
    }

    initPeerButtons() {
        // If peer to peer not configured, hide it
        if (!features.peerEnabled) {
            // Connect to Peer
            const peerConnectBtn = document.getElementById("peer-connect-btn");
            peerConnectBtn.style.display = "none";

            const peerSection = document.getElementById("peer-section");
            if (peerSection) {
                peerSection.style.display = "none";
            }

            return;
        }

        // Host P2P toggle
        const peerToggle = document.getElementById("peer-toggle");

        // Sync with stored state on load
        peerToggle.checked = sessionStorage.getItem("peerToPeer") === "true";

        peerToggle.addEventListener("change", () => {
            sessionStorage.setItem("peerToPeer", peerToggle.checked);
            jQuery("#peer-name").fadeToggle(500);
        });

        const peerNameInput = document.getElementById("name-input");
        peerNameInput.addEventListener("input", () => {
            localStorage.setItem("Name",peerNameInput.value);
        });

        peerNameInput.addEventListener("change", () => {
            const name = peerNameInput.value.trim();
            if (name.length === 0) {
                alert("Name cannot be empty");
            }
        });
    }
}

function restrictNumberInput(input, maxDigits, min, max) {
    input.addEventListener("input", () => {
        const pattern = new RegExp(`^\\d{0,${maxDigits}}(\\.\\d{0,1})?$`);

        if (!pattern.test(input.value)) {
            input.value = input.value.slice(0, -1);
            return;
        }

        autoResizeInput(input)

        sessionStorage.setItem(input.id, input.value);
    });

    input.addEventListener("change", () => {
        let num = parseFloat(input.value);
        if (isNaN(num)) return;

        num = Math.max(min, Math.min(max, num));
        input.value = num;
    });

    input.addEventListener("keydown", (e) => {
        if (["e", "E", "+", "-"].includes(e.key)) {
            e.preventDefault();
        }
    });
}

function autoResizeInput(input) {
    const resize = () => {
        const length = String(input.value ?? "").length;
        input.style.width = 4 + (length + 1) + "ch";
    };

    input.addEventListener("input", resize);
    input.addEventListener("change", resize);
    resize();
}