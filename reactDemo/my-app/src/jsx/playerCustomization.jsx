    import { AvatarCreator } from "../js/avatarCreator.js";

export default function PlayerCustomization() {

      window.addEventListener("DOMContentLoaded", () => {
        const scene = document.querySelector("#mainMenuScene");
        if (!scene) {
          console.error("Scene not found!");
          return;
        }

        //Create the avatar immediately
        const avatar = new AvatarCreator(
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
      });

      const colorPicker = document.getElementById("colorPicker");

      window.addEventListener("DOMContentLoaded", () => {
        const models = ["Male", "Female"];

        const genderLabel = document.getElementById("genderLabel");
        const leftArrow = document.getElementById("leftArrow");
        const rightArrow = document.getElementById("rightArrow");

        //Wait until avatarInstance exists
        function initGenderLabel() {
          if (!window.avatarInstance) {
            requestAnimationFrame(initGenderLabel);
            return;
          }

          const savedModel = window.avatarInstance.playerModel || "male";
          let currentModelIndex = savedModel.toLowerCase() === "female" ? 1 : 0;
          genderLabel.textContent = models[currentModelIndex];

          function updateGenderDisplay() {
            genderLabel.textContent = models[currentModelIndex];
            window.avatarInstance.setPlayerModel(
              models[currentModelIndex].toLowerCase()
            );
          }

          leftArrow.addEventListener("click", () => {
            currentModelIndex =
              (currentModelIndex - 1 + models.length) % models.length;
            updateGenderDisplay();
          });

          rightArrow.addEventListener("click", () => {
            currentModelIndex = (currentModelIndex + 1) % models.length;
            updateGenderDisplay();
          });
        }

        initGenderLabel();
      });

      window.addEventListener("DOMContentLoaded", () => {
        //Wait until avatarInstance exists
        function initPlayerColors() {
          if (!window.avatarInstance) {
            requestAnimationFrame(initPlayerColors);
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

        initPlayerColors();
      });

      window.addEventListener("DOMContentLoaded", () => {
        function initBikeColors() {
          if (!window.avatarInstance) {
            requestAnimationFrame(initBikeColors);
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

        initBikeColors();
      });

      window.addEventListener("DOMContentLoaded", () => {
    function initHelmetColors() {
      if (!window.avatarInstance) {
        requestAnimationFrame(initHelmetColors);
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

    initHelmetColors();
  });

  function setInitialPickerValues() {
        if (!window.avatarInstance) {
          requestAnimationFrame(setInitialPickerValues);
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

      setInitialPickerValues();
    return (
        <>
            <div id="sky-gradient"></div>

    {/** Avatar */}
    <a-scene
      id="mainMenuScene"
      embedded
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        "zIndex": -1
      }}
    >
      {/** Camera */}
      <a-entity
        camera
        position="0 1.5 4"
        look-controls="enabled: false"
      ></a-entity>

      {/** 3d Assets */}
      <a-assets>
        <a-asset-item
          id="bikeGLB"
          src="../../resources/models/playermodels/bikeV4.glb"
        ></a-asset-item>
        <a-asset-item
          id="maleGLB"
          src="../../resources/models/playermodels/maleV5.glb"
        ></a-asset-item>
        <a-asset-item
          id="femaleGLB"
          src="../../resources/models/playermodels/femaleV6.glb"
        ></a-asset-item>
        <a-asset-item 
          id="helmetGLB"
          src="../../resources/models/playermodels/helmet.glb"
          ></a-asset-item>
      </a-assets>

      {/** Floor - solid color */}
      {/** I think it looks better without it - */}
      {/** <a-entity id="grid-floor">
        Main floor
        <a-plane
          position="0 -.5 0"
          rotation="-90 0 0"
          width="30"
          height="30"
          color="#477e23"
        ></a-plane>
      </a-entity> */}

      {/** Brown platform base (sides) */}
      <a-cylinder
        position="0 -.3 -1"
        radius="2.5"
        height="0.1"
        color="#725335"
        metalness="0.3"
        roughness="0.7"
      ></a-cylinder>

      {/** Green top surface (grass) */}
      <a-circle
        position="0 -0.24 -1"
        radius="2.5"
        rotation="-90 0 0"
        color="#477e23"
        metalness="0.3"
        roughness="1.0"
      ></a-circle>

      {/** Lighting (same as main menu) */}
      <a-light type="ambient" color="#FFF" intensity="0.8"></a-light>
      <a-light
        type="directional"
        color="#FFF"
        intensity=".8"
        position="-2 5 3"
      ></a-light>
      <a-light
        type="point"
        color="#FFF"
        intensity="1"
        position="0 1 -1"
        distance="2"
      ></a-light>
    </a-scene>

    <div id="playerContainer">
      <h2>Player Customization</h2>
      <div id="playerControls">
        <div id="genderSelector">
          <button className="arrow-btn" id="leftArrow">⮜</button>
          <span id="genderLabel">Male</span>
          <button className="arrow-btn" id="rightArrow">⮞</button>
        </div>
        <div className="option">
          <label
            >Skin<input
              type="color"
              className="color-picker"
              data-mat="Skin"
              value="#ff0000"
              onChange={console.log("Change")}
          /></label>
        </div>
        <div className="option">
          <label
            >Shirt<input
              type="color"
              className="color-picker"
              data-mat="Shirt"
              value="#ff0000"
              onChange={console.log("Change")}
          /></label>
        </div>
        <div className="option">
          <label
            >Shorts<input
              type="color"
              className="color-picker"
              data-mat="Shorts"
              value="#ff0000"
              onChange={console.log("Change")}
          /></label>
        </div>
        <div className="option">
          <label
            >Shoes<input
              type="color"
              className="color-picker"
              data-mat="Shoes"
              value="#ff0000"
              onChange={console.log("Change")}
          /></label>
        </div>
        <div className="option">
          <label
            >Helmet<input
              type="color"
              className="color-picker"
              data-mat="Helmet"
              value="#A7E800"
              onChange={console.log("Change")}
          /></label>
        </div>
        <div className="option">
          <label
            >Padding<input
            type="color"
            className="color-picker"
            data-mat="Padding"
            value="#333333"
            onChange={console.log("Change")}
          /></label>
        </div>
      </div>
    </div>

    <div id="bikeContainer">
      <h2>Bike Customization</h2>
      <div id="bikeControls">
        <div className="option">
          <label
            >Frame<input
              type="color"
              className="color-picker"
              data-mat="Frame_Mat"
              value="#ff0000"
              onChange={console.log("Change")}
          /></label>
        </div>
        <div className="option">
          <label
            >Tires<input
              type="color"
              className="color-picker"
              data-mat="Tire_Mat"
              value="#ff0000"
              onChange={console.log("Change")}
          /></label>
        </div>
        <div className="option">
          <label
            >Grip<input
              type="color"
              className="color-picker"
              data-mat="Grip_Mat"
              value="#ff0000"
              onChange={console.log("Change")}
          /></label>
        </div>
        <div className="option">
          <label
            >Seat<input
              type="color"
              className="color-picker"
              data-mat="Seat_Mat"
              value="#ff0000"
              onChange={console.log("Change")}
          /></label>
        </div>
        <div className="option">
          <label
            >Pedals<input
              type="color"
              className="color-picker"
              data-mat="Pedal_Mat"
              value="#ff0000"
              onChange={console.log("Change")}
          /></label>
        </div>
        <div className="option">
          <label
            >Pedal Crank<input
              type="color"
              className="color-picker"
              data-mat="PedalCrank_Mat"
              value="#ff0000"
              onChange={console.log("Change")}
          /></label>
        </div>
      </div>
    </div>

    <div id="menu">
      <button id="menuButton" onClick={window.location.href='./mainMenu.html'}>
        Main Menu
      </button>
    </div>
        </>
    )
}