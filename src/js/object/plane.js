window.THREE = require('three');

(function(){
  /**
   * Planeクラス
   */
  var Plane = window.Plane || {};

  window.Plane = function () {
    //Planeクラスをイニシャライズ
    p.init();
  };

  var p, s;

  s = window.Plane;
  p = s.prototype;

  /**
   * Planeクラスイニシャライズ
   **/
  p.init = function () {
    var self = this;

    //planeGeometry
    self.planeGeometry = new THREE.PlaneGeometry(60, 40, 1, 1);

    //planeMaterial
    self.planeMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff
    });

    //plane
    self.PlaneObject = new THREE.Mesh(self.planeGeometry, self.planeMaterial);
    self.PlaneObject.receiveShadow = true;
    //planeを回転
    self.PlaneObject.rotation.x = -0.5 * Math.PI;
    self.PlaneObject.position.x = 0;
    self.PlaneObject.position.y = 0;
    self.PlaneObject.position.z = 0;

    //オブジェクトとしてPlaneObject返す
    return self.PlaneObject;
  };

})();