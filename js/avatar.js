export class Avatar {
    constructor(id, color = '#0af', position = {x:1, y:1, z:0}, rotation = {x:0, y:90, z:0}, isPacer = false) {
        this.id = id;
        this.color = color;
        this.position = position;
        this.rotation = rotation;
        this.speed = 0;
        this.power = 0;
        this.avatarEntity = this.createEntity();
        this.bikeModel = null;
    }

    //Creates avatar entity
    createEntity() {
        const avatar = document.createElement('a-entity');
        avatar.setAttribute('id', this.id);
        avatar.setAttribute('position', `${this.position.x} ${this.position.y} ${this.position.z}`);
        avatar.setAttribute('rotation', `${this.rotation.x} ${this.rotation.y} ${this.rotation.z}`);

        const bikeModel = document.createElement('a-entity');
        bikeModel.setAttribute('gltf-model', '#bikeGLB');
        bikeModel.setAttribute('position', '0 0 0');
        bikeModel.setAttribute('rotation', '0 -90 0');
        bikeModel.setAttribute('scale', '0.5 0.5 0.5');
        avatar.appendChild(bikeModel);
        this.bikeModel = bikeModel;

        document.querySelector('a-scene').appendChild(avatar);
        return avatar;
    }

    //Setter for avatar speed
    setSpeed(speed) {
        this.speed = speed;
    }

    //Setter for avatar power
    setPower(power) {
        this.power = power;
    }

    update(dt) {
        if (this.speed === 0) {
            return;
        }

    }
}