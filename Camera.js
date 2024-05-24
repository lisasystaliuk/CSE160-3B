// set camera
var camera;

class Camera {
  constructor() {
    this.type = 'camera';
    this.fov = 60;
    this.eye = new Vector3([0, 0, 3]);
    this.at = new Vector3([0, 0, -100]);
    this.up = new Vector3([0, 1, 0]);
    this.speed = 0.1;
    this.n = 1.1;

    this.viewMat = new Matrix4();
    this.viewMat.setLookAt(
      this.eye.elements[0],this.eye.elements[1],this.eye.elements[2], 
      this.at.elements[0], this.at.elements[1], this.at.elements[2], 
      this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    this.projMat = new Matrix4();
    this.projMat.setPerspective(this.fov, canvas.width/canvas.height, 0.1, 100);
  }

  moveForward() {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    f.normalize();
    f.mul(this.speed);

    this.eye.add(f);
    this.at.add(f);

    this.viewMat.setLookAt(
      this.eye.elements[0],this.eye.elements[1],this.eye.elements[2], 
      this.at.elements[0],this.at.elements[1],this.at.elements[2], 
      this.up.elements[0],this.up.elements[1],this.up.elements[2]);
  }

  moveBackward() {
    let b = new Vector3();
    b.set(this.eye);
    b.sub(this.at);
    b.normalize();
    b.mul(this.speed);

    this.eye.add(b);
    this.at.add(b);

    this.viewMat.setLookAt(
      this.eye.elements[0],this.eye.elements[1],this.eye.elements[2], 
      this.at.elements[0],this.at.elements[1],this.at.elements[2], 
      this.up.elements[0],this.up.elements[1],this.up.elements[2]);
  }

  moveLeft() {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    f.normalize();
    f.mul(this.speed);
    let s = Vector3.cross(this.up, f);
    s.normalize();
    s.mul(this.speed);
    this.eye.add(s);
    this.at.add(s);
    this.viewMat.setLookAt(
      this.eye.elements[0],this.eye.elements[1],this.eye.elements[2], 
      this.at.elements[0],this.at.elements[1],this.at.elements[2], 
      this.up.elements[0],this.up.elements[1],this.up.elements[2]);
  }

  moveRight() {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    f.normalize();
    f.mul(this.speed);
    let s = Vector3.cross(f, this.up);
    s.normalize();
    s.mul(this.speed);
    this.eye.add(s);
    this.at.add(s);
    this.viewMat.setLookAt(
      this.eye.elements[0],this.eye.elements[1],this.eye.elements[2], 
      this.at.elements[0],this.at.elements[1],this.at.elements[2], 
      this.up.elements[0],this.up.elements[1],this.up.elements[2]);
  }

  moveUp() {
    let f = new Vector3([0, 1, 0]);
    f.mul(this.speed);
    this.eye.add(f);
    this.at.add(f);
    this.viewMat.setLookAt(
      this.eye.elements[0],this.eye.elements[1],this.eye.elements[2], 
      this.at.elements[0],this.at.elements[1],this.at.elements[2], 
      this.up.elements[0],this.up.elements[1],this.up.elements[2]);
  }

  moveDown() {
    let f = new Vector3([0, -1, 0]);
    f.mul(this.speed);
    this.eye.add(f);
    this.at.add(f);
    this.viewMat.setLookAt(
      this.eye.elements[0],this.eye.elements[1],this.eye.elements[2], 
      this.at.elements[0],this.at.elements[1],this.at.elements[2], 
      this.up.elements[0],this.up.elements[1],this.up.elements[2]);
  }

  rotateUp(y) {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    f.normalize();

    let s = Vector3.cross(f, this.up);
    s.normalize();

    let r = new Matrix4().rotate(this.n * y, s.elements[0],s.elements[1],s.elements[2]);
    let f_prime = r.multiplyVector3(f);

    this.at.set(this.eye);
    this.at.add(f_prime);

    this.viewMat.setLookAt(
      this.eye.elements[0],this.eye.elements[1],this.eye.elements[2], 
      this.at.elements[0],this.at.elements[1],this.at.elements[2], 
      this.up.elements[0],this.up.elements[1],this.up.elements[2]);
  }

  rotateRight(x) {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    f.normalize();

    let r = new Matrix4().rotate(this.n * -x, this.up.elements[0],this.up.elements[1],this.up.elements[2]);
    let f_prime = r.multiplyVector3(f);

    this.at.set(this.eye);
    this.at.add(f_prime);

    this.viewMat.setLookAt(
      this.eye.elements[0],this.eye.elements[1],this.eye.elements[2], 
      this.at.elements[0],this.at.elements[1],this.at.elements[2], 
      this.up.elements[0],this.up.elements[1],this.up.elements[2]);
  }

  rotateDown(y) {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    f.normalize();

    let s = Vector3.cross(f, this.up);
    s.normalize();

    let r = new Matrix4().rotate(this.n * y, s.elements[0],s.elements[1],s.elements[2]);
    let f_prime = r.multiplyVector3(f);

    this.at.set(this.eye);
    this.at.add(f_prime);

    this.viewMat.setLookAt(
      this.eye.elements[0],this.eye.elements[1],this.eye.elements[2], 
      this.at.elements[0],this.at.elements[1],this.at.elements[2], 
      this.up.elements[0],this.up.elements[1],this.up.elements[2]);
  }

  rotateLeft(x) {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    f.normalize();

    let r = new Matrix4().rotate(this.n * -x, this.up.elements[0],this.up.elements[1],this.up.elements[2]);
    let f_prime = r.multiplyVector3(f);

    this.at.set(this.eye);
    this.at.add(f_prime);

    this.viewMat.setLookAt(
      this.eye.elements[0],this.eye.elements[1],this.eye.elements[2], 
      this.at.elements[0],this.at.elements[1],this.at.elements[2], 
      this.up.elements[0],this.up.elements[1],this.up.elements[2]);
  }
}