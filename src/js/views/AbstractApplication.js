import * as THREE from "three";
import io from "socket.io-client";
import "three/examples/js/controls/OrbitControls";
import "three/examples/js/modifiers/BufferSubdivisionModifier";
import Stats from "three/examples/js/libs/stats.min";
import {
  EffectComposer,
  RenderPass,
  BloomPass,
  MaskPass,
} from "postprocessing";

class AbstractApplication {
  constructor() {
    // Reference resolution: The designer's screen (2560x1440)
    this.referenceWidth = 2560;
    this.referenceHeight = 1440;

    // Calculate viewport scale factor based on diagonal
    // This maintains the desired appearance across different screen sizes
    this.calculateViewportScale();

    // Initialize CSS custom property for UI scaling
    document.documentElement.style.setProperty('--ui-scale', this.uiScale.toFixed(4));

    this.a_camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    // For mobile devices, increase the initial camera distance to prevent brain from appearing too large
    const isMobile = window.innerWidth <= 768;
    const mobileMultiplier = isMobile ? 1.8 : 1.0;
    this.a_camera.position.z = 30 * this.viewportScale * mobileMultiplier; // Start zoomed INTO the brain - scaled

    this.a_scene = new THREE.Scene();
    this.a_scene.background = new THREE.Color("#000000"); // Black background

    this.a_blurScene = new THREE.Scene();
    this.a_bloomScene = new THREE.Scene();

    this.a_scene.fog = new THREE.Fog(0x000000, 300, 1300); // Black fog

    this.a_renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: false,
      logarithmicDepthBuffer: true,
    });
    this.a_renderer.setPixelRatio(window.devicePixelRatio);
    this.a_renderer.setSize(window.innerWidth, window.innerHeight);
    this.a_renderer.sortObjects = false;
    this.a_renderer.setClearColor(0x000000, 1.0);

    this.a_renderer.shadowMap.enabled = true;
    this.a_renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.a_renderer.gammaInput = true;
    this.a_renderer.gammaOutput = true;
    this.a_renderer.shadowDepthMaterialSide = THREE.BackSide;

    this.composer = new EffectComposer(this.a_renderer, {
      stencilBuffer: true,
      depthTexture: true,
    });

    // PASSES
    this.renderPass = new RenderPass(this.scene, this.camera);
    //this.renderPass.renderToScreen = true;
    this.composer.addPass(this.renderPass);


    this.bloomPass = new BloomPass({
      resolutionScale: 0.7,
      resolution: 2.9,
      intensity: 1.0, // Slightly reduced from 2.3 for reasonable glow 1.8
      distinction: 9.0,
      blend: true,
    });

    this.bloomPass.renderToScreen = true;
    this.composer.addPass(this.bloomPass);

    this.blurMask = new MaskPass(this.blurScene, this.camera);
    this.renderPass2 = new RenderPass(this.blurScene, this.camera);

    // Set canvas style for seamless black background
    this.a_renderer.domElement.style.display = 'block';
    this.a_renderer.domElement.style.position = 'absolute';
    this.a_renderer.domElement.style.top = '0';
    this.a_renderer.domElement.style.left = '0';

    document.body.appendChild(this.a_renderer.domElement);

    // FPS tracker hidden but functional
    this.stats = AbstractApplication.initStats(document.body);
    this.stats.domElement.style.display = 'none'; // Hide the FPS counter

    this.orbitControls = new THREE.OrbitControls(
      this.camera,
      this.a_renderer.domElement
    );
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.25;
    this.orbitControls.enableZoom = true;
    this.orbitControls.zoomSpeed = 0.1;
    this.orbitControls.panSpeed = 0.1;
    // Scale min/max distances based on viewport to maintain consistent zoom behavior
    this.orbitControls.minDistance = 50 * this.viewportScale;
    this.orbitControls.maxDistance = 2500 * this.viewportScale;
    this.orbitControls.autoRotate = false;
    this.orbitControls.autoRotateSpeed = 1.0;
    this.orbitControls.rotateSpeed = 0.1;
    this.orbitControls.screenSpacePanning = false; // Disable panning to keep brain centered
    this.orbitControls.target.set(0, 0, 0); // Center on origin where brain is

    window.addEventListener("resize", this.onWindowResize.bind(this), false);
    window.addEventListener("mousemove", this.onMouseMove.bind(this), false);
  }

  get renderer() {
    return this.a_renderer;
  }

  get camera() {
    return this.a_camera;
  }

  get scene() {
    return this.a_scene;
  }

  get blurScene() {
    return this.a_blurScene;
  }
  get bloomScene() {
    return this.a_bloomScene;
  }

  static initStats(render) {
    const stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = "absolute";
    stats.domElement.style.left = "0px";
    stats.domElement.style.tip = "0px";
    render.appendChild(stats.domElement);
    return stats;
  }

  calculateViewportScale() {
    // Calculate diagonal of reference resolution
    const referenceDiagonal = Math.sqrt(
      this.referenceWidth * this.referenceWidth +
      this.referenceHeight * this.referenceHeight
    );

    // Calculate diagonal of current viewport
    const currentDiagonal = Math.sqrt(
      window.innerWidth * window.innerWidth +
      window.innerHeight * window.innerHeight
    );

    // Calculate raw scale factor
    const rawScale = currentDiagonal / referenceDiagonal;
    
    // Apply a damping function to prevent extreme scaling
    // Use a power function that reduces the impact of larger screens
    // This ensures MacBooks and other high-res displays don't zoom in too much
    // Formula: scale^0.6 reduces the effect (e.g., 1.2^0.6 = 1.117 instead of 1.2)
    this.viewportScale = Math.pow(rawScale, 0.6);
    
    // Cap the scale at reasonable bounds to prevent extreme zoom
    this.viewportScale = Math.max(0.7, Math.min(this.viewportScale, 1.3));

    // Also store a simpler width-based scale for UI elements
    this.uiScale = window.innerWidth / this.referenceWidth;
    console.log(`Viewport Scale: ${this.viewportScale.toFixed(3)} (raw: ${rawScale.toFixed(3)}), UI Scale: ${this.uiScale.toFixed(3)}`);
  }

  static onMouseMove(e) {}
  onWindowResize() {
    // Recalculate scale on resize
    const oldScale = this.viewportScale;
    this.calculateViewportScale();

    // If scale changed significantly, update orbit controls distances
    if (Math.abs(oldScale - this.viewportScale) > 0.01) {
      this.orbitControls.minDistance = 50 * this.viewportScale;
      this.orbitControls.maxDistance = 2500 * this.viewportScale;

      // Adjust current camera distance proportionally
      const currentDistance = this.a_camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
      const scaleFactor = this.viewportScale / oldScale;
      const newDistance = currentDistance * scaleFactor;

      // Maintain camera direction but adjust distance
      const direction = new THREE.Vector3();
      direction.copy(this.a_camera.position).normalize();
      this.a_camera.position.copy(direction.multiplyScalar(newDistance));
    }

    this.a_camera.aspect = window.innerWidth / window.innerHeight;
    this.a_camera.updateProjectionMatrix();

    this.a_renderer.setSize(window.innerWidth, window.innerHeight);
    // Update navigation bar scale via CSS custom property
    document.documentElement.style.setProperty('--ui-scale', this.uiScale.toFixed(4));
  }

  animate(timestamp) {
    requestAnimationFrame(this.animate.bind(this));
    this.a_renderer.render(this.a_scene, this.a_camera);
  }
}

export default AbstractApplication;
