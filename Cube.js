// Cube Class
class Cube {
  constructor() {
    this.type='cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    //this.size = 5.0;
    //this.segments = 10;
    this.matrix = new Matrix4();
    this.textureNum = -2; // default is color
  }

  render() {
    //var xy = this.position;
    var rgba = this.color;
    //var size = this.size;

    // Pass the texture number to u_WhichTexture
    gl.uniform1i(u_WhichTexture, this.textureNum);

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);

    // Front side of cube
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    drawTriangle3DUV([0,0,0,  1,1,0,  1,0,0], [0,0,  1,1,  1,0]);
    drawTriangle3DUV([0,0,0,  0,1,0,  1,1,0], [0,0,  0,1,  1,1]);

    // Top side of cube
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    drawTriangle3DUV([1,1,0,  0,1,1,  1,1,1], [1,0,  0,1,  1,1]);
    drawTriangle3DUV([1,1,0,  0,1,1,  0,1,0], [1,0,  0,1,  0,0]);

    // Bottom side of cube
    gl.uniform4f(u_FragColor, rgba[0] * 0.6, rgba[1] * 0.6, rgba[2] * 0.6, rgba[3]);
    drawTriangle3DUV([1,0,0,  0,0,1,  1,0,1], [1,1,  0,0,  1,0]);
    drawTriangle3DUV([1,0,0,  0,0,1,  0,0,0], [1,1,  0,0,  0,1]);

    // Back side of cube
    gl.uniform4f(u_FragColor, rgba[0] * 0.7, rgba[1] * 0.7, rgba[2] * 0.7, rgba[3]);
    drawTriangle3DUV([0,0,1,  1,1,1,  1,0,1], [1,0,  0,1,  0,0]);
    drawTriangle3DUV([0,0,1,  0,1,1,  1,1,1], [1,0,  1,1,  0,1]);

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
   
    // Right side of cube
    drawTriangle3DUV([1,1,0,  1,0,1,  1,0,0], [0,1,  1,0,  0,0]);
    drawTriangle3DUV([1,1,0,  1,0,1,  1,1,1], [0,1,  1,0,  1,1]);

    // Left side of cube
    drawTriangle3DUV([0,1,0,  0,0,1,  0,0,0], [1,1,  0,0,  1,0]);
    drawTriangle3DUV([0,1,0,  0,0,1,  0,1,1], [1,1,  0,0,  0,1]);

  }
}
