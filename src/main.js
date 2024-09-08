import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Parallelepiped Transformation Class in JavaScript
class ParallelepipedTransformer {
  constructor() {
    this.fx_d = 5.8262448167737955e+02;
    this.fy_d = 5.8269103270988637e+02;
    this.cx_d = 3.1304475870804731e+02;
    this.cy_d = 2.3844389626620386e+02;
    this.aspRatio = 4 / 3;
    this.bbx_margin = 0.1;
    this.thickness = 0.1;

    this.maxx = this.aspRatio * 0.5;
    this.minx = -this.maxx;
    this.maxX = this.maxx + this.bbx_margin;
    this.minX = this.minx - this.bbx_margin;

    this.maxy = 0.5;
    this.miny = -this.maxy;
    this.maxY = this.maxy + this.bbx_margin;
    this.minY = -this.maxY;

    this.maxd = 0.8;
    this.mind = 0;
    this.maxdShape = this.maxd + this.thickness;
    this.maxD = this.maxdShape + this.bbx_margin;
    this.minD = this.mind - this.bbx_margin;
  }

  // Transformation function to map coordinates to normalized space
  transform(X, Y, Z, xm, xM, ym, yM, zm, zM) {
    const u = (this.maxx - this.minx) * ((X - xm) / (xM - xm)) + this.minx;
    const v = (this.maxy - this.miny) * ((Y - ym) / (yM - ym)) + this.miny;
    const w = (this.maxd - this.mind) * ((Z - zm) / (zM - zm)) + this.mind;
    return { u, v, w };
  }

  // Find the center (ox, oy, oz) from the parallelepiped vertices
  findCenter(X, Y, Z) {
    const xm = Math.min(...X.flat());
    const xM = Math.max(...X.flat());

    const ym = Math.min(...Y.flat());
    const yM = Math.max(...Y.flat());

    const zm = Math.min(...Z.flat());
    const zM = Math.max(...Z.flat());

    // Calculate the midpoint of the bounding box
    const centerX = (xm + xM) / 2;
    const centerY = (ym + yM) / 2;
    const centerZ = (zm + zM) / 2;

    // Apply the transformation to find ox, oy, oz
    const { u: ox, v: oy, w: oz } = this.transform(0, 0, 0, xm, xM, ym, yM, zm, zM);

    return { ox, oy, oz };
  }
}

// Function to create a parallelepiped with the same color for all faces
function createParallelepiped(center, distances, normals, color) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
  
    // Calculate vertices
    const points = [
      center.clone().add(normals[0].clone().multiplyScalar(distances[0])).add(normals[1].clone().multiplyScalar(distances[1])).add(normals[2].clone().multiplyScalar(distances[2])),
      center.clone().add(normals[0].clone().multiplyScalar(distances[0])).add(normals[1].clone().multiplyScalar(distances[1])).sub(normals[2].clone().multiplyScalar(distances[2])),
      center.clone().add(normals[0].clone().multiplyScalar(distances[0])).sub(normals[1].clone().multiplyScalar(distances[1])).sub(normals[2].clone().multiplyScalar(distances[2])),
      center.clone().add(normals[0].clone().multiplyScalar(distances[0])).sub(normals[1].clone().multiplyScalar(distances[1])).add(normals[2].clone().multiplyScalar(distances[2])),
  
      center.clone().sub(normals[0].clone().multiplyScalar(distances[0])).add(normals[1].clone().multiplyScalar(distances[1])).add(normals[2].clone().multiplyScalar(distances[2])),
      center.clone().sub(normals[0].clone().multiplyScalar(distances[0])).add(normals[1].clone().multiplyScalar(distances[1])).sub(normals[2].clone().multiplyScalar(distances[2])),
      center.clone().sub(normals[0].clone().multiplyScalar(distances[0])).sub(normals[1].clone().multiplyScalar(distances[1])).sub(normals[2].clone().multiplyScalar(distances[2])),
      center.clone().sub(normals[0].clone().multiplyScalar(distances[0])).sub(normals[1].clone().multiplyScalar(distances[1])).add(normals[2].clone().multiplyScalar(distances[2]))
    ];
  
    // Push the vertices into the buffer
    points.forEach(p => {
      vertices.push(p.x, p.y, p.z);
    });
  
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  
    // Define indices for the 12 triangles that make up the 6 faces of the cuboid
    const indices = [
      0, 1, 2, 2, 3, 0, // Front
      4, 5, 6, 6, 7, 4, // Back
      0, 1, 5, 5, 4, 0, // Top
      2, 3, 7, 7, 6, 2, // Bottom
      0, 3, 7, 7, 4, 0, // Left
      1, 2, 6, 6, 5, 1  // Right
    ];
  
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
  
    // Use the same color for all vertices
    const colors = [];
    for (let i = 0; i < 8; i++) { // Ensure 8 vertices are assigned the same color
      colors.push(color.r, color.g, color.b);
    }
  
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  
    return geometry;
  }
  
  // Function to simulate the 'gist_rainbow' colormap from matplotlib
  function getColorFromGistRainbow(value) {
    const hue = value * 360; // Map value from [0, 1] to [0, 360] (full color wheel)
    return new THREE.Color(`hsl(${hue}, 100%, 50%)`);
  }
  
  // Initialize scene, camera, and renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  
  // Set the camera's up direction to prevent upside down view
  // camera.up.set(0, -1, 0);
  
  // Controls for orbiting the camera
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.maxPolarAngle = Math.PI / 2;
  
  // Raycaster for selection
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let selectedParallelepiped = null;
  let selectedIndex = -1;
  const selectedText = document.getElementById('selectedText');
  
  // Array to store transformation data
  const parallelepipedData = [];
  
  // Handle slider updates
  const translateX = document.getElementById('translateX');
  const translateY = document.getElementById('translateY');
  const translateZ = document.getElementById('translateZ');
  const rotateX = document.getElementById('rotateX');
  const rotateY = document.getElementById('rotateY');
  const rotateZ = document.getElementById('rotateZ');
  const scaleX = document.getElementById('scaleX');
  const scaleY = document.getElementById('scaleY');
  const scaleZ = document.getElementById('scaleZ');
  
  // Synthesize button
  const synthesizeButton = document.getElementById('synthesize');
  
  // Add event listener to synthesize and save the modified data
  synthesizeButton.addEventListener('click', () => {
    const modifiedData = {
      trans: [],
      offset: [],
      norm: []
    };
  
    // Gather transformation data for each parallelepiped
    parallelepipedData.forEach((data, index) => {
      const { position, rotation, scale } = data;
  
      // For this example, we're saving the positions, but you can calculate offsets/norms as needed
      modifiedData.trans.push([position.x, position.y, position.z]);
      modifiedData.offset.push([scale.x, scale.y, scale.z]);
      modifiedData.norm.push([rotation.x, rotation.y, rotation.z]);
    });
  
    // Save the modified data to JSON
    const json = JSON.stringify(modifiedData);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
  
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modified_data.json';
    a.click();
    URL.revokeObjectURL(url);
  });
  
  // Update slider values based on selected parallelepiped's transformations
  function updateSliders() {
    if (selectedParallelepiped) {
      translateX.value = selectedParallelepiped.position.x;
      translateY.value = selectedParallelepiped.position.y;
      translateZ.value = selectedParallelepiped.position.z;
  
      rotateX.value = THREE.MathUtils.radToDeg(selectedParallelepiped.rotation.x);
      rotateY.value = THREE.MathUtils.radToDeg(selectedParallelepiped.rotation.y);
      rotateZ.value = THREE.MathUtils.radToDeg(selectedParallelepiped.rotation.z);
  
      scaleX.value = selectedParallelepiped.scale.x;
      scaleY.value = selectedParallelepiped.scale.y;
      scaleZ.value = selectedParallelepiped.scale.z;
    }
  }
  
  // Add event listener for mouse clicks to select a parallelepiped
  window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
  
    if (intersects.length > 0) {
      selectedParallelepiped = intersects[0].object;
      selectedIndex = scene.children.indexOf(selectedParallelepiped);
      selectedText.innerText = `Selected Parallelepiped: ${selectedIndex}`;
  
      // Update slider values to reflect the selected parallelepiped's transformation
      updateSliders();
    } else {
      selectedParallelepiped = null;
      selectedIndex = -1;
      selectedText.innerText = 'Selected Parallelepiped: None';
    }
  });
  
  // Fetch the data.json and process it
  fetch('/public/data.json')
    .then(response => response.json())
    .then(data => {
      const centers = data.trans;
      const offsets = data.offset;
      const normals = data.norm;
  
      const transformer = new ParallelepipedTransformer();
      const allX = [];
      const allY = [];
      const allZ = [];
  
  
      centers[0].forEach((center, index) => {
        const offset = [
          Math.abs(offsets[0][index][0][0]),
          Math.abs(offsets[0][index][1][0]),
          Math.abs(offsets[0][index][2][0])
        ];
  
        const normal = [
          new THREE.Vector3(normals[0][index][0][0], normals[0][index][0][1], normals[0][index][0][2]),
          new THREE.Vector3(normals[0][index][1][0], normals[0][index][1][1], normals[0][index][1][2]),
          new THREE.Vector3(normals[0][index][2][0], normals[0][index][2][1], normals[0][index][2][2])
        ];
  
        const color = getColorFromGistRainbow(index / centers[0].length);
  
        const geometry = createParallelepiped(new THREE.Vector3(...center), offset, normal, color);
        const material = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });
        const parallelepiped = new THREE.Mesh(geometry, material);

        geometry.attributes.position.array.forEach((vertex, i) => {
          if (i % 3 === 0) {
            allX.push(vertex); // x-coordinate
          } else if (i % 3 === 1) {
            allY.push(vertex); // y-coordinate
          } else {
            allZ.push(vertex); // z-coordinate
          }
        });
  
  
        // Add initial transformation data
        parallelepipedData.push({
          position: new THREE.Vector3(0, 0, 0),
          rotation: new THREE.Euler(0, 0, 0),
          scale: new THREE.Vector3(1, 1, 1)
        });
  
        scene.add(parallelepiped);
      });
      const { ox, oy, oz } = transformer.findCenter(allX, allY, allZ);
      camera.position.set(ox, oy, oz);
  
  
      // camera.position.set(0.1348, -3.978e-17, -0.6356);
    });
  
  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(5, 5, 5).normalize();
  scene.add(directionalLight);
  
  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  
  animate();
  
  // Add event listeners to sliders to update transformations
  translateX.addEventListener('input', updateTransformations);
  translateY.addEventListener('input', updateTransformations);
  translateZ.addEventListener('input', updateTransformations);
  rotateX.addEventListener('input', updateTransformations);
  rotateY.addEventListener('input', updateTransformations);
  rotateZ.addEventListener('input', updateTransformations);
  scaleX.addEventListener('input', updateTransformations);
  scaleY.addEventListener('input', updateTransformations);
  scaleZ.addEventListener('input', updateTransformations);
  
  function updateTransformations() {
    if (selectedParallelepiped && selectedIndex !== -1) {
      // Apply translation
      selectedParallelepiped.position.set(
        parseFloat(translateX.value),
        parseFloat(translateY.value),
        parseFloat(translateZ.value)
      );
  
      // Apply local rotation around its center
      selectedParallelepiped.rotation.set(
        THREE.MathUtils.degToRad(parseFloat(rotateX.value)),
        THREE.MathUtils.degToRad(parseFloat(rotateY.value)),
        THREE.MathUtils.degToRad(parseFloat(rotateZ.value))
      );
  
      // Apply scaling
      selectedParallelepiped.scale.set(
        parseFloat(scaleX.value),
        parseFloat(scaleY.value),
        parseFloat(scaleZ.value)
      );
  
      // Update stored transformation data
      parallelepipedData[selectedIndex].position.copy(selectedParallelepiped.position);
      parallelepipedData[selectedIndex].rotation.copy(selectedParallelepiped.rotation);
      parallelepipedData[selectedIndex].scale.copy(selectedParallelepiped.scale);
    }
  }
  