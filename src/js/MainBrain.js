/* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["child", memories] }] */
import * as THREE from "three";
import { Power1, Power2, Power4, TweenMax } from "gsap";
import "three/examples/js/BufferGeometryUtils";
import AbstractApplication from "./views/AbstractApplication";
import Loaders from "./Loaders/Loaders";
import BubblesAnimation from "./services/bubblesAnimation";
import ThinkingAnimation from "./services/thinkingAnimation";
import Font from "./services/font";
import ParticleSystem from "./services/particlesSystem";
import Memories from "./data/memories.json";

class MainBrain extends AbstractApplication {
  constructor() {
    super();

    this.clock = new THREE.Clock();
    this.addBrain = this.addBrain.bind(this);
    this.addFloor();
    this.addIllumination();

    // Brain center position - keep brain centered at origin
    this.brainCenter = new THREE.Vector3(0, 0, 0);

    // Mouse interaction setup
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    // Increase threshold for easier clicking on text
    this.raycaster.params.Points = { threshold: 10 };
    this.raycaster.params.Line = { threshold: 10 };
    this.setupMouseEvents();

    this.deltaTime = 0;
    this.particlesColor = new THREE.Color(0xffffff);
    this.particlesStartColor = new THREE.Color(0xffffff);
    this.loaders = new Loaders(this.runAnimation.bind(this));
    this.memories = Memories;
    this.memorySelected = [
      "analytic",
      "episodic",
      "process",
      "semantic",
      "affective",
    ];

    // Website navigation mapping
    this.navigationItems = [
      { key: "analytic", label: "ABOUT ME", url: "/about.html" },
      { key: "episodic", label: "EXPERIENCE", url: "/experience.html" },
      { key: "process", label: "PROJECTS", url: "/projects.html" },
      { key: "semantic", label: "CONTACT", url: "/contact.html" }
    ];
    this.frame = 0;
    this.frameName = 0;
    this.isRecording = false;

    // Track startup animation state
    this.isStartupAnimationPlaying = false;
    this.setupEscapeKeyListener();

    // Check if we should skip the animation (coming from another page)
    const urlParams = new URLSearchParams(window.location.search);
    const shouldSkip = urlParams.get('skip') === 'true';

    // Wait for assets to load before starting animation
    setTimeout(() => {
      if (shouldSkip) {
        // Initialize exactly as if starting intro (same as pressing Escape)
        this.isStartupAnimationPlaying = true;
        this.orbitControls.autoRotate = true;

        // Start particle transformation immediately
        if (this.particlesSystem) {
          this.particlesSystem.transform(true);
        }

        // Initialize arrays for cleanup (needed by skipStartupAnimation)
        this.startupTweens = [];
        this.startupTimeouts = [];

        // Now skip using the exact same function as Escape key
        this.skipStartupAnimation();

        // Clean up the URL parameter without reloading
        if (window.history.replaceState) {
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      } else {
        this.startIntro();
      }
    }, 1000); // 500 prev.
  }

  addFloor() {
    const geometry = new THREE.PlaneBufferGeometry(20000, 20000);
    const material = new THREE.MeshPhongMaterial({
      color: 0x000000, // Black floor
      opacity: 0.1,
      transparent: true,
    });
    this.plane = new THREE.Mesh(geometry, material);
    this.plane.receiveShadow = true;
    this.plane.position.y = -160;
    this.plane.rotation.x = -0.5 * Math.PI;
    this.scene.add(this.plane);
  }
  addIllumination() {
    this.ambienlight = new THREE.AmbientLight(0xb8c5cf, 0);
    this.scene.add(this.ambienlight);

    this.spotLight = new THREE.SpotLight(
      0xb8c5cf,
      1.45,
      175,
      Math.PI / 2,
      0.0,
      0.0
    );
    this.spotLight.position.set(0, 500, -10);
    this.spotLight.castShadow = true;

    this.spotLight.castShadow = true;
    this.spotLight.shadow = new THREE.LightShadow(
      new THREE.PerspectiveCamera(
        54,
        window.innerWidth / window.innerHeight,
        1,
        2000
      )
    );
    this.spotLight.shadow.bias = -0.000222;
    this.spotLight.shadow.mapSize.width = 1024;
    this.spotLight.shadow.mapSize.height = 1024;

    // Don't add spotlight - it may be appearing as a bright orb
    // this.scene.add(this.spotLight);
    // this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight); // Removed - creates visible orb
  }

  addBrain() {
    this.brainBufferGeometries = [];

    this.loaders.BRAIN_MODEL.traverse((child) => {
      if (child instanceof THREE.LineSegments) {
        this.memories.lines = {
          ...this.memories.lines,
          ...MainBrain.addLinesPath(child, this.memories),
        };
      }
      if (!(child instanceof THREE.Mesh)) {
        return;
      }
      child.geometry.verticesNeedUpdate = true;
      // child.material.map = this.loaders.lightTexture;
      this.brainBufferGeometries.push(child.geometry);

      this.memories = {
        ...this.memories,
        ...MainBrain.storeBrainVertices(child, this.memories),
      };
    });

    this.endPointsCollections = THREE.BufferGeometryUtils.mergeBufferGeometries(
      this.brainBufferGeometries
    );
  }

  startIntro() {
    // Mark startup animation as playing
    this.isStartupAnimationPlaying = true;

    // Phase 1: Start zoomed INTO the brain, then zoom out while rotating
    // CAMERA START POSITION: Lower = more zoomed in, Higher = less zoomed in
    const progress = { p: 50 }; // Start position (was 30, now 50 for less zoom-in)

    // Enable auto-rotation immediately
    this.orbitControls.autoRotate = true;

    // Start particle transformation immediately (before animation) to avoid hitches
    if (this.particlesSystem) {
      this.particlesSystem.transform(true);
    }

    // Enable internal sparkles early - they should always be there
    const sparklesTimeout = setTimeout(() => {
      if (this.bubblesAnimation) {
        this.bubblesAnimation.flashingAnimation(true);
      }
    }, 2000);

    // Store timeout IDs for cleanup when skipping
    this.startupTimeouts = this.startupTimeouts || [];
    this.startupTimeouts.push(sparklesTimeout);

    const zoomTween = TweenMax.to(
      progress,
      6.0, // Zoom duration - reduced from 8.0 to 6.0 seconds for faster intro
      {
        // CAMERA END POSITION: Lower = less zoomed out (larger brain), Higher = more zoomed out (smaller brain)
        p: 320, // Final position (was 380, now 320 for larger brain)
        ease: Power1.easeInOut, // Smoother easing (Power1 instead of Power2) for less aggressive curve
        onUpdate: () => {
          this.camera.position.z = progress.p;
          // Always keep camera looking at brain center
          this.camera.lookAt(this.brainCenter);
          this.orbitControls.target.copy(this.brainCenter);
        },
        onStart: () => {
          // Show tabs starting to appear when halfway zoomed out
          const labelsTimeout = setTimeout(() => {
            this.showMemoryLabelsGradually();
          }, 3000); // 3 seconds into the 6 second zoom (halfway point)
          this.startupTimeouts.push(labelsTimeout);
        },
        onComplete: () => {
          //hide xray
          if (this.particlesSystem && this.particlesSystem.xRay) {
            this.particlesSystem.xRay.material.uniforms.c.value = 1.0;
          }
          // Ensure orbit controls are centered on brain
          this.orbitControls.target.copy(this.brainCenter);

          // Phase 2: Start tab transition with rising particles sooner
          const transitionTimeout = setTimeout(() => {
            this.transitionTabsWithRisingParticles();

            // Capture default camera position after startup completes
            const captureTimeout = setTimeout(() => {
              this.captureDefaultCameraPosition();
              // Animation complete
              this.isStartupAnimationPlaying = false;
            }, 4500); // After all animations complete
            this.startupTimeouts.push(captureTimeout);
          }, 1000); // Reduced from 2000ms to 1000ms - only 1 second wait after zoom
          this.startupTimeouts.push(transitionTimeout);
        }
      }
    );

    // Store the main tween for cleanup when skipping
    this.startupTweens = this.startupTweens || [];
    this.startupTweens.push(zoomTween);
  }

  transitionTabsWithRisingParticles() {
    // Start rising bubbles first, then tabs ride on them
    if (this.bubblesAnimation) {
      // Show rising bubbles with tabs - faster animation
      const bubbleProgress = { p: 0.0 };
      const bubbleTween = TweenMax.to(bubbleProgress, 2.5, { // Reduced from 3.5 to 2.5 seconds
        p: 0.6, // Prominent rising effect
        ease: Power4.easeInOut,
        onUpdate: () => {
          this.bubblesAnimation.updateBurbleUp(bubbleProgress.p);
          // Keep camera centered on brain during animation
          this.orbitControls.target.copy(this.brainCenter);
        },
        onComplete: () => {
          // Phase 4: After tabs settle, make particles linger then disappear
          const fadeTimeout = setTimeout(() => {
            this.fadeOutRisingParticles();
          }, 2000); // Linger for 2 seconds after tabs reach nav bar (reduced from 3)
          this.startupTimeouts.push(fadeTimeout);
        }
      });
      this.startupTweens.push(bubbleTween);
    }

    // Start tab transition slightly after bubbles begin (tabs ride the bubble wave)
    const navTimeout = setTimeout(() => {
      this.transitionToTopNav();
    }, 200); // 200ms delay so tabs appear to ride the rising bubbles
    this.startupTimeouts.push(navTimeout);
  }

  fadeOutRisingParticles() {
    // Stop ONLY the rising bubble animation (keep internal sparkles)
    if (this.bubblesAnimation) {
      const bubbleProgress = { p: 0.6 };
      const fadeTween = TweenMax.to(bubbleProgress, 2.0, {
        p: 0.0, // Fade rising particles back down
        ease: Power2.easeIn,
        onUpdate: () => {
          this.bubblesAnimation.updateBurbleUp(bubbleProgress.p);
        },
        onComplete: () => {
          // Keep flashing animation ON (internal sparkles stay)
          // Only the rising bubbles are turned off
        }
      });
      this.startupTweens.push(fadeTween);
    }
  }


  startAutoDemo() {
    // Disabled - all startup effects removed except sparkles
  }

  static addLinesPath(mesh, memories) {
    const keys = Object.keys(memories.lines);
    keys.map((l) => {
      if (mesh.name.includes(l)) {
        memories.lines[l] = mesh.geometry.attributes.position.array;
        return memories.lines;
      }
      return [];
    });
  }

  static storeBrainVertices(mesh, memories) {
    const keys = Object.keys(memories);

    keys.map((m) => {
      if (mesh.name.includes(m)) {
        if (memories[m].length) {
          memories[m].push(mesh.geometry);
          memories[m] = [
            THREE.BufferGeometryUtils.mergeBufferGeometries(memories[m]),
          ];
          return memories;
        }
        return memories[m].push(mesh.geometry);
      }
      return [];
    });
  }

  runAnimation() {
    // GUI removed for cleaner interface
    // this.gui = new GUI(this);
    this.addBrain();
    this.addParticlesSystem();
    this.font = new Font(this.loaders, this.scene);
    this.bubblesAnimation = new BubblesAnimation(this);
    this.bubblesAnimation.initAnimation();

    this.thinkingAnimation = new ThinkingAnimation(this);
    this.thinkingAnimation.initAnimation();

    // Set Background to black
    this.scene.background = new THREE.Color(0x000000);

    // Create liquid glass control panel
    this.createLiquidGlassControlPanel();

    // Create bottom navigation bar with social icons
    this.createBottomNavigationBar();

    this.animate();
  }

  animate(timestamp) {
    this.orbitControls.update();
    // Reduced auto-rotate speed for less camera movement
    this.orbitControls.autoRotateSpeed = 0.15;

    this.deltaTime += this.clock.getDelta();

    if (this.particlesSystem) {
      this.particlesSystem.update(
        this.deltaTime,
        this.camera,
        this.particlesSystem.xRay
      );
    }
    if (this.bubblesAnimation) {
      this.bubblesAnimation.update(this.camera, this.deltaTime);
    }
    if (this.thinkingAnimation) {
      this.thinkingAnimation.update(this.camera, this.deltaTime);
    }

    this.stats.update();
    requestAnimationFrame(this.animate.bind(this));

    //this.renderer.render(this.a_scene, this.a_camera);

    if (this.font) {
      this.font.facingToCamera(this.camera);
    }

    // Update HTML label positions to track 3D positions
    this.updateHTMLLabelPositions();

    this.camera.updateProjectionMatrix();

    if (this.thinkingAnimation && this.thinkingAnimation.flashing) {
      this.thinkingAnimation.flashing.geometry.verticesNeedUpdate = true;
      this.thinkingAnimation.flashing.geometry.attributes.position.needsUpdate = true;
    }

    // composer
    this.composer.render();

    if (this.isRecording) {
      if (this.frame > 10) {
        this.socket.emit("render-frame", {
          frame: (this.frameName += 1),
          file: document.querySelector("canvas").toDataURL(),
        });
      }
      this.frame += 1;
    }
  }
  setupMouseEvents() {
    // Mouse move for hover effects
    window.addEventListener('mousemove', (event) => {
      this.onMouseMove(event);
    });

    // Mouse click for navigation
    window.addEventListener('click', (event) => {
      this.onMouseClick(event);
    });

    // Change cursor style
    document.body.style.cursor = 'default';
  }

  setupEscapeKeyListener() {
    window.addEventListener('keydown', (event) => {
      // Check if Escape key is pressed and startup animation is playing
      if (event.key === 'Escape' && this.isStartupAnimationPlaying) {
        this.skipStartupAnimation();
      }
    });
  }

  skipStartupAnimation() {
    console.log('Skipping startup animation...');

    // Mark animation as no longer playing
    this.isStartupAnimationPlaying = false;

    // Kill all tweens
    if (this.startupTweens && this.startupTweens.length > 0) {
      this.startupTweens.forEach((tween) => {
        if (tween) tween.kill();
      });
      this.startupTweens = [];
    }

    // Clear all timeouts
    if (this.startupTimeouts && this.startupTimeouts.length > 0) {
      this.startupTimeouts.forEach((timeout) => {
        clearTimeout(timeout);
      });
      this.startupTimeouts = [];
    }

    // Set camera to exact final position - matching what natural animation produces
    // These values are what the camera ends up at after the full animation with autoRotate
    this.camera.position.set(-345.54846209313865, 2.1963802482216168e-14, 96.22454769567089);
    this.camera.lookAt(this.brainCenter);
    this.orbitControls.target.copy(this.brainCenter);
    this.orbitControls.autoRotate = true;
    this.orbitControls.update();

    // Ensure particle system is transformed
    if (this.particlesSystem) {
      this.particlesSystem.transform(true);

      // Hide xray
      if (this.particlesSystem.xRay) {
        this.particlesSystem.xRay.material.uniforms.c.value = 1.0;
      }
    }

    // Enable internal sparkles immediately
    if (this.bubblesAnimation) {
      this.bubblesAnimation.flashingAnimation(true);
      // Set bubble animation to 0 (no rising bubbles)
      this.bubblesAnimation.updateBurbleUp(0.0);
    }

    // Clean up any existing transitioning labels
    this.cleanupTransitioningLabels();

    // Create final navigation bar immediately and make it visible
    this.createFinalNavigationBar();
    const navContainer = document.getElementById('brain-navigation-container');
    const nav = document.getElementById('brain-navigation');
    if (navContainer && nav) {
      navContainer.style.opacity = '1';
      navContainer.style.pointerEvents = 'auto';
      nav.style.clipPath = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'; // Fully revealed
    }

    // Show control panel and bottom navigation with a slight delay for visual consistency
    setTimeout(() => {
      this.showControlPanel();
      this.showBottomNavigation();
    }, 300);

    // Capture default camera position (same as natural animation does)
    this.captureDefaultCameraPosition();

    console.log('Startup animation skipped successfully');
  }

  onMouseMove(event) {
    // Update mouse coordinates for raycasting
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Check for hover effects on navigation text
    this.checkHoverEffects();

    // Original mouse move logic
    const y = window.innerHeight - event.clientY;
    const x = window.innerHeight - event.clientX;
    //  this.bubblesAnimation.updateMouse(new THREE.Vector2(x, y));
  }

  onMouseClick(event) {
    // Update mouse coordinates
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Check for clicks on navigation text
    this.checkNavigationClicks();
  }

  checkHoverEffects() {
    if (!this.font || !this.font.clickableObjects || !this.camera) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.font.clickableObjects);

    // Reset all hover states
    const { clickableObjects } = this.font;
    for (let i = 0; i < clickableObjects.length; i += 1) {
      const obj = clickableObjects[i];
      if (obj.userData.isHovered) {
        obj.userData.isHovered = false;
        // If this is a hitbox, update the actual text mesh (which is now a letterGroup)
        if (obj.userData.isHitbox && obj.userData.textMesh) {
          // Traverse through all letter meshes and update their colors
          obj.userData.textMesh.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
              child.material.color.copy(obj.userData.originalColor);
            }
          });
        } else {
          obj.material.color.copy(obj.userData.originalColor);
        }
        document.body.style.cursor = 'default';
      }
    }

    // Apply hover effect to intersected object
    if (intersects.length > 0) {
      const hoveredObject = intersects[0].object;
      if (hoveredObject.userData) {
        hoveredObject.userData.isHovered = true;
        // If this is a hitbox, update the actual text mesh with subtle color change
        if (hoveredObject.userData.isHitbox && hoveredObject.userData.textMesh) {
          // Traverse through all letter meshes and update their colors
          hoveredObject.userData.textMesh.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
              child.material.color.copy(hoveredObject.userData.hoverColor);
            }
          });
        } else {
          hoveredObject.material.color.copy(hoveredObject.userData.hoverColor);
        }
        document.body.style.cursor = 'pointer';
      }
    }
  }

  checkNavigationClicks() {
    if (!this.font || !this.font.clickableObjects || !this.camera) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.font.clickableObjects);

    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      if (clickedObject.userData && clickedObject.userData.url) {
        // Navigate to the URL
        this.navigateToPage(clickedObject.userData.url);
      }
    }
  }

  navigateToPage(url) {
    // Navigate to internal pages or open external URLs
    if (url.startsWith('/')) {
      // Internal navigation - use window.location for actual page navigation
      window.location.href = url;
    } else if (url.startsWith('http')) {
      // External URL
      window.open(url, '_blank');
    }
  }

  // Legacy method - no longer needed but kept for backward compatibility
  createPlaceholderPage(path) {
    // This method is deprecated - navigation now uses real pages
    console.warn('createPlaceholderPage is deprecated. Use actual page files instead.');
    const pageName = path.substring(1); // Remove leading slash
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${pageName.charAt(0).toUpperCase() + pageName.slice(1)} - 3D Brain Portfolio</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 40px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
          }
          .container { max-width: 800px; margin: 0 auto; }
          h1 { font-size: 3em; margin-bottom: 20px; }
          .back-btn { 
            display: inline-block; 
            padding: 10px 20px; 
            background: rgba(255,255,255,0.2); 
            text-decoration: none; 
            color: white; 
            border-radius: 5px; 
            margin-top: 20px;
          }
          .back-btn:hover { background: rgba(255,255,255,0.3); }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${pageName.charAt(0).toUpperCase() + pageName.slice(1)}</h1>
          <p>Welcome to the ${pageName} page! This is a placeholder page created by your 3D Brain navigation system.</p>
          <p>You can customize this page with your actual content.</p>
          <a href="javascript:history.back()" class="back-btn">← Back to 3D Brain</a>
        </div>
      </body>
      </html>
    `;

    // Open in new window/tab
    const newWindow = window.open('', '_blank');
    newWindow.document.write(content);
    newWindow.document.close();
  }
  addParticlesSystem() {
    this.particlesSystem = new ParticleSystem(
      this,
      this.endPointsCollections,
      this.memories
    );
    this.scene.add(this.particlesSystem.particles);

    // Make xRay invisible - it may be creating a glowing orb
    if (this.particlesSystem.xRay) {
      this.particlesSystem.xRay.visible = false;
    }
  }

  toggleMemoryLabels(show) {
    if (show) {
      this.showMemoryLabels();
    } else {
      this.hideMemoryLabels();
    }
  }

  showMemoryLabels() {
    // Remove existing labels first
    this.hideMemoryLabels();

    if (!this.font || !this.particlesSystem) return;

    // Initialize HTML label tracking system
    this.htmlLabels = [];
    this.label3DPositions = [];

    // Create navigation labels for each memory type
    this.navigationItems.forEach((navItem, index) => {
      if (this.memories[navItem.key] && this.memories[navItem.key][0]) {
        const geometry = this.memories[navItem.key][0];
        if (geometry.attributes && geometry.attributes.position) {
          const positions = geometry.attributes.position.array;

          // Get a representative position from the memory region
          const sampleIndex = Math.floor(positions.length / 6) * 3; // Get a position from the middle
          const x = positions[sampleIndex] || 0;
          const y = positions[sampleIndex + 1] || 0;
          const z = positions[sampleIndex + 2] || 0;

          // Store 3D position for tracking
          const textPosition = new THREE.Vector3(x, y + 80, z);

          // Create HTML label that will track this 3D position
          const htmlLabel = this.createTrackingHTMLLabel(navItem, textPosition);

          this.htmlLabels.push(htmlLabel);
          this.label3DPositions.push({
            position3D: textPosition,
            htmlElement: htmlLabel.element,
            navItem,
            isTransitioning: false
          });
        }
      }
    });

    // Start updating label positions every frame
    this.updateHTMLLabelsFlag = true;
  }

  showMemoryLabelsGradually() {
    // Remove existing labels first
    this.hideMemoryLabels();

    if (!this.font || !this.particlesSystem) return;

    // Initialize HTML label tracking system
    this.htmlLabels = [];
    this.label3DPositions = [];

    // Create navigation labels for each memory type with staggered fade-in
    this.navigationItems.forEach((navItem, index) => {
      if (this.memories[navItem.key] && this.memories[navItem.key][0]) {
        const geometry = this.memories[navItem.key][0];
        if (geometry.attributes && geometry.attributes.position) {
          const positions = geometry.attributes.position.array;

          // Get a representative position from the memory region
          const sampleIndex = Math.floor(positions.length / 6) * 3; // Get a position from the middle
          const x = positions[sampleIndex] || 0;
          const y = positions[sampleIndex + 1] || 0;
          const z = positions[sampleIndex + 2] || 0;

          // Store 3D position for tracking
          const textPosition = new THREE.Vector3(x, y + 80, z);

          // Create HTML label that will track this 3D position
          const htmlLabel = this.createTrackingHTMLLabel(navItem, textPosition);

          // Start with opacity 0 for fade-in effect
          htmlLabel.element.style.opacity = '0';

          // Staggered fade-in animation
          setTimeout(() => {
            htmlLabel.element.style.transition = 'opacity 1.5s ease-in-out';
            htmlLabel.element.style.opacity = '1';
          }, index * 400); // 400ms delay between each tab

          this.htmlLabels.push(htmlLabel);
          this.label3DPositions.push({
            position3D: textPosition,
            htmlElement: htmlLabel.element,
            navItem,
            isTransitioning: false
          });
        }
      }
    });

    // Start updating label positions every frame
    this.updateHTMLLabelsFlag = true;
  }

  createTrackingHTMLLabel(navItem, position3D) {
    // Create HTML element that EXACTLY matches nav bar styling
    const htmlLabel = document.createElement('div');
    htmlLabel.textContent = navItem.label;
    htmlLabel.style.cssText = `
      position: fixed;
      color: rgba(255, 255, 255, 1.0);
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif;
      font-size: 14px;
      font-weight: 400;
      letter-spacing: 2px;
      text-transform: uppercase;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: default;
      z-index: 1001;
      white-space: nowrap;
      pointer-events: none;
      transition: opacity 0.5s ease;
      transform: translate(-50%, -50%);
    `;

    document.body.appendChild(htmlLabel);

    return {
      element: htmlLabel,
      position3D
    };
  }

  updateHTMLLabelPositions() {
    if (!this.updateHTMLLabelsFlag || !this.label3DPositions) return;

    for (let i = 0; i < this.label3DPositions.length; i += 1) {
      const labelData = this.label3DPositions[i];
      if (!labelData.isTransitioning) {
        // Project 3D position to screen coordinates
        const vector = labelData.position3D.clone();
        vector.project(this.camera);

        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(vector.y * 0.5) + 0.5) * window.innerHeight;

        // Update HTML element position
        labelData.htmlElement.style.left = `${x}px`;
        labelData.htmlElement.style.top = `${y}px`;
      }
    }
  }

  hideMemoryLabels() {
    if (this.font && this.particlesSystem) {
      this.font.removeText(this.particlesSystem.particles);
    }

    // Clean up HTML labels
    if (this.htmlLabels) {
      this.htmlLabels.forEach((label) => {
        if (label.element && label.element.parentNode) {
          label.element.remove();
        }
      });
      this.htmlLabels = [];
    }

    this.label3DPositions = [];
    this.updateHTMLLabelsFlag = false;
  }

  transitionToTopNav() {
    // Stop tracking 3D positions and transition to fixed nav bar positions
    this.updateHTMLLabelsFlag = false;

    if (!this.label3DPositions || this.label3DPositions.length === 0) return;

    // Create the final liquid glass nav bar HIDDEN first
    this.createFinalNavigationBar();

    // Get the actual position of the liquid glass bar
    const navContainer = document.getElementById('brain-navigation-container');
    const nav = document.getElementById('brain-navigation');

    if (!navContainer || !nav) return;

    // Hide the nav bar initially with clip-path for sweep animation
    navContainer.style.opacity = '0';
    navContainer.style.pointerEvents = 'none';
    nav.style.clipPath = 'polygon(0 0, 0 0, 0 100%, 0 100%)'; // Start clipped from left

    // Force a layout recalculation to ensure proper positioning
    const navRect = nav.getBoundingClientRect();
    if (navRect.width === 0 && navRect.height === 0) {
      console.warn('brain-navigation has zero dimensions during transition setup.');
    }

    // Get all the nav links to calculate their positions
    const navLinks = nav.querySelectorAll('a');

    // Transition each existing HTML label to match nav bar item positions
    for (let i = 0; i < this.label3DPositions.length; i += 1) {
      const labelData = this.label3DPositions[i];
      labelData.isTransitioning = true;

      const navIndex = this.navigationItems.indexOf(labelData.navItem);
      const targetLink = navLinks[navIndex];

      if (targetLink) {
        // Get the exact position of where this link will be in the nav bar
        const rect = targetLink.getBoundingClientRect();
        const finalX = rect.left + rect.width / 2;
        const finalY = rect.top + rect.height / 2;

        // Smooth transition to nav bar position - NO OPACITY CHANGE
        labelData.htmlElement.style.transition = 'left 2.5s cubic-bezier(0.4, 0.0, 0.2, 1), top 2.5s cubic-bezier(0.4, 0.0, 0.2, 1)';
        labelData.htmlElement.style.left = `${finalX}px`;
        labelData.htmlElement.style.top = `${finalY}px`;
      }
    }

    // Once tabs reach their position, reveal nav bar with left-to-right sweep
    setTimeout(() => {
      navContainer.style.transition = 'opacity 0.3s ease-in';
      navContainer.style.opacity = '1';
      navContainer.style.pointerEvents = 'auto';

      // Start the sweep animation
      nav.style.transition = 'clip-path 1.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
      requestAnimationFrame(() => {
        nav.style.clipPath = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'; // Fully revealed
      });

      // Show the control panel and bottom navigation AFTER the top nav bar animation completes
      setTimeout(() => {
        this.showControlPanel();
        this.showBottomNavigation();
      }, 1600); // Wait for sweep animation (1.5s) to complete

      // Only fade out tabs AFTER sweep has passed over them
      setTimeout(() => {
        for (let i = 0; i < this.label3DPositions.length; i += 1) {
          const labelData = this.label3DPositions[i];
          if (labelData.htmlElement) {
            labelData.htmlElement.style.transition = 'opacity 0.5s ease-out';
            labelData.htmlElement.style.opacity = '0';
          }
        }
      }, 1000); // Wait for sweep to pass over tabs
    }, 2400); // Start reveal right when tabs reach final position

    // Clean up transitioning labels after everything completes
    setTimeout(() => {
      this.cleanupTransitioningLabels();
    }, 4200);
  }

  cleanupTransitioningLabels() {
    // Clean up transitioning labels
    if (this.htmlLabels) {
      this.htmlLabels.forEach((label) => {
        if (label.element && label.element.parentNode) {
          label.element.remove();
        }
      });
      this.htmlLabels = [];
    }

    if (this.label3DPositions) {
      for (let i = 0; i < this.label3DPositions.length; i += 1) {
        const labelData = this.label3DPositions[i];
        if (labelData.htmlElement && labelData.htmlElement.parentNode) {
          labelData.htmlElement.remove();
        }
      }
    }

    this.label3DPositions = [];
  }

  createFinalNavigationBar() {
    // Check if navigation bar already exists
    if (document.getElementById('brain-navigation-container')) {
      return; // Already created, don't duplicate
    }

    // Create centered liquid glass capsule container
    const container = document.createElement('div');
    container.id = 'brain-navigation-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      pointer-events: auto;
    `;

    // Create the liquid glass capsule
    const nav = document.createElement('nav');
    nav.id = 'brain-navigation';
    nav.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px 40px;
      gap: 40px;
      background: rgba(0, 0, 0, 0.1);
      backdrop-filter: brightness(0.9) blur(20px) url(#liquidGlassFilter);
      -webkit-backdrop-filter: brightness(0.9) blur(20px) url(#liquidGlassFilter);
      border-radius: 28px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: inset 6px 6px 0px -6px rgba(255, 255, 255, 0.4),
                  inset 0 0 8px 1px rgba(255, 255, 255, 0.3),
                  0 8px 32px rgba(0, 0, 0, 0.5);
      position: relative;
      overflow: visible;
    `;

    // Create navigation items
    this.navigationItems.forEach((navItem) => {
      const link = document.createElement('a');
      link.href = navItem.url;
      link.textContent = navItem.label;

      link.style.cssText = `
        color: rgba(255, 255, 255, 1.0);
        text-decoration: none;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif;
        font-size: 14px;
        font-weight: 400;
        letter-spacing: 2px;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        text-transform: uppercase;
        white-space: nowrap;
        position: relative;
        display: inline-block;
        transform: scale(1);
        transform-origin: center center;
        transition: transform 0.3s ease-out;
      `;

      // Hover effects - scale from center and maintain state
      link.onmouseenter = () => {
        link.style.transform = 'scale(1.07)';
      };

      link.onmouseleave = () => {
        link.style.transform = 'scale(1)';
      };

      // Click handler
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateToPage(navItem.url);
      });

      nav.appendChild(link);
    });

    container.appendChild(nav);
    document.body.appendChild(container);
  }

  createBottomNavigationBar() {
    // Create centered liquid glass capsule container at bottom
    const container = document.createElement('div');
    container.id = 'bottom-navigation-container';
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      pointer-events: auto;
      opacity: 0;
      transition: opacity 0.5s ease;
    `;

    // Create the liquid glass capsule
    const nav = document.createElement('nav');
    nav.id = 'bottom-navigation';
    nav.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px 24px;
      gap: 20px;
      background: rgba(0, 0, 0, 0.1);
      backdrop-filter: brightness(0.9) blur(20px) url(#liquidGlassFilter);
      -webkit-backdrop-filter: brightness(0.9) blur(20px) url(#liquidGlassFilter);
      border-radius: 28px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: inset 6px 6px 0px -6px rgba(255, 255, 255, 0.4),
                  inset 0 0 8px 1px rgba(255, 255, 255, 0.3),
                  0 8px 32px rgba(0, 0, 0, 0.5);
      position: relative;
      overflow: visible;
    `;

    // Define social links with their SVG paths and URLs
    /* eslint-disable max-len */
    const socialLinks = [
      {
        name: 'LinkedIn',
        url: 'https://www.linkedin.com/in/alex-speer/',
        svg: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 100 100">
          <path d="M0 0 C1.90217285 -0.00945648 1.90217285 -0.00945648 3.84277344 -0.019104 C5.22330871 -0.0155241 6.60384271 -0.01142211 7.984375 -0.00683594 C9.40397203 -0.00818375 10.82356861 -0.01012525 12.24316406 -0.01263428 C15.21553958 -0.01558009 18.18779474 -0.01130542 21.16015625 -0.00195312 C24.96667055 0.00944119 28.77290279 0.0028788 32.57940674 -0.00909805 C35.50994993 -0.01633135 38.44042646 -0.01402199 41.37097168 -0.00884247 C42.77437371 -0.00751003 44.17778184 -0.00913946 45.58117676 -0.01380157 C47.54369997 -0.01889065 49.50624445 -0.00975642 51.46875 0 C52.58475586 0.00159119 53.70076172 0.00318237 54.85058594 0.00482178 C57.75811133 0.26087945 59.36784634 0.57430397 61.734375 2.25878906 C64.06905708 5.53877773 63.98754234 8.58152204 63.99316406 12.52441406 C63.99946838 13.7925293 64.00577271 15.06064453 64.01226807 16.3671875 C64.00868816 17.74772277 64.00458617 19.12825677 64 20.50878906 C64.00134781 21.92838609 64.00328931 23.34798267 64.00579834 24.76757812 C64.00874416 27.73995365 64.00446948 30.7122088 63.99511719 33.68457031 C63.98372287 37.49108461 63.99028526 41.29731685 64.00226212 45.1038208 C64.00949541 48.03436399 64.00718605 50.96484052 64.00200653 53.89538574 C64.0006741 55.29878778 64.00230352 56.7021959 64.00696564 58.10559082 C64.01205471 60.06811403 64.00292048 62.03065851 63.99316406 63.99316406 C63.99157288 65.10916992 63.98998169 66.22517578 63.98834229 67.375 C63.73228461 70.28252539 63.4188601 71.89226041 61.734375 74.25878906 C58.45438633 76.59347114 55.41164202 76.5119564 51.46875 76.51757812 C50.20063477 76.52388245 48.93251953 76.53018677 47.62597656 76.53668213 C46.24544129 76.53310222 44.86490729 76.52900023 43.484375 76.52441406 C42.06477797 76.52576187 40.64518139 76.52770337 39.22558594 76.5302124 C36.25321042 76.53315822 33.28095526 76.52888354 30.30859375 76.51953125 C26.50207945 76.50813694 22.69584721 76.51469932 18.88934326 76.52667618 C15.95880007 76.53390947 13.02832354 76.53160011 10.09777832 76.52642059 C8.69437629 76.52508816 7.29096816 76.52671758 5.88757324 76.5313797 C3.92505003 76.53646878 1.96250555 76.52733455 0 76.51757812 C-1.67400879 76.51519135 -1.67400879 76.51519135 -3.38183594 76.51275635 C-6.28936133 76.25669867 -7.89909634 75.94327416 -10.265625 74.25878906 C-12.60030708 70.97880039 -12.51879234 67.93605608 -12.52441406 63.99316406 C-12.53071838 62.72504883 -12.53702271 61.45693359 -12.54351807 60.15039062 C-12.53993816 58.76985536 -12.53583617 57.38932136 -12.53125 56.00878906 C-12.53259781 54.58919203 -12.53453931 53.16959545 -12.53704834 51.75 C-12.53999416 48.77762448 -12.53571948 45.80536932 -12.52636719 42.83300781 C-12.51497287 39.02649352 -12.52153526 35.22026128 -12.53351212 31.41375732 C-12.54074541 28.48321413 -12.53843605 25.5527376 -12.53325653 22.62219238 C-12.5319241 21.21879035 -12.53355352 19.81538223 -12.53821564 18.4119873 C-12.54330471 16.4494641 -12.53417048 14.48691962 -12.52441406 12.52441406 C-12.52282288 11.4084082 -12.52123169 10.29240234 -12.51959229 9.14257812 C-12.26353461 6.23505274 -11.9501101 4.62531772 -10.265625 2.25878906 C-6.98563633 -0.07589301 -3.94289202 0.00562172 0 0 Z M3.859375 16.50878906 C2.51633106 18.20382476 2.51633106 18.20382476 2.921875 20.32128906 C3.66907836 22.44591432 3.66907836 22.44591432 5.734375 24.25878906 C9.56002165 24.07121844 9.56002165 24.07121844 12.734375 22.25878906 C12.9844523 19.80068908 12.9844523 19.80068908 12.734375 17.25878906 C10.91233919 15.02912159 10.91233919 15.02912159 8.296875 14.94628906 C5.71954629 15.06559612 5.71954629 15.06559612 3.859375 16.50878906 Z M3.734375 32.25878906 C2.40067459 36.25989029 2.51102025 39.94382309 2.484375 44.13378906 C2.46375 44.936875 2.443125 45.73996094 2.421875 46.56738281 C2.39097859 51.25591331 2.5862137 54.50492452 5.734375 58.25878906 C8.27764608 58.92564845 8.27764608 58.92564845 10.734375 58.25878906 C13.71612651 53.78616179 13.06364962 49.51931106 13.046875 44.25878906 C13.06298828 43.24816406 13.07910156 42.23753906 13.09570312 41.19628906 C13.09634766 40.22691406 13.09699219 39.25753906 13.09765625 38.25878906 C13.10063721 37.37191406 13.10361816 36.48503906 13.10668945 35.57128906 C12.90627225 33.20266261 12.90627225 33.20266261 11.39916992 31.44628906 C8.25963625 29.20685633 6.77370089 30.2325718 3.734375 32.25878906 Z M24.12817383 31.42651367 C22.25873356 33.88406301 22.3613157 35.44529453 22.37109375 38.51269531 C22.37173828 39.53169922 22.37238281 40.55070312 22.37304688 41.60058594 C22.38916016 42.66341797 22.40527344 43.72625 22.421875 44.82128906 C22.41865234 45.88798828 22.41542969 46.9546875 22.41210938 48.05371094 C22.06720293 53.7140658 22.06720293 53.7140658 24.734375 58.25878906 C27.234375 58.5921224 27.234375 58.5921224 29.734375 58.25878906 C32.65975419 55.33340987 32.15693167 52.12494198 32.296875 48.19628906 C32.61444257 40.37872149 32.61444257 40.37872149 33.734375 39.25878906 C35.73395864 39.21798123 37.73482754 39.2162455 39.734375 39.25878906 C39.77175781 40.37898438 39.80914062 41.49917969 39.84765625 42.65332031 C39.91331757 44.12600996 39.97976486 45.59866472 40.046875 47.07128906 C40.06943359 47.80927734 40.09199219 48.54726563 40.11523438 49.30761719 C40.30782178 53.53790352 40.30782178 53.53790352 42.1171875 57.27441406 C43.78385427 58.48860951 43.78385427 58.48860951 46.296875 58.19628906 C48.82541292 57.49912785 48.82541292 57.49912785 49.87109375 55.49316406 C52.30942333 49.18219339 51.14693283 40.47333593 48.734375 34.25878906 C46.78297613 31.46381722 46.78297613 31.46381722 43.734375 30.25878906 C40.68189733 30.03615154 38.79267818 30.45661118 35.734375 31.25878906 C34.1444317 33.179437 34.1444317 33.179437 33.734375 35.25878906 C33.074375 35.25878906 32.414375 35.25878906 31.734375 35.25878906 C31.486875 34.61941406 31.239375 33.98003906 30.984375 33.32128906 C29.91026558 31.12707689 29.91026558 31.12707689 27.796875 30.32128906 C25.68172299 30.04653523 25.68172299 30.04653523 24.12817383 31.42651367 Z " fill="#FFFFFF" transform="translate(24.265625,11.7412109375)"/>
        </svg>`
      },
      {
        name: 'GitHub',
        url: 'https://github.com/alexanderspeer',
        svg: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 100 100">
          <path d="M0 0 C7.70307882 6.80897145 12.57985002 17.7660384 13.30078125 27.89453125 C13.57690243 41.71512309 10.39308429 52.0626912 1.0625 62.546875 C-3.06302092 66.33246535 -7.69764829 69.52238684 -12.9375 71.546875 C-15.109375 71.11328125 -15.109375 71.11328125 -16.9375 70.546875 C-16.97488281 69.44988281 -17.01226562 68.35289063 -17.05078125 67.22265625 C-17.11646653 65.76819643 -17.18291299 64.31377084 -17.25 62.859375 C-17.28383789 61.7775293 -17.28383789 61.7775293 -17.31835938 60.67382812 C-17.54685395 56.12470888 -18.28346963 53.38205561 -20.9375 49.546875 C-20.9375 48.886875 -20.9375 48.226875 -20.9375 47.546875 C-20.10605469 47.17175781 -19.27460937 46.79664063 -18.41796875 46.41015625 C-16.78794922 45.64251953 -16.78794922 45.64251953 -15.125 44.859375 C-14.04605469 44.36050781 -12.96710938 43.86164062 -11.85546875 43.34765625 C-8.62194498 41.35213489 -7.44713074 40.00190618 -5.9375 36.546875 C-5.19915571 31.97927452 -5.24665482 27.84220971 -7.4375 23.734375 C-9.86592693 18.57396776 -9.16235417 13.1599014 -8.9375 7.546875 C-10.7628125 8.2275 -10.7628125 8.2275 -12.625 8.921875 C-13.30949219 9.17710938 -13.99398437 9.43234375 -14.69921875 9.6953125 C-16.96924626 10.52541784 -16.96924626 10.52541784 -19.21484375 11.625 C-22.75181303 12.82259648 -26.11815994 12.92874579 -29.8125 12.921875 C-30.88213989 12.92380859 -30.88213989 12.92380859 -31.97338867 12.92578125 C-37.52384224 12.81350912 -40.55815107 11.80592536 -44.9375 8.546875 C-45.9275 8.546875 -46.9175 8.546875 -47.9375 8.546875 C-47.97488281 9.34351562 -48.01226562 10.14015625 -48.05078125 10.9609375 C-48.42824947 17.04483711 -49.20724997 21.08637494 -51.9375 26.546875 C-52.62176727 31.36857225 -52.42349608 35.32031346 -50.625 39.859375 C-46.69640742 43.78796758 -42.06334602 45.54956258 -36.9375 47.546875 C-37.24429688 48.15015625 -37.55109375 48.7534375 -37.8671875 49.375 C-39.02362063 51.72163073 -39.989634 54.1095053 -40.9375 56.546875 C-44.125 56.859375 -44.125 56.859375 -47.9375 56.546875 C-50.875 54.046875 -50.875 54.046875 -52.9375 51.546875 C-52.9375 54.95849498 -51.86183235 56.74784613 -49.9375 59.546875 C-46.91267637 60.69459177 -44.17239245 61.07805001 -40.9375 61.546875 C-40.9375 64.516875 -40.9375 67.486875 -40.9375 70.546875 C-49.52442077 70.18147412 -55.36155271 65.45628368 -61.1875 59.421875 C-69.75145119 49.33658317 -71.74664383 37.37330313 -70.9375 24.546875 C-69.16222366 14.07575356 -63.31502138 4.09832097 -54.9375 -2.453125 C-36.83914199 -14.34476235 -17.12672351 -12.84504263 0 0 Z " fill="#FFFFFF" transform="translate(78.9375,18.453125)"/>
        </svg>`
      },
      {
        name: 'Email',
        url: 'mailto:your.email@example.com',
        svg: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 100 100">
          <path d="M0 0 C6.12121434 2.71978983 11.68537569 6.19994774 17.3125 9.8125 C18.14410645 10.33932373 18.97571289 10.86614746 19.83251953 11.40893555 C23.42129928 13.68625567 26.99479657 15.97639452 30.50390625 18.375 C31.45136719 19.014375 32.39882813 19.65375 33.375 20.3125 C34.16648438 20.86550781 34.95796875 21.41851562 35.7734375 21.98828125 C38.78920741 23.35860477 39.87182055 23.11592648 43 22 C45.83934291 20.51285294 48.53974378 18.83398168 51.25 17.125 C52.03197754 16.64192383 52.81395508 16.15884766 53.61962891 15.66113281 C57.7337665 13.10536817 61.79676927 10.48514939 65.8203125 7.7890625 C66.58569336 7.27972168 67.35107422 6.77038086 68.13964844 6.24560547 C69.60653781 5.26415459 71.06587542 4.27130178 72.51660156 3.26611328 C77.51634537 -0.08286353 77.51634537 -0.08286353 80.21728516 0.37988281 C80.80558105 0.58452148 81.39387695 0.78916016 82 1 C82.10141463 7.33531015 82.17147114 13.67041102 82.21972656 20.00634766 C82.23984276 22.16170067 82.26713925 24.31699911 82.30175781 26.47216797 C82.35027486 29.57012395 82.37296873 32.66735846 82.390625 35.765625 C82.41127014 36.72929993 82.43191528 37.69297485 82.45318604 38.68585205 C82.45543233 45.38206379 82.45543233 45.38206379 80.10058594 48.57714844 C76.27412666 51.16903647 73.86476111 51.13126202 69.22705078 51.14526367 C68.53092682 51.14862228 67.83480286 51.1519809 67.11758423 51.15544128 C64.8101423 51.16496096 62.50277286 51.16689498 60.1953125 51.16796875 C58.59349538 51.17118091 56.99167856 51.17454495 55.38986206 51.17805481 C52.02894409 51.18404882 48.66805185 51.18589446 45.30712891 51.18530273 C41.00061923 51.18520116 36.6942746 51.19884711 32.38780403 51.21607494 C29.07810712 51.22719492 25.7684501 51.22922193 22.45873642 51.22869301 C20.87111721 51.22987337 19.28349699 51.23429829 17.69589615 51.24202538 C15.4743928 51.25182415 13.25324741 51.24894768 11.03173828 51.24291992 C9.76758087 51.24434494 8.50342346 51.24576996 7.20095825 51.24723816 C4.14310216 51.01105304 2.49123648 50.73271539 0 49 C-2.10483746 45.84274381 -2.2472059 45.12625389 -2.22705078 41.52856445 C-2.22689972 40.62785721 -2.22674866 39.72714996 -2.22659302 38.79914856 C-2.21627045 37.83031235 -2.20594788 36.86147614 -2.1953125 35.86328125 C-2.1924826 34.86870407 -2.18965271 33.87412689 -2.18673706 32.84941101 C-2.17553489 29.6703187 -2.15043014 26.49150728 -2.125 23.3125 C-2.11497025 21.15820719 -2.10584439 19.00390997 -2.09765625 16.84960938 C-2.07559546 11.56631028 -2.04211756 6.28317521 -2 1 C-1.34 0.67 -0.68 0.34 0 0 Z " fill="#FFFFFF" transform="translate(10,33)"/>
          <path d="M0 0 C0.69495575 -0.00700928 1.3899115 -0.01401855 2.10592651 -0.02124023 C4.39264426 -0.03877966 6.67811443 -0.02721326 8.96484375 -0.01367188 C10.55997962 -0.01636799 12.15511388 -0.02025141 13.75024414 -0.02526855 C17.08918952 -0.03115806 20.42770612 -0.02261874 23.76660156 -0.00390625 C28.04069652 0.0188835 32.31378673 0.0057574 36.58784485 -0.01819611 C39.88048842 -0.0326692 43.17289484 -0.02804128 46.46554565 -0.01768494 C48.04116943 -0.0150218 49.61681493 -0.01827289 51.19241333 -0.02760315 C53.39708252 -0.03779434 55.60013813 -0.02223494 57.8046875 0 C59.05757568 0.00318237 60.31046387 0.00636475 61.60131836 0.00964355 C65.44830286 0.60158581 67.12406772 1.85920039 69.90234375 4.51757812 C69.62288386 7.79912536 69.33245664 9.14712574 66.79199219 11.33520508 C65.87450195 11.886521 64.95701172 12.43783691 64.01171875 13.00585938 C62.49070557 13.93676392 62.49070557 13.93676392 60.93896484 14.88647461 C59.85437988 15.52786377 58.76979492 16.16925293 57.65234375 16.83007812 C56.55873535 17.49144775 55.46512695 18.15281738 54.33837891 18.83422852 C52.17253928 20.1439294 50.00349621 21.44834958 47.83105469 22.74707031 C45.39996438 24.21674911 43.00540654 25.71984165 40.62890625 27.27539062 C39.52289063 27.9946875 38.416875 28.71398437 37.27734375 29.45507812 C36.35695312 30.06222656 35.4365625 30.669375 34.48828125 31.29492188 C31.16975018 32.86395545 29.55349644 33.10633199 25.90234375 32.51757812 C22.63251682 31.00537934 19.63104915 29.12952454 16.58984375 27.20507812 C15.72061279 26.66616943 14.85138184 26.12726074 13.95581055 25.57202148 C12.15645596 24.45231042 10.36097984 23.32634386 8.56933594 22.19433594 C6.01058678 20.58563132 3.43284039 19.0130265 0.84765625 17.44726562 C-0.69750689 16.49297975 -2.24182022 15.5373161 -3.78515625 14.58007812 C-4.50936768 14.1446167 -5.2335791 13.70915527 -5.97973633 13.26049805 C-10.8811792 10.15463917 -10.8811792 10.15463917 -12.0546875 6.70117188 C-12.06886719 5.98058594 -12.08304688 5.26 -12.09765625 4.51757812 C-8.07342419 0.66701439 -5.51953309 0.01401978 0 0 Z " fill="#FFFFFF" transform="translate(21.09765625,15.482421875)"/>
        </svg>`
      },
      {
        name: 'Portfolio',
        url: '/portfolio',
        svg: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 100 100">
          <path d="M0 0 C1.14806625 -0.0127597 2.29613251 -0.02551941 3.47898865 -0.03866577 C4.71963577 -0.04089142 5.9602829 -0.04311707 7.23852539 -0.04541016 C8.51216446 -0.05206696 9.78580353 -0.05872375 11.09803772 -0.06558228 C13.79401611 -0.07571648 16.48959132 -0.08126327 19.18554688 -0.08007812 C22.6369737 -0.07987484 26.08757794 -0.10718546 29.53880978 -0.14162254 C32.8345176 -0.16923042 36.13021759 -0.16804045 39.42602539 -0.17041016 C41.28395973 -0.19196671 41.28395973 -0.19196671 43.1794281 -0.21395874 C44.90625572 -0.20472885 44.90625572 -0.20472885 46.66796875 -0.1953125 C48.18661781 -0.19958755 48.18661781 -0.19958755 49.73594666 -0.20394897 C53.10813689 0.4222749 54.26407611 1.667081 56.39868164 4.29052734 C57.86086254 7.21488915 57.53408611 9.79785498 57.54394531 13.06347656 C57.54730392 13.75960052 57.55066254 14.45572449 57.55412292 15.17294312 C57.5636426 17.48038505 57.56557662 19.78775448 57.56665039 22.09521484 C57.56986255 23.69703196 57.57322659 25.29884879 57.57673645 26.90066528 C57.58273046 30.26158325 57.5845761 33.6224755 57.58398438 36.98339844 C57.5838828 41.28990812 57.59752876 45.59625274 57.61475658 49.90272331 C57.62587656 53.21242022 57.62790357 56.52207725 57.62737465 59.83179092 C57.62855501 61.41941013 57.63297993 63.00703036 57.64070702 64.5946312 C57.65050579 66.81613455 57.64762932 69.03727993 57.64160156 71.25878906 C57.64302658 72.52294647 57.6444516 73.78710388 57.6459198 75.08956909 C57.40973468 78.14742518 57.13139703 79.79929086 55.39868164 82.29052734 C52.00281625 84.55443761 50.78394895 84.55101218 46.79736328 84.58105469 C45.64929703 84.59381439 44.50123077 84.6065741 43.31837463 84.61972046 C42.07772751 84.62194611 40.83708038 84.62417175 39.55883789 84.62646484 C38.28519882 84.63312164 37.01155975 84.63977844 35.69932556 84.64663696 C33.00334717 84.65677117 30.30777196 84.66231796 27.61181641 84.66113281 C24.16038958 84.66092953 20.70978534 84.68824015 17.2585535 84.72267723 C13.96284568 84.75028511 10.66714569 84.74909514 7.37133789 84.75146484 C5.51340355 84.77302139 5.51340355 84.77302139 3.61793518 84.79501343 C1.89110756 84.78578354 1.89110756 84.78578354 0.12939453 84.77636719 C-1.38925453 84.78064224 -1.38925453 84.78064224 -2.93858337 84.78500366 C-6.31077361 84.15877979 -7.46671283 82.91397369 -9.60131836 80.29052734 C-10.95571504 77.58173399 -10.66633287 75.28119467 -10.60131836 72.29052734 C-11.73569336 72.14615234 -12.87006836 72.00177734 -14.03881836 71.85302734 C-17.60131836 71.29052734 -17.60131836 71.29052734 -18.60131836 70.29052734 C-18.85131836 67.35302734 -18.85131836 67.35302734 -18.60131836 64.29052734 C-15.70039334 62.35657733 -14.70457099 61.98920793 -11.41381836 61.66552734 C-10.15569336 61.54177734 -8.89756836 61.41802734 -7.60131836 61.29052734 C-7.93131836 59.64052734 -8.26131836 57.99052734 -8.60131836 56.29052734 C-9.88006836 56.16677734 -11.15881836 56.04302734 -12.47631836 55.91552734 C-16.35131836 55.54052734 -16.35131836 55.54052734 -18.60131836 53.29052734 C-18.85131836 50.79052734 -18.85131836 50.79052734 -18.60131836 48.29052734 C-16.28837016 45.97757915 -15.1222696 45.79471759 -11.97631836 45.16552734 C-10.75041992 44.91416016 -10.75041992 44.91416016 -9.49975586 44.65771484 C-8.87327148 44.53654297 -8.24678711 44.41537109 -7.60131836 44.29052734 C-7.60131836 42.97052734 -7.60131836 41.65052734 -7.60131836 40.29052734 C-8.54104492 40.10876953 -8.54104492 40.10876953 -9.49975586 39.92333984 C-10.31702148 39.75576172 -11.13428711 39.58818359 -11.97631836 39.41552734 C-12.78842773 39.25310547 -13.60053711 39.09068359 -14.43725586 38.92333984 C-16.60131836 38.29052734 -16.60131836 38.29052734 -18.60131836 36.29052734 C-18.85131836 33.79052734 -18.85131836 33.79052734 -18.60131836 31.29052734 C-15.59514567 28.28435466 -12.77750238 28.69467418 -8.60131836 28.29052734 C-8.27131836 26.64052734 -7.94131836 24.99052734 -7.60131836 23.29052734 C-8.3115918 23.15775391 -9.02186523 23.02498047 -9.75366211 22.88818359 C-10.67276367 22.71158203 -11.59186523 22.53498047 -12.53881836 22.35302734 C-13.91360352 22.09199219 -13.91360352 22.09199219 -15.31616211 21.82568359 C-17.60131836 21.29052734 -17.60131836 21.29052734 -18.60131836 20.29052734 C-18.85131836 17.35302734 -18.85131836 17.35302734 -18.60131836 14.29052734 C-15.37340281 12.13858365 -14.31731027 12.08966292 -10.60131836 12.29052734 C-10.64256836 11.38302734 -10.68381836 10.47552734 -10.72631836 9.54052734 C-10.60411741 6.36330269 -10.35734705 4.8783591 -8.60131836 2.29052734 C-5.20545296 0.02661708 -3.98658567 0.03004251 0 0 Z M8.39868164 22.29052734 C8.06868164 23.94052734 7.73868164 25.59052734 7.39868164 27.29052734 C10.15812769 30.0499734 11.79104862 29.54858412 15.64868164 29.55615234 C16.89649414 29.55873047 18.14430664 29.56130859 19.42993164 29.56396484 C20.73961914 29.55623047 22.04930664 29.54849609 23.39868164 29.54052734 C25.36321289 29.55212891 25.36321289 29.55212891 27.36743164 29.56396484 C29.23915039 29.56009766 29.23915039 29.56009766 31.14868164 29.55615234 C32.87344727 29.55276855 32.87344727 29.55276855 34.63305664 29.54931641 C37.54067996 29.57396411 37.54067996 29.57396411 39.39868164 27.29052734 C39.06868164 25.64052734 38.73868164 23.99052734 38.39868164 22.29052734 C28.49868164 22.29052734 18.59868164 22.29052734 8.39868164 22.29052734 Z " fill="#FFFFFF" transform="translate(26.601318359375,7.70947265625)"/>
        </svg>`
      }
    ];
    /* eslint-enable max-len */

    // Create icon links
    socialLinks.forEach((link) => {
      const iconLink = document.createElement('a');
      iconLink.href = link.url;
      iconLink.target = link.name === 'Email' ? '_self' : '_blank';
      iconLink.rel = 'noopener noreferrer';
      iconLink.setAttribute('aria-label', link.name);

      iconLink.style.cssText = `
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        padding: 6px;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        background: transparent;
        position: relative;
      `;

      iconLink.innerHTML = link.svg;

      // Hover effects - no background change, just subtle movement
      iconLink.addEventListener('mouseenter', () => {
        iconLink.style.transform = 'translateY(-2px) scale(1.04)';
      });

      iconLink.addEventListener('mouseleave', () => {
        iconLink.style.transform = 'translateY(0) scale(1)';
      });

      nav.appendChild(iconLink);
    });

    container.appendChild(nav);
    document.body.appendChild(container);

    // Store reference for showing later
    this.bottomNavContainer = container;
  }

  showBottomNavigation() {
    if (this.bottomNavContainer) {
      this.bottomNavContainer.style.opacity = '1';
    }
  }

  createLiquidGlassControlPanel() {
    // Initialize control states
    this.controlStates = {
      thinking: false,
      brainstorm: false,
      zoom: 320, // Default camera distance
      isPanelOpen: false
    };

    // Store default camera position for reset (will be set after startup animation)
    this.defaultCameraPosition = null;
    this.defaultCameraDistance = 320;

    // Create the container for the entire control panel
    const panelContainer = document.createElement('div');
    panelContainer.id = 'control-panel-container';
    panelContainer.style.cssText = `
      position: fixed;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      z-index: 999;
      pointer-events: none;
    `;

    // Create the slim vertical tab (initially hidden)
    const tab = document.createElement('div');
    tab.id = 'control-panel-tab';
    tab.innerHTML = '<span>CONTROLS</span>';
    tab.style.cssText = `
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 40px;
      height: 180px;
      background: rgba(0, 0, 0, 0.1);
      backdrop-filter: brightness(0.9) blur(20px);
      -webkit-backdrop-filter: brightness(0.9) blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-left: none;
      border-radius: 0 14px 14px 0;
      box-shadow: inset 6px 6px 0px -6px rgba(255, 255, 255, 0.4),
                  inset 0 0 8px 1px rgba(255, 255, 255, 0.3),
                  0 8px 32px rgba(0, 0, 0, 0.5);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      writing-mode: vertical-rl;
      text-orientation: mixed;
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 3px;
      color: rgba(255, 255, 255, 1.0);
      transition: opacity 0.5s ease, left 0.5s ease, all 0.3s ease;
      user-select: none;
      pointer-events: auto;
      opacity: 0;
      left: -50px;
    `;

    // Create the expanded panel (hidden by default) - separate from tab with rounded corners
    const panel = document.createElement('div');
    panel.id = 'control-panel';
    panel.style.cssText = `
      position: absolute;
      left: -340px;
      top: 50%;
      transform: translateY(-50%);
      width: 280px;
      background: rgba(0, 0, 0, 0.1);
      backdrop-filter: brightness(0.9) blur(20px);
      -webkit-backdrop-filter: brightness(0.9) blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 20px;
      box-shadow: inset 6px 6px 0px -6px rgba(255, 255, 255, 0.4),
                  inset 0 0 8px 1px rgba(255, 255, 255, 0.3),
                  0 8px 32px rgba(0, 0, 0, 0.5);
      padding: 30px 20px;
      transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: auto;
      opacity: 0;
      transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
    `;

    // Panel title
    const title = document.createElement('h3');
    title.textContent = 'BRAIN CONTROLS';
    title.style.cssText = `
      margin: 0 0 20px 0;
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 2px;
      color: rgba(255, 255, 255, 1.0);
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      padding-bottom: 12px;
    `;
    panel.appendChild(title);

    // Zoom slider - symmetric range centered at 320 (default position)
    const zoomControl = this.createSliderControl('ZOOM', 20, 620, 320, (value) => {
      this.controlStates.zoom = value;
      this.setZoomDistance(value);
    });
    panel.appendChild(zoomControl);

    // Thinking toggle
    const thinkingToggle = this.createToggleControl('THINKING MODE', (enabled) => {
      this.controlStates.thinking = enabled;
      if (this.thinkingAnimation) {
        this.thinkingAnimation.isActive(enabled);
      }
    });
    panel.appendChild(thinkingToggle);

    // Brainstorm toggle
    const brainstormToggle = this.createToggleControl('BRAINSTORM', (enabled) => {
      this.controlStates.brainstorm = enabled;
      if (this.bubblesAnimation) {
        if (enabled) {
          const bubbleProgress = { p: 0.0 };
          TweenMax.to(bubbleProgress, 2.0, {
            p: 0.6,
            ease: Power4.easeOut,
            onUpdate: () => {
              this.bubblesAnimation.updateBurbleUp(bubbleProgress.p);
            }
          });
        } else {
          const bubbleProgress = { p: 0.6 };
          TweenMax.to(bubbleProgress, 2.0, {
            p: 0.0,
            ease: Power4.easeIn,
            onUpdate: () => {
              this.bubblesAnimation.updateBurbleUp(bubbleProgress.p);
            }
          });
        }
      }
    });
    panel.appendChild(brainstormToggle);

    // Reset button
    const resetButton = this.createResetButton(() => {
      this.resetBrainState();
    });
    panel.appendChild(resetButton);

    // Toggle panel visibility
    tab.addEventListener('click', () => {
      this.controlStates.isPanelOpen = !this.controlStates.isPanelOpen;
      if (this.controlStates.isPanelOpen) {
        panel.style.left = '55px';
        panel.style.opacity = '1';
        tab.style.opacity = '0.6';
      } else {
        panel.style.left = '-340px';
        panel.style.opacity = '0';
        tab.style.opacity = '1';
      }
    });

    // Hover effect on tab
    tab.addEventListener('mouseenter', () => {
      if (!this.controlStates.isPanelOpen) {
        tab.style.width = '45px';
        tab.style.background = 'rgba(255, 255, 255, 0.15)';
      }
    });

    tab.addEventListener('mouseleave', () => {
      if (!this.controlStates.isPanelOpen) {
        tab.style.width = '40px';
        tab.style.background = 'rgba(0, 0, 0, 0.6)';
      }
    });

    panelContainer.appendChild(tab);
    panelContainer.appendChild(panel);
    document.body.appendChild(panelContainer);

    // Store reference for showing later
    this.controlPanelTab = tab;
  }

  showControlPanel() {
    if (this.controlPanelTab) {
      this.controlPanelTab.style.opacity = '1';
      this.controlPanelTab.style.left = '0';
    }
  }

  createSliderControl(label, min, max, defaultValue, onChange) {
    const container = document.createElement('div');
    container.style.cssText = `
      margin-bottom: 20px;
    `;

    const labelElement = document.createElement('label');
    labelElement.textContent = label;
    labelElement.style.cssText = `
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 1.5px;
      color: rgba(255, 255, 255, 1.0);
      margin-bottom: 8px;
    `;

    const sliderContainer = document.createElement('div');
    sliderContainer.style.cssText = `
      position: relative;
      width: 100%;
    `;

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min;
    slider.max = max;
    slider.value = defaultValue;
    slider.style.cssText = `
      width: 100%;
      height: 4px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
      outline: none;
      -webkit-appearance: none;
    `;

    // Custom slider thumb styling
    const style = document.createElement('style');
    style.textContent = `
      #control-panel input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 14px;
        height: 14px;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      }
      #control-panel input[type="range"]::-moz-range-thumb {
        width: 14px;
        height: 14px;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      }
    `;
    document.head.appendChild(style);

    slider.addEventListener('input', (e) => {
      onChange(parseFloat(e.target.value));
    });

    sliderContainer.appendChild(slider);
    container.appendChild(labelElement);
    container.appendChild(sliderContainer);

    return container;
  }

  createToggleControl(label, onChange) {
    const container = document.createElement('div');
    container.style.cssText = `
      margin-bottom: 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    `;

    const labelElement = document.createElement('label');
    labelElement.textContent = label;
    labelElement.style.cssText = `
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 1.5px;
      color: rgba(255, 255, 255, 1.0);
      cursor: pointer;
      user-select: none;
    `;

    const toggle = document.createElement('div');
    toggle.className = 'toggle-switch';
    toggle.dataset.enabled = 'false';
    toggle.style.cssText = `
      width: 44px;
      height: 24px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      position: relative;
      cursor: pointer;
      transition: background 0.3s ease;
    `;

    const toggleKnob = document.createElement('div');
    toggleKnob.style.cssText = `
      width: 18px;
      height: 18px;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 50%;
      position: absolute;
      top: 3px;
      left: 3px;
      transition: left 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    `;

    toggle.appendChild(toggleKnob);

    toggle.addEventListener('click', () => {
      const isEnabled = toggle.dataset.enabled === 'true';
      const newState = !isEnabled;
      toggle.dataset.enabled = newState.toString();

      if (newState) {
        toggle.style.background = 'rgba(100, 200, 255, 0.6)';
        toggleKnob.style.left = '23px';
      } else {
        toggle.style.background = 'rgba(255, 255, 255, 0.2)';
        toggleKnob.style.left = '3px';
      }

      onChange(newState);
    });

    labelElement.addEventListener('click', () => {
      toggle.click();
    });

    container.appendChild(labelElement);
    container.appendChild(toggle);

    return container;
  }

  createResetButton(onClick) {
    const button = document.createElement('button');
    button.textContent = 'RESET';
    button.style.cssText = `
      width: 100%;
      padding: 12px;
      margin-top: 10px;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      color: rgba(255, 255, 255, 1.0);
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 2px;
      cursor: pointer;
      transition: all 0.2s ease;
      user-select: none;
    `;

    button.addEventListener('mouseenter', () => {
      button.style.background = 'rgba(255, 255, 255, 0.25)';
      button.style.transform = 'scale(1.02)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.background = 'rgba(255, 255, 255, 0.15)';
      button.style.transform = 'scale(1)';
    });

    button.addEventListener('click', onClick);

    return button;
  }

  setZoomDistance(distance) {
    // Calculate the direction from brain center to camera
    const direction = new THREE.Vector3();
    direction.subVectors(this.camera.position, this.brainCenter).normalize();

    // Set camera position at the desired distance along this direction
    this.camera.position.copy(this.brainCenter).add(direction.multiplyScalar(distance));

    // Update orbit controls
    if (this.orbitControls) {
      this.orbitControls.update();
    }
  }

  captureDefaultCameraPosition() {
    // Store the camera position after startup animation completes
    this.defaultCameraPosition = this.camera.position.clone();
    this.defaultCameraDistance = this.camera.position.distanceTo(this.brainCenter);
    console.log('Default camera position captured:', this.defaultCameraPosition);
    console.log('Default camera distance:', this.defaultCameraDistance);

    // Update the zoom slider to be centered at this exact distance
    const zoomSlider = document.querySelector('#control-panel input[type="range"]');
    if (zoomSlider) {
      // Make range symmetric around the actual default distance
      const range = 300; // 300 units in each direction
      zoomSlider.min = this.defaultCameraDistance - range;
      zoomSlider.max = this.defaultCameraDistance + range;
      zoomSlider.value = this.defaultCameraDistance;

      // Update control state
      this.controlStates.zoom = this.defaultCameraDistance;
    }
  }

  resetBrainState() {
    // Reset all toggles to off
    if (this.controlStates.thinking && this.thinkingAnimation) {
      this.thinkingAnimation.isActive(false);
    }

    if (this.controlStates.brainstorm && this.bubblesAnimation) {
      const bubbleProgress = { p: 0.6 };
      TweenMax.to(bubbleProgress, 2.0, {
        p: 0.0,
        ease: Power4.easeIn,
        onUpdate: () => {
          this.bubblesAnimation.updateBurbleUp(bubbleProgress.p);
        }
      });
    }

    // Reset camera to default position
    if (this.defaultCameraPosition) {
      this.camera.position.copy(this.defaultCameraPosition);
    } else {
      // Fallback if default wasn't captured
      this.camera.position.set(0, 0, 320);
    }

    // Reset control states
    this.controlStates = {
      thinking: false,
      brainstorm: false,
      zoom: this.defaultCameraDistance || 320,
      isPanelOpen: this.controlStates.isPanelOpen // Keep panel state
    };

    // Reset toggle UI elements
    const toggles = document.querySelectorAll('.toggle-switch');
    for (let i = 0; i < toggles.length; i += 1) {
      const toggleElement = toggles[i];
      toggleElement.dataset.enabled = 'false';
      toggleElement.style.background = 'rgba(255, 255, 255, 0.2)';
      const knob = toggleElement.querySelector('div');
      if (knob) knob.style.left = '3px';
    }

    // Reset zoom slider
    const zoomSlider = document.querySelector('#control-panel input[type="range"]');
    if (zoomSlider) {
      zoomSlider.value = this.defaultCameraDistance || 320;
    }

    // Ensure camera is looking at brain center and update orbit controls
    this.camera.lookAt(this.brainCenter);
    if (this.orbitControls) {
      this.orbitControls.target.copy(this.brainCenter);
      this.orbitControls.update();
    }
  }

  static getRandomPointOnSphere(r) {
    const u = THREE.Math.randFloat(0, 1);
    const v = THREE.Math.randFloat(0, 1);
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const x = r * Math.sin(theta) * Math.sin(phi);
    const y = r * Math.cos(theta) * Math.sin(phi);
    const z = r * Math.cos(phi);
    return {
      x,
      y,
      z,
    };
  }
}

export default MainBrain;
