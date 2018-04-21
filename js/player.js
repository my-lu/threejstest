THREE.PlayerPrefab = function(object, weaponModel) {
  this.object = object;
  this.weapon = weaponModel;

  this.raycastDown = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 1);
  this.raycastUp = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, 1, 0), 0, 1);
  this.raycastLeft = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(1, 0, 0), 0, 1);
  this.raycastRight = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(-1, 0, 0), 0, 1);
  this.raycastFront = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, 0, 1), 0, 1);
  this.raycastBack = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, 0, -1), 0, 1);

  this.checkDownwardCollision = function(objects) {
    var position = this.object.position;
    position.x += 5;
    position.y -= 10;
    position.z += 5;
    this.raycastDown.ray.origin.copy(position);
    var intersections = this.raycastDown.intersectObjects(objects);
    var collided = intersections.length > 0;
    if(collided) return true;

    position = this.object.position;
    position.x -= 5;
    position.y -= 10;
    position.z += 5;
    this.raycastDown.ray.origin.copy(position);
    intersections = this.raycastDown.intersectObjects(objects);
    collided = intersections.length > 0;
    if(collided) return true;

    position = this.object.position;
    position.x += 5;
    position.y -= 10;
    position.z -= 5;
    this.raycastDown.ray.origin.copy(position);
    intersections = this.raycastDown.intersectObjects(objects);
    collided = intersections.length > 0;
    if(collided) return true;

    position = this.object.position;
    position.x -= 5;
    position.y -= 10;
    position.z -= 5;
    this.raycastDown.ray.origin.copy(position);
    intersections = this.raycastDown.intersectObjects(objects);
    collided = intersections.length > 0;
    if(collided) return true;

    return false;
  }
}