THREE.ColladaRaycaster = function(origin, direction, min, max) {
  this.ray = new THREE.Ray(origin, direction);
  this.min = min || 0;
  this.max = max || Infinity;

  this.set = function(origin, direction) {
    this.ray.set(origin, direction);
  }

  this.raycast = function(objects) {
    var intersections = [];
    for(var i = 0; i < objects.length; i++) {
      checkRaycast(objects[i], this, intersections);
    }

    intersections.sort(distanceSort);
    return intersections;
  }
}

function distanceSort(a, b) {
  return a.distance - b.distance;
}

function checkRaycast(object, raycaster, intersections) {
  if(object.visible === false) return;
  raycast(object, raycaster, intersections);

  var children = object.children;

  for(var i = 0; i < children.length; i++) {
    checkRaycast(children[i], raycaster, intersections);
  }
}


var inverseMatrix = new THREE.Matrix4();
var ray = new THREE.Ray();
var sphere = new THREE.Sphere();

function raycast(object, raycaster, intersections) {
  var geometry = object.geometry;
  var material = object.material;
  var matrixWorld = object.matrixWorld;

  if(material === undefined) return;

  if(geometry.boundingSphere === null) geometry.computeBoundingSphere();
  sphere.copy(geometry.boundingSphere);
  sphere.applyMatrix4(matrixWorld);
  if(raycaster.ray.intersectsSphere(sphere) === false) return;

  inverseMatrix.getInverse(matrixWorld);
  ray.copy(raycaster.ray).applyMatrix4(inverseMatrix);

  if(geometry.boundingBox !== null)
    if(ray.intersectsBox(geometry.boundingBox) === false) return;

  var intersection;
  var a, b, c;
  var position = geometry.attributes.position;
  var uv = geometry.attributes.uv;
  for(var i = 0; i < position.count; i += 3) {
    a = i;
    b = i + 1;
    c = i + 2;

    intersection = intersectObjects(object, raycaster, ray, position, uv, a, b, c);
    if(intersection) {
      intersection.index = a;
      intersections.push(intersection);
    }
  }
}


var v0 = new THREE.Vector3();
var v1 = new THREE.Vector3();
var v2 = new THREE.Vector3();
var v3 = new THREE.Vector3();

var uv1 = new THREE.Vector2();
var uv2 = new THREE.Vector2();
var uv3 = new THREE.Vector2();

var intersectionPoint = new THREE.Vector3();
var intersectionPointWorld = new THREE.Vector3();
var faceNormal = new THREE.Vector3();

function intersectObjects(object, raycaster, ray, position, uv, a, b, c) {
  v1.fromBufferAttribute(position, a);
  v2.fromBufferAttribute(position, b);
  v3.fromBufferAttribute(position, c);

  var intersect;
  if(object.material.side === 0)
    intersect = intersectTriangle(ray, v1, v2, v3, true, intersectionPoint);
  if(object.material.side === 1)
    intersect = intersectTriangle(ray, v3, v2, v1, true, intersectionPoint);
  else
    intersect = intersectTriangle(ray, v1, v2, v3, false, intersectionPoint);
  if(intersect === null)
    return null;

  intersectionPointWorld.copy(intersectionPoint);
  intersectionPointWorld.applyMatrix4(object.matrixWorld);

  var intersection;
  var distance = raycaster.ray.origin.distanceTo(intersectionPointWorld);
  if(distance >= raycaster.min && distance <= raycaster.max) {
    intersection = {
      distance: distance,
      point: intersectionPointWorld.clone(),
      object: object
    };

    if(uv) {
      uv1.fromBufferAttribute(uv, a);
      uv2.fromBufferAttribute(uv, b);
      uv3.fromBufferAttribute(uv, c);
      intersection.uv = intersectUV(intersectionPoint, v1, v2, v3, uv1, uv2, uv3);
    }

    var face = new THREE.Face3(a, b, c);
    faceNormal.subVectors(c, b);
    v0.subVectors(a, b);
    faceNormal.cross(v0);

    if(faceNormal.length() > 0)
      faceNormal.normalize();
    else
      faceNormal.set(0, 0, 0);
    face.normal = faceNormal;

    intersection.face = face;
    intersection.faceIndex = a;
  }
  return intersection;
}


var diff = new THREE.Vector3();
var edge1 = new THREE.Vector3();
var edge2 = new THREE.Vector3();
var normal = new THREE.Vector3();

function intersectTriangle(ray, a, b, c, backfaceCulling, target) {
  edge1.subVectors(b, a);
  edge2.subVectors(c, a)
  normal.crossVectors(edge1, edge2);

  var DdotN = ray.direction.dot(normal);
  var sign;

  if(DdotN > 0) {
    if(backfaceCulling) return null;
    sign = 1;
  } else if(DdotN < 0) {
    sign = -1;
    DdotN = -DdotN;
  } else {
    return null;
  }

  diff.subVectors(ray.origin, a);
  edge2.crossVectors(diff, edge2);
  var DdotOcrossE2 = sign * ray.direction.dot(edge2);
  if(DdotOcrossE2 < 0)
    return null;

  edge1.crossVectors(edge1, diff);
  var DdotE1crossO = sign * ray.direction.dot(edge1);
  if(DdotE1crossO < 0)
    return null;

  if(DdotOcrossE2 + DdotE1crossO > DdotN)
    return null;

  var OdotN = -sign * diff.dot(normal);
  if(OdotN < 0)
    return null;

  return ray.at(OdotN / DdotN, target);
}


var e1 = new THREE.Vector3();
var e2 = new THREE.Vector3();
var e3 = new THREE.Vector3();

function intersectUV(point, v1, v2, v3, uv1, uv2, uv3) {
  e1.subVectors(v3, v1);
  e2.subVectors(v2, v1);
  e3.subVectors(point, v1);

  var dot11 = e1.dot(e1);
  var dot12 = e1.dot(e2);
  var dot13 = e1.dot(e3);
  var dot22 = e2.dot(e2);
  var dot23 = e2.dot(e3);
  var denom = dot11 * dot22 - dot12 * dot12;
  if(denom === 0)
    return null;

  var invDenom = 1 / denom;
  var u = (dot22 * dot13 - dot12 * dot23) * invDenom;
  var v = (dot11 * dot23 - dot12 * dot13) * invDenom;

  uv1.multiplyScalar(1 - u - v);
  uv2.multiplyScalar(v);
  uv3.multiplyScalar(u);
  uv1.add(uv2).add(uv3);

  return uv1.clone();
}