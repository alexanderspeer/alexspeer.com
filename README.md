# 3D Brain Portfolio

## About

This is my personal website, hosted on a domain I bought myself as a birthday gift (don't ask which birthday—it took me a while to build). I have to give credit to Victor Santos, who originally modeled the 3D brain mesh, and also to the YouTube channel "Better Stack" for the cool liquid glass CSS technique I adopted for the site's tabs.

## Technical Overview

The 3D Brain Portfolio is an advanced WebGL-driven application built with Three.js, featuring a GPU-accelerated particle system, six custom GLSL shaders, and a liquid glass morphism UI. The project visualizes an abstract neural network that users can explore to navigate portfolio sections such as projects, experience, and contact information.

The architecture relies on Webpack for modular builds, Babel for ES6+ transpilation, and GSAP for complex animations synchronized across subsystems. Particle geometry is powered by three-bas, supporting over 200,000 animated points rendered in real time. The brain mesh, shaders, and camera transitions are orchestrated through a custom engine that manages interactivity, raycasting, and time-based animation states.

UI elements are rendered with CSS blur effects and SVG filters, simulating a liquid glass interface. Navigation transitions seamlessly bridge 3D and 2D environments, transforming floating text into a fixed navigation bar. The project is hosted via Firebase and Heroku, using Express.js for static delivery and compression, achieving 60 FPS performance on mid-range devices.

The system demonstrates deep knowledge of GPU programming, shader optimization, and browser performance engineering, integrating physics-based effects, post-processing bloom, and adaptive viewport scaling for smooth user interaction.

## Installation

**IMPORTANT: This project requires Node.js version 14 and nothing else.** All dependencies are configured for Node 14, and other versions may cause compatibility issues.

- Install Node.js 14 (if you don't have it, use [nvm](https://github.com/nvm-sh/nvm) or download from [nodejs.org](https://nodejs.org/))
- Run `npm install`
- Run `npm run dev`
- Open http://localhost:8080
