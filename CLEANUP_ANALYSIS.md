# 3D Brain Website - File Usage Analysis & Cleanup Recommendations

## ✅ FILES CURRENTLY IN USE (DO NOT DELETE)

### Core Application Files
- `src/app.js` - Entry point
- `src/js/MainBrain.js` - Main application logic
- `src/js/views/AbstractApplication.js` - Base 3D setup
- `src/js/Loaders/Loaders.js` - Asset loading manager

### Service Files (ACTIVELY USED)
- `src/js/services/bubblesAnimation.js` - Memory bubble animations
- `src/js/services/thinkingAnimation.js` - Thinking/flashing animations
- `src/js/services/particlesSystem.js` - Brain particle system
- `src/js/services/font.js` - 3D text rendering
- `src/js/services/chunks.js` - Shader chunks for particles

### Shader Files (ACTIVELY USED)
- `src/js/shaders/glow.vert` - Used by bubblesAnimation
- `src/js/shaders/glow.frag` - Used by bubblesAnimation
- `src/js/shaders/flashing.vert` - Used by thinkingAnimation
- `src/js/shaders/flashing.frag` - Used by thinkingAnimation
- `src/js/shaders/xRay.vert` - Used by particlesSystem
- `src/js/shaders/xRay.frag` - Used by particlesSystem

### Data Files (ACTIVELY USED)
- `src/js/data/memories.json` - Brain memory regions data
- `src/js/data/memoryMaping.json` - Memory subsystem mapping
- `src/js/data/testPayload.json` - Test data for animations
- `src/js/data/flashingCoordinates.json` - Coordinates for thinking animation

### Chunk Files (ACTIVELY USED)
- `src/js/chunks/noise.raw.xml` - Noise shader chunk
- `src/js/chunks/random.raw.xml` - Random shader chunk
- `src/js/chunks/rotate.raw.xml` - Rotation shader chunk

### 3D Models (ACTIVELY USED)
- `static/models/BrainUVs.obj` - **ONLY** model loaded by application

### Textures (ACTIVELY USED)
- `static/textures/brainXRayLight.png` - Brain texture
- `static/textures/spark1.png` - Particle texture
- `static/textures/sky/px.png` - Skybox +X
- `static/textures/sky/nx.png` - Skybox -X
- `static/textures/sky/py.png` - Skybox +Y
- `static/textures/sky/ny.png` - Skybox -Y
- `static/textures/sky/pz.png` - Skybox +Z
- `static/textures/sky/nz.png` - Skybox -Z

### Fonts (ACTIVELY USED)
- `static/fonts/helvetiker_regular.typeface.json` - Used for 3D text

### Styles
- `src/css/style.css` - Application styles

### HTML Files (KEEP FOR REFERENCE)
- `index.html` - Main entry HTML
- `public/index.html` - Build output template
- `public/404.html` - Error page for hosting

### Build Configuration (NEEDED FOR DEPLOYMENT)
- `package.json` - Dependencies and scripts
- `package-lock.json` - Locked dependency versions
- `build/` - All webpack build configuration
- `config/` - Environment configuration
- `.eslintrc.js` (if exists) - Code quality
- `.babelrc` (if exists) - JavaScript transpilation

---

## ❌ FILES TO DELETE (NOT USED BY APPLICATION)

### Unused Service Files
```
src/js/services/gui.js - GUI is commented out in MainBrain.js (line 305)
src/js/services/animations.js - Not imported anywhere
src/js/services/bezierAnimation.js - Not imported anywhere
```

### Unused Shader Files
```
src/js/shaders/custom.frag - Not imported anywhere
src/js/shaders/custom.vert - Not imported anywhere
src/js/shaders/light.vert - Not imported anywhere
src/js/shaders/lightF.frag - Not imported anywhere
src/js/shaders/noise.frag - Not imported anywhere
src/js/shaders/noise.vert - Not imported anywhere
```

### Unused 3D Models
```
static/models/amelia_standing.obj - Not loaded
static/models/amelia_standingv2.obj - Not loaded
static/models/brain_vertex_low.obj - Not loaded
static/models/brain-andre.obj - Not loaded
static/models/brain-parts-big_04.OBJ - Not loaded
static/models/brain-parts-big_06.OBJ - Not loaded
static/models/brain-parts-big_07.mtl - Not loaded
static/models/brain-parts-big_07.OBJ - Not loaded
static/models/brain-parts-big_08.OBJ - Not loaded
static/models/brain-parts-big.obj - Not loaded
static/models/burbleAnimation.blend - Blender source file
static/models/burbleAnimation.blend1 - Blender backup
static/models/path/ - Entire directory
static/models/Remeshin.mlp - MeshLab project
static/models/test.obj - Test file
static/models/untitled.blend - Blender source file
static/models/untitled.blend1 - Blender backup
static/models/README.md - Documentation
```

### Unused Textures
```
static/textures/crate.gif - Not loaded
static/textures/light-color.jpg - Not loaded
static/textures/light.jpg - Not loaded
static/textures/light.png - Not loaded
static/textures/light2.png - Not loaded
static/textures/spark2.png - Not loaded
static/textures/sky copy/ - Entire duplicate directory with .jpg versions
```

### Unused Fonts
```
static/fonts/Roboto_Regular.json - Not loaded (helvetiker is used instead)
static/fonts/README.md - Documentation
```

### Duplicate Public Directory (if exists)
```
public/static/ - This appears to be a duplicate of static/
  - Only keep one version (keep static/ in root, delete public/static/)
```

### Test Files
```
__tests__/amelia_brain.js - Jest test file (keep only if you want testing)
```

### Unrelated Project Directories
```
liquid-glass-vue/ - Entire Vue.js project (appears unrelated to main app)
  This is a separate Vue project for experimenting with glass effects
  Safe to delete or move to a different repository
```

### Favicon Assets (Optional)
```
favicons/ - Entire directory
  These appear to be unused icon assets
  Only delete if you don't plan to add favicons
```

### Miscellaneous
```
welcome.html - Standalone HTML file not integrated into build
firebase.json - Firebase hosting config (keep only if deploying to Firebase)
screenshot/ - Screenshot directory (optional, for documentation)
vendor/fast-simplex-noise.js - Not imported anywhere in the code
```

---

## 📦 DEPENDENCIES THAT MAY BE REMOVABLE

Based on code analysis, these npm packages may not be needed:

### Potentially Unused Dependencies:
```json
"socket.io-client" - Imported but never instantiated (only used in commented recording code)
"dat-gui" - Only used in the disabled GUI service
"@superguigui/wagner" - Not imported anywhere
```

### Unused Dev Dependencies:
```json
"jest" and related - If you're not running tests
"firebase-tools" - If not deploying to Firebase
```

---

## 🎯 RECOMMENDED CLEANUP STEPS

### Step 1: Delete Unused Asset Files (SAFE - Immediate Space Savings)
```bash
# Navigate to project root, then:

# Delete unused models (KEEP BrainUVs.obj ONLY)
Remove-Item static\models\amelia_standing*.obj
Remove-Item static\models\brain_vertex_low.obj
Remove-Item static\models\brain-andre.obj
Remove-Item static\models\brain-parts-big*.OBJ
Remove-Item static\models\brain-parts-big*.mtl
Remove-Item static\models\*.blend*
Remove-Item static\models\test.obj
Remove-Item static\models\untitled.*
Remove-Item static\models\Remeshin.mlp
Remove-Item -Recurse static\models\path

# Delete unused textures
Remove-Item static\textures\crate.gif
Remove-Item static\textures\light*.jpg
Remove-Item static\textures\light*.png
Remove-Item static\textures\spark2.png
Remove-Item -Recurse "static\textures\sky copy"

# Delete unused fonts
Remove-Item static\fonts\Roboto_Regular.json

# Delete duplicate public/static if it exists
Remove-Item -Recurse public\static -ErrorAction SilentlyContinue
```

### Step 2: Delete Unused Code Files (TEST FIRST)
```bash
# Delete unused services
Remove-Item src\js\services\gui.js
Remove-Item src\js\services\animations.js
Remove-Item src\js\services\bezierAnimation.js

# Delete unused shaders
Remove-Item src\js\shaders\custom.frag
Remove-Item src\js\shaders\custom.vert
Remove-Item src\js\shaders\light.vert
Remove-Item src\js\shaders\lightF.frag
Remove-Item src\js\shaders\noise.frag
Remove-Item src\js\shaders\noise.vert

# Delete unused vendor file
Remove-Item vendor\fast-simplex-noise.js
```

### Step 3: Delete Unrelated Projects
```bash
# Delete Vue project if not needed
Remove-Item -Recurse liquid-glass-vue

# Delete favicon directory if not using
Remove-Item -Recurse favicons

# Delete welcome.html if not using
Remove-Item welcome.html
```

### Step 4: Update package.json (After Testing)
Remove these unused dependencies:
- `socket.io-client`
- `dat-gui`
- `@superguigui/wagner`
- Jest-related packages (if not testing)

### Step 5: Remove Unused Imports
After deletions, remove these imports from files:
- Remove `import GUI from "./services/gui";` from MainBrain.js
- Remove `import io from "socket.io-client";` from AbstractApplication.js

---

## 📊 ESTIMATED SIZE REDUCTION

**Current Project Size:** ~XX MB (varies with node_modules)
**After Cleanup:** Estimated 30-50% reduction in static assets

- **Models:** ~50-80 MB saved (keeping only BrainUVs.obj)
- **Textures:** ~5-10 MB saved
- **liquid-glass-vue/node_modules:** ~100+ MB saved
- **Code files:** ~50-100 KB saved

---

## ⚠️ IMPORTANT NOTES FOR HEROKU DEPLOYMENT

1. **Keep these for deployment:**
   - `package.json` and `package-lock.json`
   - `build/` directory
   - All files in `static/` directory (after cleanup)
   - `index.html` and `public/index.html`

2. **Create a `.slugignore` file** for Heroku to exclude from deployment:
```
__tests__
screenshot
*.md
.git
.gitignore
.eslintrc.js
```

3. **Update package.json scripts** for Heroku:
```json
{
  "scripts": {
    "start": "node server.js",  // You'll need a simple Node.js server
    "build": "node build/build.js",
    "heroku-postbuild": "npm run build"
  }
}
```

4. **You'll need to add a simple server** (create `server.js`):
```javascript
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

And add express to dependencies:
```bash
npm install express --save
```

---

## ✅ TESTING CHECKLIST

After cleanup, verify:
- [ ] Application loads without errors
- [ ] Brain model renders correctly
- [ ] Startup animation works
- [ ] Navigation tabs appear and are clickable
- [ ] Control panel opens and controls work
- [ ] Particles animate correctly
- [ ] Build process completes: `npm run build`
- [ ] Development server runs: `npm run dev`

---

## 🔄 ROLLBACK PLAN

Before deleting anything:
1. Commit current state to git
2. Create a backup: `git branch backup-before-cleanup`
3. If issues occur: `git checkout backup-before-cleanup`

