/* global AFRAME */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
 * A-Frame Spline Follower Component component for A-Frame.
 */
AFRAME.registerComponent('follow-spline', {
  schema: {
    showpath: { type: 'boolean' },
    closed: { type: 'boolean' },
    tension: { type: 'number', default: 0.5 },
    preset: { type: 'string', default: null },
    points: { default: [] }
  },

  init: function () {
    this.defaultPath = 'orbit';
    this.paths = {
      orbit: {
        points: ['0 1 2', '2 1 0', '0 1 -2', '-2 1 0']
      }
    }
    this.dolly = new THREE.Object3D();
    this.object = this.el.object3D;
    this.timeIndex = 0;
  },

  update: function () {
    var preset = !this.data.preset ? this.defaultPath : this.data.preset;
    var points = this.data.points.length > 0 ? this.data.points : this.paths[preset].points;

    points = points.map(function (point) {
      var value = point.split(' ').map( function (x) { return parseInt(x); });
      return new THREE.Vector3(value[0], value[1], value[2]);
    })

    this.spline = new THREE.CatmullRomCurve3(points);

    if (this.data.showpath) {
      var geometry = new THREE.Geometry();
      geometry.vertices = this.spline.getPoints(50);
      var material = new THREE.LineBasicMaterial({ color : 0xff0000 });
      var line = new THREE.Line(geometry, material);
      this.el.parentNode.object3D.add(line);
      this.line = line;
    }

    if (!this.data.showpath && this.line) {
      this.line.parent.remove(this.line);
    }
  },

  tick: function () {
    this.timeIndex++;
    if (this.timeIndex > 500) {
      this.timeIndex = 0;
    }
    var pos = this.spline.getPoint(this.timeIndex / 500);

    this.dolly.position.x = pos.x;
    this.dolly.position.y = pos.y;
    this.dolly.position.z = pos.z;

    this.el.setAttribute('position', {
      x: this.dolly.position.x,
      y: this.dolly.position.y,
      z: this.dolly.position.z
    });
  }
});