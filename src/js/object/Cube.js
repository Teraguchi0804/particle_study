window.THREE = require('three');
var Stats = require('../libs/stats.js');

/**
 * Cube
 */
'use strict';

var Cube = (function () {
  // globalオブジェクト
  if (window.gb === undefined) window.gb = {};
  window.gb.in = {}; //instance


  function Cube() {
    this.init.apply(this, arguments);
  }

  var p, s;

  s = Cube;
  p = s.prototype;

  p.init = function() {
    this.cube = null;
    this.geometry = null;
    this.material = null;

    //イニシャライズ実行
    this.setup();

    this.update();
  };

  p.setup = function() {
    // console.log('this',this);
    // console.log('Cube_setup!!!!!');

    //cubeGeometry
    this.geometry = new THREE.BoxGeometry(10,10,10);

    //cubeMaterial
    this.material = new THREE.MeshLambertMaterial({
      color: 0xff0000, wireframe: false
    });

    this.cube = new THREE.Mesh(this.geometry, this.material);
    this.cube.castShadow = true;
    //Cubeを回転
    this.cube.position.x = -4;
    this.cube.position.y = 3;
    this.cube.position.z = 0;

    // this.cube.rotation.x += 0.02;
    // this.cube.rotation.y += 0.02;
    // this.cube.rotation.z += 0.02;

    return this.cube;

  };

  //
  p.create = function () {

  };

  //
  p.update = function () {

    // this.CubeObject.cube.rotation.x += 0.02;
    // this.cube.rotation.x += 0.02;
    //
    // gb.in.renderer.render(gb.in.scene.scene, gb.in.camera.camera);
    // requestAnimationFrame(p.update);

  };

  //
  p.setEvents = function () {

  };

  return Cube;

  //グローバルオブジェクト化
  // gb.Cube = Cube;

}());

module.exports = Cube;

//   p.animate = function () {
//     var self = this;
//
//     // self.CubeObject.rotation.x += 0.02;
//     // self.CubeObject.rotation.y += 0.02;
//     // self.CubeObject.rotation.z += 0.02;
//
//   };
