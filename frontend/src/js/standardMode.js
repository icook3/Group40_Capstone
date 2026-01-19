import { TrainerBluetooth } from "./bluetooth.js";
import { powerToSpeed } from "./main.js";
import { activatePacer } from "./main.js";
import { riderState } from "./riderState.js";

export class StandardMode {
    trainer = new TrainerBluetooth();
    async connectTrainer() {
        if (this.trainer == null) {
            this.trainer = new TrainerBluetooth();
        }
        ok = await this.trainer.connect();
        if (ok) connectBtn.disabled = true;
    } 
    init() {
        this.trainer.onData = (data) => {
            let speed = 0;
            if (typeof data.power === "number" && data.power > 0) {
                speed = powerToSpeed({ power: data.power });
            }
            riderState = {
                ...riderState,
                power: data.power,
                speed,
            };
            if (speed > 0) {
                activatePacer();
            }
        };
    }
    //pass in t as a JSON equivalent of trainer
    setTrainer(t) {
        this.trainer = JSON.parse(t);
    }
}