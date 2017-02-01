window.THREE = require('three');

/**
 * Camera
 */

'use strict';


var Camera = (function () {

  function Camera() {
    this.init.apply(this, arguments);
  }

  var p, s;

  s = Camera;
  p = s.prototype;

  p.init = function() {
    this.camera;
    this.vec3 = new THREE.Vector3(0,0,0);

    this.setup();
    this.create();

    this.update();
  };

  p.setup = function() {

    // console.log('this',this);
    // console.log('Camera_setup!!!!!');

  };

  //
  p.create = function () {
    // this.scene = new THREE.Camera();

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

    this.camera.position.x = -300;
    this.camera.position.y = 400;
    this.camera.position.z = 300;
    // this.camera.lookAt( gb.in.scene.scene.position );
    this.camera.lookAt(this.vec3);
    // window.console.log('A',this.camera);
  };

  //
  p.update = function () {

    // window.console.log('B',this.camera);
    // this.camera.position.x = Math.cos(this.timer) * 500;
    // this.camera.position.y = Math.sin(this.timer*2) * 100;
    // this.camera.position.z = Math.sin(this.timer) * 100 + 200;
    // //
    // this.camera.lookAt(this.vec3);

    // this.lookat_x = Math.sin(this.timer*0.8)*10;
    // this.lookat_y = Math.cos(this.timer*2)*10;
    // this.camera.lookAt(new THREE.Vector3(this.lookat_x, this.lookat_y, 0));
    // gb.in.camera.lookAt(new THREE.Vector3(0, 0, 0));

    // requestAnimationFrame(p.update);
    // gb.in.renderer.render(gb.in.scene.scene, this.camera);
  };

  //
  p.setEvents = function () {

  };

  return Camera;

}());

module.exports = Camera;
