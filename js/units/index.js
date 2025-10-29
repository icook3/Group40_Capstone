import {kmh} from "./kmh.js";
import {mph} from "./mph.js"
import { km } from "./km.js";
import { mi } from './mi.js';
import { kg } from "./kg.js";
import { lb } from "./lb.js";
import { W } from "./W.js";

export class Units {
    speedUnit;
    distanceUnit;
    powerUnit;
    weightUnit;
    setUnits() {
        //speed
        switch(sessionStorage.getItem("SpeedUnit")) {
            case "mph":
                this.speedUnit = new mph();
                break;
            default:
                this.speedUnit=new kmh();
                break;
        }
        //distance
        switch(sessionStorage.getItem("SpeedUnit")) {
            case "mph":
                this.distanceUnit = new mi();
                break;
            default:
                this.distanceUnit= new km();
                break;
        }
        //power - not fully implemented
        this.powerUnit = new W();
        /*switch(sessionStorage.getItem("PowerUnit")) {
            case "mph":
                break;
            default:
                this.powerUnit=new W();
                break;
        }*/
        //weight
        switch(sessionStorage.getItem("WeightUnit")) {
            case "lb":
                this.powerUnit = new lb();
                break;
            default:
                this.powerUnit=new kg();
                break;
        }
    }
}