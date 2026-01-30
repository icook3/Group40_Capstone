import { constants } from "./constants.js";
import { powerToSpeed } from "./main.js";

export class KeyboardMode {
  keyboardMode = false;
  keyboardSpeed = constants.kmhToMs(100);
  keyboardHalfSpeed = constants.kmhToMs(50);
  wKeyDown = false;
  sKeyDown = false;
  qKeyDown = false;
  aKeyDown = false;

  keyboardOnText = "Keyboard Mode: ON";

  setKeyboardModeSpeed(key) {
    if (key === "w" && !this.wKeyDown) {
      this.wKeyDown = true;
      constants.riderState.speed = this.keyboardSpeed;
      constants.riderState.power = 0; // Reset power when using speed keys
    } else if (key === "s" && !this.sKeyDown) {
      this.sKeyDown = true;
      constants.riderState.speed = this.keyboardHalfSpeed;
      constants.riderState.power = 0; // Reset power when using speed keys
    }
  }
  //Adding Power input for keyboard mode
  //Q will increase power by 10
  //A will decrease power by 10
  //Power will not go below 0
  //Power will be displayed in the power span
  //Speed will be calculated from power using powerToSpeed function
  //Power will only work if speed buttons are not pressed
  setKeyboardModePower(key) {
    if (key === "q" && !this.qKeyDown) {
      this.qKeyDown = true;
      constants.riderState.power = (constants.riderState.power || 0) + 10;
      constants.riderState.speed = powerToSpeed({ power: constants.riderState.power });
    } else if (key === "a" && !this.aKeyDown) {
      this.aKeyDown = true;
      constants.riderState.power = Math.max(
        (constants.riderState.power || 0) - 10,
        0
      );
      constants.riderState.speed = powerToSpeed({ power: constants.riderState.power });
    }
  }

  keyboardInputActive(k) {
    var key = k.toLowerCase();
    if (key === "w" || key === "s") {
      this.setKeyboardModeSpeed(key);
    } else if (key === "q" || key === "a") {
      this.setKeyboardModePower(key);
    }
  }

  stopKeyboardMode(key) {
    if (key === "w") {
      this.wKeyDown = false;
    } else if (key === "s") {
      this.sKeyDown = false;
    } else if (key === "q") {
      this.qKeyDown = false;
    } else if (key === "a") {
      this.aKeyDown = false;
    }
  }
}
