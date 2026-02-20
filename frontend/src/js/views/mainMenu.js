import {workoutMenu} from "../workoutMenu.js";
import { StandardMode } from "../standardMode.js";
import {constants, features} from "../constants.js";
import { Strava } from "../strava.js";

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
        //Pacer speed input
        const pacerSpeedInput = document.getElementById("pacer-speed");
        pacerSpeedInput.addEventListener("input", () => {
            sessionStorage.setItem("PacerSpeed", pacerSpeedInput.value);
        });
        //weight input
        // Hook up live mass updates → optional immediate speed recompute
        const riderWeightEl = document.getElementById("rider-weight");
        if (riderWeightEl) {
            const updateMassAndMaybeSpeed = () => {
                const newMass = Number(riderWeightEl.value);
                if (!Number.isFinite(newMass)) return;
                sessionStorage.setItem("weight", newMass);
            };

            // Initialize once and then listen for changes
            updateMassAndMaybeSpeed();
            riderWeightEl.addEventListener("input", updateMassAndMaybeSpeed);
            riderWeightEl.addEventListener("change", updateMassAndMaybeSpeed);
        }

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