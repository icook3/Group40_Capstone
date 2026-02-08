import { TrainerBluetooth } from "./bluetooth.js";
import { constants } from "./constants.js";
import { activatePacer } from "./main.js";

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
            if (!data || typeof data.power !== "number") return;

            constants.riderState.power = data.power;
        };
    }
    //pass in t as a JSON equivalent of trainer
    setTrainer(t) {
        this.trainer = JSON.parse(t);
    }
}