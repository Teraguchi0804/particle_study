window.THREE = require('three');
var Stats = require('./libs/stats.js');
var dat　= require('dat-gui');

require('./libs/OrbitControls.js');
var GPUComputationRenderer = require('./libs/GPUComputationRenderer.js');

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
// var PlaneObject = new Plane();

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

  // 今回は25万パーティクルを動かすことに挑戦
  // なので1辺が500のテクスチャを作る。
  // 500 * 500 = 250000
  var WIDTH = 500;
  var PARTICLES = WIDTH * WIDTH;

  var geometry;

  // gpgpuをするために必要なオブジェクト達
  var gpuCompute;
  var velocityVariable;
  var positionVariable;
  var positionUniforms;
  var velocityUniforms;
  var particleUniforms;
  var effectController;

  /**
   * イニシャライズ
   */
  p.init = function () {
    var self = this;

    //
    var stats = initStats();


    this.$window = $(window);
    this.$MainDisplay = $('#WebGL-output');

    this.timer += 0.01;

    //WebGL renderer
    gb.in.renderer = this.renderer = new THREE.WebGLRenderer({antialias: true});
    if (!this.renderer) {
      alert('Three.jsの初期化に失敗しました。');
    }
    this.renderer.setClearColor(new THREE.Color(0x000000));
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

    //
    gb.in.controls = new THREE.OrbitControls(this.camera);
    this.controls = gb.in.controls;
    this.controls.update();

    // window resize
    this.$window.on('resize', function(e) {
      self.onResize();
    });

    // resizeイベントを発火してキャンバスサイズをリサイズ
    this.$window.trigger('resize');


    document.getElementById("WebGL-output").appendChild(this.renderer.domElement);

    // ***** このコメントアウトについては後述 ***** //
    //        effectController = {
    //            time: 0.0,
    //        };


    // ①gpuCopute用のRenderを作る
    p.initComputeRenderer();

    // ②particle 初期化
    initPosition();

    /**
     * dat.gui
     * dat.guiのコントローラーを定義
     */
    var controls = new function () {
      this.rotationSpeed = 0.001;
      this.bouncingSpeed = 0.001;
    };

    var gui = new dat.GUI();
    // gui.add(controls, 'rotationSpeed', 0, 0.1);
    // gui.add(controls, 'bouncingSpeed', 0, 0.1);

    var render =  function() {
      stats.update();

      gpuCompute.compute();

      // Three.js用のGPGPUライブラリでは、以下のように情報を更新することができる。
      // 現在の情報を、保存用のメモリに格納するおまじない。
      particleUniforms.texturePosition.value = gpuCompute.getCurrentRenderTarget( positionVariable ).texture;
      particleUniforms.textureVelocity.value = gpuCompute.getCurrentRenderTarget( velocityVariable ).texture;

      requestAnimationFrame(render);
      this.renderer.render(this.scene, this.camera);
    }.bind(this);
    render();

  };

  //Stats表示設定
  function initStats() {

    var stats = new Stats();

    stats.setMode(0); // 0: fps, 1: ms

    // Align top-left
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    document.getElementById("Stats-output").appendChild(stats.domElement);

    return stats;
  }

  // ①gpuCopute用のRenderを作る
  p.initComputeRenderer = function() {

    // gpgpuオブジェクトのインスタンスを格納
    gpuCompute = new GPUComputationRenderer(WIDTH, WIDTH, gb.in.renderer);

    // 今回はパーティクルの位置情報と、移動方向を保存するテクスチャを2つ用意します
    var dtPosition = gpuCompute.createTexture();
    var dtVelocity = gpuCompute.createTexture();

    // テクスチャにGPUで計算するために初期情報を埋めていく
    fillTextures( dtPosition, dtVelocity );

    // shaderプログラムのアタッチ
    velocityVariable = gpuCompute.addVariable( "textureVelocity", require('../glsl/computeShaderVelocity.frag'), dtVelocity );
    positionVariable = gpuCompute.addVariable( "texturePosition", require('../glsl/computeShaderPosition.frag'), dtPosition );

    // 一連の関係性を構築するためのおまじない
    gpuCompute.setVariableDependencies( velocityVariable, [ positionVariable, velocityVariable ] );
    gpuCompute.setVariableDependencies( positionVariable, [ positionVariable, velocityVariable ] );


    // uniform変数を登録したい場合は以下のように作る
    /*
     positionUniforms = positionVariable.material.uniforms;
     velocityUniforms = velocityVariable.material.uniforms;

     velocityUniforms.time = { value: 0.0 };
     positionUniforms.time = { ValueB: 0.0 };
     ***********************************
     たとえば、上でコメントアウトしているeffectControllerオブジェクトのtimeを
     わたしてあげれば、effectController.timeを更新すればuniform変数も変わったり、ということができる
     velocityUniforms.time = { value: effectController.time };
     ************************************
     */

    // error処理
    var error = gpuCompute.init();
    if ( error !== null ) {
      console.error( error );
    }
  }

  // restart用関数 今回は使わない
  // function restartSimulation() {
  //   var dtPosition = gpuCompute.createTexture();
  //   var dtVelocity = gpuCompute.createTexture();
  //   fillTextures( dtPosition, dtVelocity );
  //   gpuCompute.renderTexture( dtPosition, positionVariable.renderTargets[ 0 ] );
  //   gpuCompute.renderTexture( dtPosition, positionVariable.renderTargets[ 1 ] );
  //   gpuCompute.renderTexture( dtVelocity, velocityVariable.renderTargets[ 0 ] );
  //   gpuCompute.renderTexture( dtVelocity, velocityVariable.renderTargets[ 1 ] );
  // }

  // ②パーティクルそのものの情報を決めていく。
  function initPosition() {

    // 最終的に計算された結果を反映するためのオブジェクト。
    // 位置情報はShader側(texturePosition, textureVelocity)
    // で決定されるので、以下のように適当にうめちゃってOK

    geometry = new THREE.BufferGeometry();
    var positions = new Float32Array( PARTICLES * 3 );
    var p = 0;
    for ( var i = 0; i < PARTICLES; i++ ) {
      positions[ p++ ] = 0;
      positions[ p++ ] = 0;
      positions[ p++ ] = 0;
    }

    // uv情報の決定。テクスチャから情報を取り出すときに必要
    var uvs = new Float32Array( PARTICLES * 2 );
    p = 0;
    for ( var j = 0; j < WIDTH; j++ ) {
      for ( var i = 0; i < WIDTH; i++ ) {
        uvs[ p++ ] = i / ( WIDTH - 1 );
        uvs[ p++ ] = j / ( WIDTH - 1 );
      }
    }

    // attributeをgeometryに登録する
    geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    geometry.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );


    // uniform変数をオブジェクトで定義
    // 今回はカメラをマウスでいじれるように、計算に必要な情報もわたす。
    gb.in.particleUniforms = particleUniforms = {
      texturePosition: { value: null },
      textureVelocity: { value: null },
      cameraConstant: { value: getCameraConstant( gb.in.camera.camera ) }
    };

    // Shaderマテリアル これはパーティクルそのものの描写に必要なシェーダー
    var material = new THREE.ShaderMaterial( {
      uniforms:       particleUniforms,
      vertexShader:   require('../glsl/particleVertexShader.vert'),
      fragmentShader: require('../glsl/particleFragmentShader.frag')
    });
    material.extensions.drawBuffers = true;
    var particles = new THREE.Points( geometry, material );
    particles.matrixAutoUpdate = false;
    particles.updateMatrix();

    // パーティクルをシーンに追加
    gb.in.scene.scene.add( particles );
  }


  function fillTextures( texturePosition, textureVelocity ) {

    // textureのイメージデータをいったん取り出す
    var posArray = texturePosition.image.data;
    var velArray = textureVelocity.image.data;

    // パーティクルの初期の位置は、ランダムなXZに平面おく。
    // 板状の正方形が描かれる

    for ( var k = 0, kl = posArray.length; k < kl; k += 4 ) {
      // Position
      var x, y, z;
      x = Math.random()*500-250;
      z = Math.random()*500-250;
      y = 0;
      // posArrayの実態は一次元配列なので
      // x,y,z,wの順番に埋めていく。
      // wは今回は使用しないが、配列の順番などを埋めておくといろいろ使えて便利
      posArray[ k + 0 ] = x;
      posArray[ k + 1 ] = y;
      posArray[ k + 2 ] = z;
      posArray[ k + 3 ] = 0;

      // 移動する方向はとりあえずランダムに決めてみる。
      // これでランダムな方向にとぶパーティクルが出来上がるはず。
      velArray[ k + 0 ] = Math.random()*2-1;
      velArray[ k + 1 ] = Math.random()*2-1;
      velArray[ k + 2 ] = Math.random()*2-1;
      velArray[ k + 3 ] = Math.random()*2-1;
    }
  }

  // カメラオブジェクトからシェーダーに渡したい情報を引っ張ってくる関数
  // カメラからパーティクルがどれだけ離れてるかを計算し、パーティクルの大きさを決定するため。
  var getCameraConstant = function(camera) {
    return window.innerHeight / ( Math.tan( THREE.Math.DEG2RAD * 0.5 * camera.fov ) / camera.zoom );
  }



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

    //ここでもシェーダー側に情報を渡す。
    // gb.in.particleUniforms.cameraConstant.value = getCameraConstant(this.camera);
  };



})();