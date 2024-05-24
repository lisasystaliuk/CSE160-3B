// globals
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_WhichTexture;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;

// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler10;
  
  uniform int u_WhichTexture;
  void main() {
    if (u_WhichTexture == -2) {                     // Use color
      gl_FragColor = u_FragColor;
    } else if (u_WhichTexture == -1) {              // Use UV debug color
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    } else if (u_WhichTexture == 0) {               // Use texture 0
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_WhichTexture == 1) {               // Use texture 1
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else if (u_WhichTexture == 2) {               // Use texture 2
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    } else if (u_WhichTexture == 10) {               // Use texture 10
      gl_FragColor = texture2D(u_Sampler10, v_UV);
    } else {                                        // Error: use red
      gl_FragColor = vec4(1, 0.2, 0.2, 1);
    }
  }`

// set up WebGL
function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // enable 3D with depth test
  gl.enable(gl.DEPTH_TEST);
}

// connect variables to GLSL
function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_WhichTexture
  u_WhichTexture = gl.getUniformLocation(gl.program, 'u_WhichTexture');
  if (!u_WhichTexture) {
    console.log('Failed to get the storage location of u_WhichTexture');
    return false;
  }

  // Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }
  // Get the storage location of u_Sampler1
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }
  // Get the storage location of u_Sampler2
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return false;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  // identity matrix
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

const OFF = 0;
const ON = 1;
const bit = 2;

let g_animationSpeed = 4;
let g_globalAngle_y = 0;
let g_globalAngle_x = 0;
let g_animation = OFF;

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {
}

// Set the text of an HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}


// textures

function initTextures() {
  createAndLoadTexture(0, 'sand.jpg');
  createAndLoadTexture(1, 'sky.jpg');
  createAndLoadTexture(2, 'sand2.jpg');
  return true;
}

function createAndLoadTexture(index, path) {
  var image = new Image();
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }

  image.onload = function(){ sendImageToTEXTURE(image, index); console.log("loaded texture", index);};

  image.src = path;

  return true;
}

function sendImageToTEXTURE(image, index) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

  gl.activeTexture(getTexture(index));
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  gl.uniform1i(getSampler(index), index);

  renderAllShapes();
}

function getTexture(index) {
  switch(index) {
    case 0:
      return gl.TEXTURE0;
    case 1:
      return gl.TEXTURE1;
    case 2:
      return gl.TEXTURE2;
    case 10:
      return gl.TEXTURE10;
    default:
      return null;
  }
}

// function to choose the sampler
function getSampler(index) {
  switch(index) {
    case 0:
      return u_Sampler0;
    case 1:
      return u_Sampler1;
    case 2:
      return u_Sampler2;
    case 10:
      return u_Sampler10;
    default:
      return null;
  }
}

// render

function renderAllShapes() {
  var startTime = performance.now();

  gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projMat.elements);

  gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMat.elements);

  var globalRotMat = new Matrix4().rotate(g_globalAngle_y, 0, 1, 0);
  globalRotMat.rotate(g_globalAngle_x, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //////////////////////////////////////////

  var ground = new Cube();
  ground.textureNum = 0;
  ground.color = [0.529, 0.808, 0.922, 1];
  ground.matrix.translate(0, -0.75, 0);
  ground.matrix.scale(16, 0, 16);
  ground.matrix.translate(-0.5, 0, -0.5);
  ground.render();

  var skyBox = new Cube();
  skyBox.textureNum = 1;
  skyBox.color = [0.486, 0.988, 0, 1];
  skyBox.matrix.scale(50, 50, 50);
  skyBox.matrix.translate(-0.5, -0.5, -0.5);
  skyBox.render();

  drawMap();

  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + "&nbsp;&nbsp;  fps: " + Math.floor(10000/duration)/10, "numdot");
}

// user input

// set globals for moving mouse
g_prevX = 0;
g_prevY = 0;
g_mouse = false;

// set direction globals
var east = 0;
var south = 1;
var west = 2;
var north = 3;

// building globals
var reset = 0;
var T = 4;
var B = 5;
var build = 1;
var destroy = 2;
var g_buildMode = reset;
var hill = 10;
var g_blockType = hill;
var g_selected = null;
var g_buildHeight = 45;

// returns the WebGL coordinates click
function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate
  var y = ev.clientY; // y coordinate
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x, y]);
}


// for keyCodes
var intervals = {};

// for keyCodes
var keySelect = {
  16: function() { // shift
    camera.moveDown();
    selectBlocks();
  },
  32: function() { // space
    camera.moveUp();
    selectBlocks();
  },
  65: function() { // a
    camera.moveLeft();
    selectBlocks();
  },
  68: function() { // d
    camera.moveRight();
    selectBlocks();
  },
  69: function() { // e
    camera.rotateRight(5);
    selectBlocks();
  },
  81: function() { // q
    camera.rotateLeft(-5);
    selectBlocks();
  },
  83: function() { // s
    camera.moveBackward();
    selectBlocks();
  },
  87: function() { // w
    camera.moveForward();
    selectBlocks();
  }
};

var keysUsed = [87, 65, 83, 68,  32,    16,  38, 40, 81, 69];

// run these once after clicked
var clickedKeys = [37, 39];

// function key down
function keydown(ev) {
  if (keysUsed.includes(ev.keyCode) && !intervals[ev.keyCode]) {
    intervals[ev.keyCode] = setInterval(keySelect[ev.keyCode], 50);
  } else if (clickedKeys.includes(ev.keyCode)) {
    keySelect[ev.keyCode]();
  } else if (ev.keyCode == 79) {  // o
    g_mouse = !g_mouse;

    if (g_mouse) {
      [x, y] = convertCoordinatesEventToGL(ev);
      g_prevX = x;
      g_prevY = y;
    }
  } else if (ev.keyCode == 9) {  // tab
    camera.speed = 0.4;
  } else if (ev.keyCode == 84) {  // t
    g_buildMode = reset;
  } else if (ev.keyCode == 86) {  // v build
    g_buildMode = build;
  } else if (ev.keyCode == 66) {  // b destroy
    g_buildMode = destroy;
  }
}

// function to check key up
function keyup(ev) {
  if (keysUsed.includes(ev.keyCode)) {
    clearInterval(intervals[ev.keyCode]);
    delete intervals[ev.keyCode];

    if (ev.keyCode == 38 || ev.keyCode == 40) {
      g_animation = OFF;
    }
  } else
  if (ev.keyCode == 9) {  // tab
    // speed is normal
    camera.speed = 0.1;
  }
}

// Function to handle click events
function click() {
  // Convert camera position to block coordinates
  let atX = toCoordinates(camera.at.elements[0]);
  let atY = toCoordinates(camera.at.elements[1]) - 16;
  let atZ = toCoordinates(camera.at.elements[2]);

  // Find the closest Y coordinate for selection
  let closestY = keyNear(g_map[atZ][atX], atY);

  // Check if the coordinates are within the map boundaries
  if (atZ < 32 && atX < 32) {
    if (g_buildMode === build) { // Check if the build mode is active
      // Determine the side of the block chosen
      var side = sideChosen();
      if (closestY === -1) {
        side = T; // If no block found, default to the top side
      }

      // Modify the map based on the selected side and block type
      if (side === north) {
        if (atZ > 0 && closestY >= 0) {
          g_map[atZ - 1][atX][closestY] = g_blockType;
        }
      } else if (side === east && closestY >= 0) {
        if (atX < 31) {
          g_map[atZ][atX + 1][closestY] = g_blockType;
        }
      } else if (side === south && closestY >= 0) {
        if (atZ < 31) {
          g_map[atZ + 1][atX][closestY] = g_blockType;
        }
      } else if (side === west && closestY >= 0) {
        if (atX > 0) {
          g_map[atZ][atX - 1][closestY] = g_blockType;
        }
      } else if (side === T) { // Top of block
        if (closestY < g_buildHeight - 1) {
          g_map[atZ][atX][closestY + 1] = g_blockType;
        }
      } else if (side === B) { // Bottom of block
        if (closestY >= 0) {
          g_map[atZ][atX][closestY - 1] = g_blockType;
        }
      }

    } else if (g_buildMode === destroy) { // Check if the destroy mode is active
      // Remove the selected block
      delete g_map[atZ][atX][closestY];
    } 
  }
}

// Function to handle mouse movement
function mousemove(ev) {
  // Check if mouse movement is enabled
  if (g_mouse) {
    // Extract the event click coordinates
    var x = ev.clientX; // Get the x coordinate of the mouse pointer
    var y = ev.clientY; // Get the y coordinate of the mouse pointer
    
    // Normalize the coordinates to the range [-1, 1]
    x = ((x) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y))/(canvas.height/2);

    // Calculate the difference in mouse movement
    let diffX = x - g_prevX;
    let diffY = y - g_prevY;

    // Calculate rotation angles based on mouse movement
    let rotateX = diffX * 90;
    let rotateY = diffY * 90;

    // Update previous mouse coordinates
    g_prevX = x;
    g_prevY = y;

    // Rotate the camera based on mouse movement direction
    if (diffX < 0) {
      camera.rotateLeft(rotateX);
    } else if (diffX > 0) {
      camera.rotateRight(rotateX);
    }

    if (diffY < 0) {
      camera.rotateDown(rotateY);
    } else if (diffY > 0) {
      camera.rotateUp(rotateY);
    }

    // Change the selected block texture based on mouse movement
    selectBlocks();
  }
}

// Function to find the nearest key in an object to a given value
function keyNear(object, x) {
  // Get all keys of the object
  var keys = Object.keys(object);

  // If there are no keys, return -1 indicating failure
  if (keys.length === 0) {
    return -1;
  }

  // Convert keys to numbers
  var keyNumber = keys.map(key => parseInt(key));

  // Iterate through keys to find the closest one to the given value
  let closest = -1;
  keyNumber.forEach(key => {
    // If the key is less than or equal to the given value and greater than the current closest, update closest
    if (key <= x && key > closest) {
      closest = key;
    }
  });

  // Return the closest key found or -1 if none found
  return closest === undefined ? -1 : closest;
}


// Function to select the block currently under the camera's view
function selectBlocks() {
  // Check if the build mode is not set to reset
  if (g_buildMode != reset) {

    // Convert camera coordinates to map coordinates
    let atX = toCoordinates(camera.at.elements[0]);
    let atY = toCoordinates(camera.at.elements[1]) - 16;
    let atZ = toCoordinates(camera.at.elements[2]);

    // Find the closest block in the Y direction
    let closestY = keyNear(g_map[atZ][atX], atY);

    // Check if the camera is within the map bounds
    if (atZ < 32 && atX < 32) {
      // Set the selected block coordinates
      g_selected = [atZ, atX, closestY]; 
    }
  }
  // If build mode is set to reset, deselect the block
  else {
    g_selected = null;
  }
}


// Function to determine which side of a block is being looked at based on camera direction
function sideChosen() {
  // Calculate the differences in coordinates between camera's position and its look-at point
  sideX = camera.at.elements[0] - camera.eye.elements[0];
  sideY = camera.at.elements[1] - camera.eye.elements[1];
  sideZ = camera.at.elements[2] - camera.eye.elements[2];

  // Adjustment for top side detection
  let tendTop = sideY < 0 ? 0.2 : 0;

  // Calculate absolute differences and store them in an array
  d = [Math.abs(sideX), Math.abs(sideY) + tendTop, Math.abs(sideZ)];

  // Determine the index of the maximum difference
  let maxIndex = d.indexOf(Math.max(...d));

  // Return the corresponding side based on the maximum difference
  if (maxIndex === 0) {
    return sideX > 0 ? west : east; // Side is either west or east
  } else if (maxIndex === 1) {
    return sideY > 0 ? B : T; // Side is either bottom (B) or top (T)
  } else if (maxIndex === 2) {
    return sideZ > 0 ? north : south; // Side is either north or south
  }
}



// animation

let g_moveX = 0;
let g_2moveX = 0;
let g_moveY = 0;
let g_2moveY = 0;
let g_moveZ = 0;
let g_main = 0;

var g_startTime = performance.now() / 1000.0;
var g_seconds = (performance.now() / 1000.0) - g_startTime;
var g_Time1 = 0;
var g_Time2 = g_seconds - g_Time1;
var g_tpTime = 0;
var g_wasOn = false;

// Function to update and render animations in each frame
function tick() {
  // Save the current time since the animation started
  g_seconds = (performance.now() / 1000.0) - g_startTime;
  
  // Update animation states based on the current animation mode
  if (g_animation == ON) {
    // Calculate the time animation is on
    g_Time1 = g_seconds - g_Time2;
  }
  else if (g_animation == OFF) {
    // Calculate the time animation is off
    g_Time2 = g_seconds - g_Time1;
  }
  else if (g_animation == bit) {
    // Calculate the time for animation bit counting
    g_tpTime = g_seconds - (g_Time1 + g_Time2);

    // If the counting time exceeds 2 seconds, adjust animation mode
    if (g_tpTime > 2) {
      // Add the counting time to the appropriate accumulator
      g_Time2 += g_tpTime;
      g_tpTime = 0;
      
      // Switch animation mode based on the previous state
      if (g_wasOn) {
        g_animation = ON;
      }
      else {
        g_animation = OFF;
      }
    }
  }
  
  // Update animations
  updateAnimation();

  // Render all shapes
  renderAllShapes();

  // Request the next animation frame
  requestAnimationFrame(tick);
}


// Function to update the animation of X and Y axes
function updateAnimation() { 
  // Check the current animation mode
  if (g_animation == ON) {
    // Calculate movement along X and Y axes based on time and animation speed
    g_moveX = 0.8 * 0.1 * Math.sin(g_Time1 * g_animationSpeed);
    g_moveY = 0.8 * 0.05 * Math.sin(g_Time1 * g_animationSpeed + Math.PI / 2);
    
    // Calculate secondary movement along X and Y axes
    g_2moveX = 0.8 * 0.1 * Math.sin(g_Time1 * g_animationSpeed - Math.PI / 2);
    g_2moveY = 0.8 * 0.05 * Math.sin(g_Time1 * g_animationSpeed);
    
    // Calculate main animation parameter
    g_main = 0.05 * Math.sin(g_Time1 * g_animationSpeed + Math.PI / 2);
  }
  else if (g_animation == bit) {
    // Calculate movement parameters for bit animation mode
    let count = (-0.5 * (g_tpTime - 1) * (g_tpTime - 1)) + 0.5;

    // Apply movement based on the count value
    if (count < 0.34) {
      g_moveY = 0.61 * count;
      g_2moveY = 0.61 * count;
      g_moveZ = 0.41 * count;
      g_main = -0.4 * count;
    }
  }
}


// render map

var g_map = [];
var g_mapInitialized = false;

var g_hills = true;

// Function to create a map with specified size
function createMap(map, size) {
  for (i = 0; i < size; i++) {
    map.push([]);
    for (j = 0; j < size; j++) {
      map[i].push({});
    }
  }
}

// Function to clear the map
function clearMap() {
  g_map = [];
  createMap(g_map, 64);
}

// Function to add hills to the map at specified coordinates
function addHills(x, z) {
  // Add hill blocks at various positions around the specified coordinates
  g_map[z][x][0] = hill;
  g_map[z][x][1] = hill;
  g_map[z][x][2] = hill;

  g_map[z + 1][x][0] = hill;
  g_map[z - 1][x + 1][0] = hill;
  g_map[z + 1][x][0] = hill;
  g_map[z - 1][x - 1][0] = hill;

  g_map[z + 1][x][1] = hill;
  g_map[z - 1][x + 1][1] = hill;
  g_map[z + 1][x][1] = hill;
  g_map[z - 1][x - 1][1] = hill;

  g_map[z][x + 1][0] = hill;
  g_map[z][x - 1][0] = hill;
}

// Function to initialize the map
function initMap() {
  // Clear the map
  clearMap();

  // Add hills if enabled
  if (g_hills) {
    addHills(8, 15);
    addHills(19, 7);
    addHills(5, 10);
    addHills(22, 25);
  }
}

// Function to convert a value to coordinates
function toCoordinates(val) {
  // If the value is less than -8, return 0, else return the rounded value
  if (val < -8) {
    return 0;
  } else {
    return Math.round((val + 8) * 2);
  }
}

// Function to draw the map
function drawMap() {
  // Initialize the map if not already done
  if (!g_mapInitialized) {
    initMap();
    g_mapInitialized = true;
  }

  // Create a new cube object for rendering
  var block = new Cube();

  // Loop through each block in the map and render it
  for (var z = 0; z < 32; z++) {
    for (var x = 0; x < 32; x++) {
      // Loop over keys in the y dictionary
      for (var y in g_map[z][x]) {
        if (g_map[z][x].hasOwnProperty(y)) {
          // Set the texture number of the block
          if (g_selected != null && g_selected[0] === z && g_selected[1] === x && g_selected[2] == y) {
            block.textureNum = g_map[z][x][y] + 1;
          } else {
            block.textureNum = g_map[z][x][y];
          }

          // Set the position and render the block
          block.matrix.setIdentity();
          block.matrix.translate(0, -0.75, 0);
          block.matrix.scale(0.5, 0.5, 0.5);
          block.matrix.translate(x - 16, y, z - 16);
          block.render();
        }
      }

      // Render the selected block indicator if one is selected
      if (g_selected != null && g_selected[0] === z && g_selected[1] === x && g_selected[2] == -1) {
        block.textureNum = -2;
        block.color = [1, 1, 1, 1];
        block.matrix.setIdentity();
        block.matrix.translate(0, -0.75, 0);
        block.matrix.scale(0.5, 0.02, 0.5);
        block.matrix.translate(x - 16, -0.5, z - 16);
        block.render();
      }
    }
  }
}

// create main function
function main() {
  // Set up canvas and gl variables
  setupWebGL();
  
  // Set up GLSL shader programs and connect GLSL variables.
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();

  //Create a new camera
  camera = new Camera();

  // Create keydown/keyup functions
  document.onkeydown = keydown;
  document.onkeyup = keyup;

  // Create click function
  canvas.onmousedown = click;

  // Register mousemove function
  document.onmousemove = mousemove;

  // Initialize Textures
  initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  requestAnimationFrame(tick);
}
