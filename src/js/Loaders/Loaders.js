import * as THREE from 'three';
import 'three/examples/js/loaders/OBJLoader';

class Loaders {
    constructor(startAnimation) {
        this.BRAIN_MODEL = {};
        this.brainXRayLight = {};
        this.FONT = {};
        this.assets = new Map();
        this.models = ['BrainUVs.obj'];
        this.loadingManager = new THREE.LoadingManager();
        this.startAnimation = startAnimation;
        
        // Smooth loading animation properties
        this.currentDisplayPercentage = 0;
        this.targetPercentage = 0;
        this.animationInterval = null;
        
        this.loadingManager.onLoad = this.handlerLoad.bind(this);
        this.loadingManager.onProgress = this.handlerProgress.bind(this);
        this.loadingManager.onError = this.handlerError;
        this.loadingManager.onStart = this.handlerStart.bind(this);
        this.setModel = this.setModel.bind(this);
        
        // Start the smooth loading animation
        this.startLoadingAnimation();
        
        this.loadBrainTextures();
        this.loadOBJs();
        this.loadTextures();
        this.loadFont();
        this.loadSceneBackground();
    }

    handlerStart() {
        console.log('Starting');
        this.currentDisplayPercentage = 0;
        this.targetPercentage = 0;
    }
    
    handlerProgress(url, itemsLoaded, itemsTotal) {
        console.log(`Loading file: ${url}.\nLoaded ${itemsLoaded} of ${itemsTotal} files.`);

        // Update target percentage - the animation will smooth it out
        const percentage = Math.round((itemsLoaded / itemsTotal) * 100);
        this.targetPercentage = percentage;
    }
    
    startLoadingAnimation() {
        // Animate the loading percentage smoothly - catches up quickly to real progress
        this.animationInterval = setInterval(() => {
            const loadingPercentage = document.getElementById('loading-percentage');
            
            if (!loadingPercentage) {
                return;
            }
            
            // Calculate the difference between current and target
            const diff = this.targetPercentage - this.currentDisplayPercentage;
            
            if (diff > 0) {
                // Increment based on distance from target - faster when far, slower when close
                // This shows intermediate values without adding noticeable delay
                let increment;
                if (diff > 20) {
                    increment = Math.ceil(diff / 5); // Large jumps when far away
                } else if (diff > 5) {
                    increment = Math.ceil(diff / 3); // Medium jumps
                } else {
                    increment = 1; // Small increments when close
                }
                
                this.currentDisplayPercentage = Math.min(
                    this.currentDisplayPercentage + increment,
                    this.targetPercentage
                );
                loadingPercentage.textContent = `${this.currentDisplayPercentage}%`;
            }
            // If target is 100 and we've reached it, we can stop
            else if (this.targetPercentage === 100 && this.currentDisplayPercentage === 100) {
                clearInterval(this.animationInterval);
            }
        }, 16); // Update every 16ms (~60fps) for smooth animation
    }
    
    stopLoadingAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
    }
    handlerLoad() {
        console.log('loading Complete!');

        // Set target to 100% and wait for animation to catch up (happens fast)
        this.targetPercentage = 100;
        
        // Wait for the display to reach 100% before hiding
        const waitForComplete = () => {
            if (this.currentDisplayPercentage >= 100) {
                // Stop the animation
                this.stopLoadingAnimation();
                
                // Start the brain animation immediately to not delay the startup
                this.startAnimation();

                // Hide loading screen independently (doesn't block animation)
                setTimeout(() => {
                    const loadingScreen = document.getElementById('loading-screen');
                    if (loadingScreen) {
                        loadingScreen.style.opacity = '0';
                        setTimeout(() => {
                            loadingScreen.style.display = 'none';
                        }, 800); // Match the CSS transition duration
                    }
                }, 300); // Brief delay to show 100%, then fade out
            } else {
                // Check again in 20ms for faster response
                setTimeout(waitForComplete, 20);
            }
        };
        
        waitForComplete();
    }
    static handlerError(url) {
        console.log(`There was an error loading ${url}`);
    }
    setModel(model, i) {
        switch (i) {
            case 0:
                this.BRAIN_MODEL = model;
                break;
            case 1:
                this.XRAY_MODEL = model;
                break;
            default:
                this.BRAIN_MODEL = model;
        }
    }

    loadOBJs() {
        const loader = new THREE.OBJLoader(this.loadingManager);
        this.models.forEach((m, i) => {
            loader.load(`static/models/${m}`, (model) => {
                this.setModel(model, i);
            });
        });
    }

    loadTextures() {
        const loader = new THREE.TextureLoader(this.loadingManager);
        loader.load('static/textures/spark1.png', (t) => {
            this.spark = t;
        });
    }

    loadBrainTextures() {
        const loader = new THREE.TextureLoader(this.loadingManager);
        loader.load('static/textures/brainXRayLight.png', (t) => {
            this.brainXRayLight = t;
        });
    }

    loadSceneBackground() {
        const cubeTextureLoader = new THREE.CubeTextureLoader(this.loadingManager);
        const path = 'static/textures/sky/';
        const format = '.png';
        const urls = [
            `${path}px${format}`, `${path}nx${format}`,
            `${path}py${format}`, `${path}ny${format}`,
            `${path}pz${format}`, `${path}nz${format}`,
        ];

        cubeTextureLoader.load(urls, (textureCube) => {
            this.assets.set('sky', textureCube);
        });
    }

    loadFont() {
        const fontLoader = new THREE.FontLoader(this.loadingManager);
        // Using Helvetica for cleaner, more modern look (closer to SF Pro Display)
        fontLoader.load('static/fonts/helvetiker_regular.typeface.json', (font) => {
            this.FONT = font;
        });
    }
}

export default Loaders;
