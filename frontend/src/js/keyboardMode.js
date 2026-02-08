import { constants } from "./constants.js";

export class KeyboardMode {
  keyboardMode = false;
  keyboardSpeed = constants.kmhToMs(100);
  keyboardHalfSpeed = constants.kmhToMs(50);
  wKeyDown = false;
  sKeyDown = false;
  qKeyDown = false;
  aKeyDown = false;

  keyboardOnText = "Keyboard Mode: ON";

  //Adding Power input for keyboard mode
  //Q will increase power by 10
  //A will decrease power by 10
  //Power will not go below 0
  //Power will be displayed in the power span
  //Power will only work if speed buttons are not pressed
    setKeyboardModePower(key) {
        if (key === "w" && !this.wKeyDown) {
            this.wKeyDown = true;
            constants.riderState.power = 250;
        }
        else if (key === "s" && !this.sKeyDown) {
            this.sKeyDown = true;
            constants.riderState.power = 120;
        }
        else if (key === "q" && !this.qKeyDown) {
            this.qKeyDown = true;
            constants.riderState.power += 10;
        }
        else if (key === "a" && !this.aKeyDown) {
            this.aKeyDown = true;
            constants.riderState.power = Math.max(constants.riderState.power - 10, 0);
        }
    }

    keyboardInputActive(k) {
        const key = k.toLowerCase();
        if (["w", "s", "q", "a"].includes(key)) {
            this.setKeyboardModePower(key);
        }
    }

  stopKeyboardMode(key) {
      if (key === "w") this.wKeyDown = false;
      if (key === "s") this.sKeyDown = false;
      if (key === "q") this.qKeyDown = false;
      if (key === "a") this.aKeyDown = false;
  }
}
