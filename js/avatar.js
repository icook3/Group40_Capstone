export class Avatar {
    constructor(id, color = '#0af', position = {x:1, y:1, z:0}, rotation = {x:0, y:90, z:0}, isPacer = false) {
        this.id = id;
        this.color = color;
        this.position = position;
        this.rotation = rotation;
        this.speed = 0;
        this.legEntities = [];
        this.avatarEntity = this.createEntity();
    }

    //Creates avatar entity
    createEntity() {
        const avatar = document.createElement('a-entity');
        avatar.setAttribute('id', this.id);
        avatar.setAttribute('position', `${this.position.x} ${this.position.y} ${this.position.z}`);
        avatar.setAttribute('rotation', `${this.rotation.x} ${this.rotation.y} ${this.rotation.z}`);

        //Body
        const body = document.createElement('a-entity');
        body.setAttribute('geometry', 'primitive: cylinder; radius: 0.16; height: 0.5');
        body.setAttribute('material', `color: ${this.color}`);
        body.setAttribute('position', '0 1 0');
        avatar.appendChild(body);

        //Head
        const head = document.createElement('a-entity');
        head.setAttribute('geometry', 'primitive: sphere; radius: 0.18');
        head.setAttribute('material', `color: ${this.color}`);
        head.setAttribute('position', '0 1.35 0');
        avatar.appendChild(head);

        //Legs
        const leg1 = document.createElement('a-entity');
        leg1.setAttribute('geometry', 'primitive: cylinder; radius: 0.07; height: 0.45');
        leg1.setAttribute('material', `color: ${this.color}`);
        leg1.setAttribute('position', '-0.09 0.77 0.09');
        leg1.setAttribute('rotation', '10 0 10');
        avatar.appendChild(leg1);
        const leg2 = document.createElement('a-entity');
        leg2.setAttribute('geometry', 'primitive: cylinder; radius: 0.07; height: 0.45');
        leg2.setAttribute('material', `color: ${this.color}`);
        leg2.setAttribute('position', '0.09 0.77 -0.09');
        leg2.setAttribute('rotation', '-10 0 -10');
        avatar.appendChild(leg2);
        this.legEntities = [leg1, leg2];

        //Bike Frame
        const frame = document.createElement('a-entity');
        frame.setAttribute('geometry', 'primitive: box; width: 1.5; height: 0.05; depth: 0.1');
        frame.setAttribute('material', 'color: #fff');
        frame.setAttribute('position', '0 0.8 0');
        avatar.appendChild(frame);

        //Wheels
        const wheel1 = document.createElement('a-entity');
        wheel1.setAttribute('geometry', 'primitive: cylinder; radius: 0.22; height: 0.04; segmentsRadial: 32');
        wheel1.setAttribute('material', 'color: #222');
        wheel1.setAttribute('position', '0.55 0.65 0');
        wheel1.setAttribute('rotation', '90 0 0');
        avatar.appendChild(wheel1);
        const wheel2 = document.createElement('a-entity');
        wheel2.setAttribute('geometry', 'primitive: cylinder; radius: 0.22; height: 0.04; segmentsRadial: 32');
        wheel2.setAttribute('material', 'color: #222');
        wheel2.setAttribute('position', '-0.55 0.65 0');
        wheel2.setAttribute('rotation', '90 0 0');
        avatar.appendChild(wheel2);

        document.querySelector('a-scene').appendChild(avatar);
        return avatar;
    }

    //Setter for avatar speed
    setSpeed(speed) {
        this.speed = speed;
    }

    update(dt) {
        if (this.speed === 0) {
            return;
        }

        //Leg Animation
        const now = performance.now() / 1000;
        //Animate: swing legs back and forth based on speed (max ±35deg at 50km/h
        const maxSwing = 35; //Degrees
        //Frequency: 1.5 Hz at 30 km/h, scale with speed
        const freq = 0.5 + Math.abs(this.speed) * 0.12; //Hz
        const phase = now * freq * 2 * Math.PI;
        const swing = Math.sin(phase) * Math.min(maxSwing, Math.abs(this.speed) * 0.7);
        if (this.legEntities.length === 2) {
            this.legEntities[0].setAttribute('rotation', `10 0 ${10 + swing}`);
            this.legEntities[1].setAttribute('rotation', `-10 0 ${-10 - swing}`);
        }
    }
}