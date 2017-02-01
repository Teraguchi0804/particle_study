window.THREE = require('three');
var Stats = require('./libs/stats.js');
var dat　= require('dat-gui');

require('./object/Plane.js');
// require('./libs/ParametricGeometries.js');
// require('./libs/ConvexGeometry.js');

var Scene = require('./object/Scene.js');
var Camera = require('./object/Camera.js');

var Cube = require('./object/Cube.js');

'use strict';

(function() {

  // globalオブジェクト
  if (window.gb === undefined) window.gb = {};
  window.gb.in = {}; //instance

  var sample = window.sample || {};
  window.sample = sample;

  //初期化実行
  $(function() {
    new sample.MainDisplay();
  });

})();



//Planeをインスタンス化
var PlaneObject = new Plane();

(function(){
  var sample = window.sample || {};
  window.sample = sample;

  /**
   * メインクラス
   */
  sample.MainDisplay = function () {
    //イニシャライズ
    p.init();
  };

  var p, s;

  s = sample.MainDisplay;
  p = s.prototype;

  var renderScene;

  /**
   * イニシャライズ
   */
  p.init = function () {
    var self = this;

    var stats = initStats();

    this.$window = $(window);
    this.$MainDisplay = $('#WebGL-output');

    this.timer += 0.01;

    //WebGL renderer
    gb.in.renderer = this.renderer = new THREE.WebGLRenderer({antialias: true});
    if (!this.renderer) {
      alert('Three.jsの初期化に失敗しました。');
    }
    this.renderer.setClearColor(new THREE.Color(0xEEEEEE));
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.shadowMap.enabled = true;

    // 高解像度対応
    var pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(pixelRatio);

    //scene
    gb.in.scene = new Scene();
    this.scene = gb.in.scene.scene;

    //camera
    gb.in.camera = new Camera();
    this.camera = gb.in.camera.camera;

    // add subtle ambient lighting
    var ambientLight = new THREE.AmbientLight(0x090909);
    this.scene.add(ambientLight);

    // add spotlight for the shadows
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-25, 25, 32);
    spotLight.castShadow = true;
    this.scene.add(spotLight);

    // window resize
    this.$window.on('resize', function(e) {
      self.onResize();
    });

    // resizeイベントを発火してキャンバスサイズをリサイズ
    this.$window.trigger('resize');


    //Planeをシーンに追加
    this.scene.add(PlaneObject.init());

    //Cubeをインスタンス化
    gb.in.CubeObject = new Cube();
    this.CubeObject = gb.in.CubeObject.cube;
    // window.console.log(this.CubeObject);

    // //Cubeをシーンに追加
    this.scene.add(this.CubeObject);

    //sphereGeometry
    var sphereGeometry = new THREE.SphereGeometry(4, 20,20);

    //sphereMaterial
    var sphereMaterial = new THREE.MeshLambertMaterial({
      color: 0x7777ff, wireframe: false
    });

    //sphere
    var sphere = new THREE.Mesh(sphereGeometry,sphereMaterial);
    sphere.castShadow = true;
    //sphereを回転
    sphere.position.x = 20;
    sphere.position.y = 4;
    sphere.position.z = 2;
    // this.scene.add(sphere);


    document.getElementById("WebGL-output").appendChild(this.renderer.domElement);

    // window.console.log(this.CubeObject.setup());

    renderScene = function () {
      stats.update();

      // rotate the cube around its axes
      this.CubeObject.rotation.x += 0.02;
      this.CubeObject.rotation.y += 0.02;
      this.CubeObject.rotation.z += 0.02;

      step += 0.01;
      this.camera.position.z += (this.CubeObject.position.z+100 - this.camera.position.z)*0.1;
      this.camera.position.y += (this.CubeObject.position.y+50 - this.camera.position.y)*0.1;
      // this.camera.position.x = Math.cos(step) * 200;
      // this.camera.position.y = Math.sin(step*2) * 90;
      // this.camera.position.z = Math.sin(step) * 90 + 200;

      this.lookat_x = Math.sin(step*0.4)*50;
      this.lookat_y = Math.cos(step*1.4)*50;
      this.camera.lookAt(new THREE.Vector3(this.lookat_x, this.lookat_y, 0));


      // bounce the sphere up and down
      // step += 0.04;
      // sphere.position.x = 20 + ( 10 * (Math.cos(step)));
      // sphere.position.y = 2 + ( 10 * Math.abs(Math.sin(step)));

      // render using requestAnimationFrame
      requestAnimationFrame(renderScene);
      this.renderer.render(this.scene, this.camera);
      // this.updateAnimation();
    }.bind(this);

    // call the render function
    var step = 0;
    renderScene();



    /**
     * dat.gui
     * dat.guiのコントローラーを定義
     */
    var controls = new function () {
      this.rotationSpeed = 0.001;
      this.bouncingSpeed = 0.001;
    };

    var gui = new dat.GUI();
    gui.add(controls, 'rotationSpeed', 0, 0.1);
    gui.add(controls, 'bouncingSpeed', 0, 0.1);

    // var render =  function() {
    //   stats.update();
    //
    //
    //
    //
    //   // window.console.log('CubeX',CubeObject.init().rotation.x);
    //   // rotate the cube around its axes
    //   // CubeObject.init().rotation.x += controls.rotationSpeed;
    //   // CubeObject.init().rotation.y += controls.rotationSpeed;
    //   // CubeObject.init().rotation.z += controls.rotationSpeed;
    //
    //   // bounce the sphere up and down
    //   // step += controls.bouncingSpeed;
    //   // sphere.position.x = 20 + ( 10 * (Math.cos(step)));
    //   // sphere.position.y = 2 + ( 10 * Math.abs(Math.sin(step)));
    //
    //   requestAnimationFrame(render);
    //   this.renderer.render(this.scene, this.camera);
    // }.bind(this);
    // render();

  };

  //Stats表示設定
  function initStats() {

    var stats = gb.in.stats = new Stats();

    stats.setMode(0); // 0: fps, 1: ms

    // Align top-left
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    document.getElementById("Stats-output").appendChild(stats.domElement);

    return stats;
  }

  /**
   * アニメーション開始
   */
  // p.start = function() {
  //   var self = this;
  //
  //   var enterFrameHandler = function() {
  //     requestAnimationFrame(enterFrameHandler);
  //     self.update();
  //   };
  //
  //   enterFrameHandler();
  // }

  /**
   * アニメーションループ内で実行される
   */
  p.updateAnimation = function() {
    requestAnimationFrame(renderScene);
    this.renderer.render(this.scene, this.camera);
  };


  /**
   * リサイズ処理
   */
  p.onResize = function () {

    this.width = this.$window.width();
    this.height = this.$window.height();

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
  };



  // p.createDatGUIBox = function () {

  // };

})();