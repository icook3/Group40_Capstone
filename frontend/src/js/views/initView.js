import { setView } from "./viewManager.js";
import { views } from "./viewManager.js";
function init() {
    setView(views.mainMenu);
}
if (typeof window !== "undefined") {
  window.init = init;
  window.setView=setView;
  window.views=views;
}