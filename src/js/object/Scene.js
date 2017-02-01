window.THREE = require('three');

/**
 * Scene
 */

'use strict';

var Scene = (function () {

  function Scene() {
    this.init.apply(this, arguments);
  }

  var p, s;

  s = Scene;
  p = s.prototype;

  p.init = function() {
    this.scene;

    this.setup();
    this.create();
  };

  p.setup = function() {

    // console.log('this',this);
    // console.log('Scene_setup!!!!!');

  };

  //
  p.create = function () {
    this.scene = new THREE.Scene();
  };

  //
  p.update = function () {

  };

  //
  p.setEvents = function () {

  };

  return Scene;

}());

module.exports = Scene;
