import * as THREE from 'three';
import { Power2, TweenLite } from 'gsap';

class Font {
    constructor(loader, scene) {
        this.font = loader.FONT;
        this.scene = scene;
    }

    makeTextSprite(_message, _parentObject, _position, size = 2) {
        const message = _message;
        const parentObject = _parentObject;
        const position = _position;
        if (parentObject) {
            const group = new THREE.Group();
            this.scene.add(group);
            const textMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color(0.8, 0.9, 1.0), // Light blue color for better visibility
                side: THREE.DoubleSide,
                wireframe: false,
            });
            const textShapes = this.font.generateShapes(message, size, size);
            const text3d = new THREE.ShapeGeometry(textShapes);
            text3d.computeBoundingBox();
            const text = new THREE.Mesh(text3d, textMaterial);
            const centerOffset = text.geometry.boundingBox.max.x / 2.0;
            text.position.set(position.x - centerOffset, position.y - 10, position.z);
            text.type = 'Font';

            text.material.opacity = 0;
            text.material.transparent = true;
            parentObject.add(text);

            TweenLite.to(text.material, 2.5, { ease: Power2.easeOut, opacity: 1.0 });
            TweenLite.to(text.position, 2.5, { ease: Power2.easeOut, y: position.y + 2 });
        }
    }

    makeClickableTextSprite(_message, _parentObject, _position, size = 2, url = '#') {
        // Convert to uppercase with letter spacing (matching the CSS style)
        const message = _message.toUpperCase();
        const parentObject = _parentObject;
        const position = _position;
        if (parentObject) {
            const group = new THREE.Group();
            this.scene.add(group);
            const textMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color(1.0, 1.0, 1.0), // Pure white like the CSS (#fff)
                side: THREE.DoubleSide,
                wireframe: false,
            });

            // Create individual character meshes for letter-spacing effect
            const letterSpacing = 0.4; // Simulates CSS letter-spacing: 2px
            let currentX = 0;
            const letterGroup = new THREE.Group();

            for (let i = 0; i < message.length; i += 1) {
                const char = message[i];
                const charShapes = this.font.generateShapes(char, size, size);
                const charGeometry = new THREE.ShapeGeometry(charShapes);
                charGeometry.computeBoundingBox();
                const charMesh = new THREE.Mesh(charGeometry, textMaterial.clone());

                const charWidth = charGeometry.boundingBox.max.x - charGeometry.boundingBox.min.x;
                charMesh.position.x = currentX;
                letterGroup.add(charMesh);

                currentX += charWidth + letterSpacing;
            }

            // Center the entire letter group
            const textBounds = new THREE.Box3().setFromObject(letterGroup);
            const centerOffset = (textBounds.max.x - textBounds.min.x) / 2.0;
            letterGroup.position.set(position.x - centerOffset, position.y - 10, position.z);
            letterGroup.type = 'NavigationFont';
            letterGroup.userData = {
                url,
                originalColor: new THREE.Color(1.0, 1.0, 1.0),
                hoverColor: new THREE.Color(0.67, 0.67, 0.67), // #aaa from CSS
                isHovered: false
            };

            // Set initial opacity for all letter materials
            letterGroup.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material) {
                    const meshMaterial = child.material;
                    meshMaterial.opacity = 0;
                    meshMaterial.transparent = true;
                }
            });
            parentObject.add(letterGroup);

            // Create a larger invisible hitbox for easier clicking
            const hitboxBounds = new THREE.Box3().setFromObject(letterGroup);
            const padding = 15; // Large padding for easier clicking, but completely invisible
            const hitboxWidth = (hitboxBounds.max.x - hitboxBounds.min.x) + padding * 2;
            const hitboxHeight = (hitboxBounds.max.y - hitboxBounds.min.y) + padding * 2;

            const hitboxGeometry = new THREE.PlaneGeometry(hitboxWidth, hitboxHeight);
            const hitboxMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.0, // Completely invisible but clickable
                side: THREE.DoubleSide
            });
            const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
            hitbox.position.set(position.x, position.y - 10, position.z);
            hitbox.type = 'NavigationFont';
            hitbox.userData = {
                url,
                originalColor: new THREE.Color(1.0, 1.0, 1.0),
                hoverColor: new THREE.Color(0.67, 0.67, 0.67),
                isHovered: false,
                textMesh: letterGroup, // Reference to the actual text for color changes
                isHitbox: true
            };
            parentObject.add(hitbox);

            // Add to clickable objects array for raycasting (use hitbox instead of text)
            if (!this.clickableObjects) {
                this.clickableObjects = [];
            }
            this.clickableObjects.push(hitbox);

            // Animate all letters fading in together
            letterGroup.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material) {
                    TweenLite.to(child.material, 3.0, { ease: Power2.easeOut, opacity: 1.0 });
                }
            });
            TweenLite.to(letterGroup.position, 3.0, { ease: Power2.easeOut, y: position.y + 15 });
            TweenLite.to(hitbox.position, 3.0, { ease: Power2.easeOut, y: position.y + 15 });

            return hitbox;
        }

        return null;
    }

    removeText(parentGroup) {
        const removeFrom = parentGroup || this.scene || [];

        removeFrom.traverse((obj) => {
            if (obj instanceof THREE.Mesh && (obj.type === 'Font' || obj.type === 'NavigationFont')) {
                // Remove from clickable objects array
                if (this.clickableObjects && obj.type === 'NavigationFont') {
                    const index = this.clickableObjects.indexOf(obj);
                    if (index > -1) {
                        this.clickableObjects.splice(index, 1);
                    }
                }

                TweenLite.to(obj.material, 2.5, { ease: Power2.easeOut, opacity: 0.0 });
                TweenLite.to(obj.position, 2.5, { ease: Power2.easeOut, y: obj.position.y - 10, onComplete: () => { obj.parent.remove(obj); } });
            }
        });
    }

    facingToCamera(camera, parentGroup) {
        const facing = parentGroup || this.scene || [];

        facing.traverse((obj) => {
            if (obj instanceof THREE.Mesh && (obj.type === 'Font' || obj.type === 'NavigationFont')) {
                obj.lookAt(camera.position);
            }
        });
    }
}
export default Font;
