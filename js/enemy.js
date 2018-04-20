THREE.EnemyPrefab = function(scene, dimension) {
  var bodyGeometry = new THREE.BoxBufferGeometry(dimension, 2 * dimension, dimension);
  var bodyMaterial = new THREE.MeshBasicMaterial({color: 0xdd97e5});
  this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);

  var headGeometry = new THREE.TetrahedronBufferGeometry(dimension);
  var headMaterial = new THREE.MeshBasicMaterial({color: 0xe29ad0});
  this.head = new THREE.Mesh(headGeometry, headMaterial);
  this.head.position.set(0, 1.5 * dimension, 0);
  this.head.rotation.set(Math.PI / 4, -Math.PI / 4, 0);

  this.enemyPrefab = new THREE.Group();
  this.enemyPrefab.add(this.body);
  this.enemyPrefab.add(this.head);
  scene.add(this.enemyPrefab);
}