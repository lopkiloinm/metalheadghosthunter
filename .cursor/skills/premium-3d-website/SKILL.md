---
name: premium-3d-website
description: Guidelines for building premium 3D websites, focusing on custom WebGL shaders, post-processing, physics-based interactions, smooth animations, preloaders, and device optimization.
category: frontend
risk: safe
source: self
source_type: self
date_added: "2026-06-25"
author: Rsmiyani
tags: [threejs, webgl, shaders, post-processing, creative-coding, premium-design]
tools: [claude, cursor, gemini]
---

# Premium 3D Website

## Overview

This skill provides architectural guidelines and code patterns for developing premium, high-end 3D websites. It targets developers looking to implement advanced WebGL visual effects, custom shader pipelines, interactive physics elements, and immersive page transitions while maintaining high performance.

## When to Use This Skill

- Use when designing premium or award-winning creative websites with 3D elements.
- Use when integrating Three.js, React Three Fiber (R3F), or Spline with custom shaders (GLSL).
- Use when implementing post-processing effects like bloom, depth-of-field, or custom film grain.
- Use when designing interactive preloaders and high-performance asset loading strategies.
- Use when optimizing complex 3D scenes for mobile responsiveness and performance.

## How It Works

### Step 1: Establish the Render Loop and Scene Architecture
Setting up a robust WebGL context with proper resize handling and performance-friendly pixel ratios is crucial. Keep pixel ratios capped at a maximum of 2 to avoid rendering too many pixels on high-DPI screens.

### Step 2: Implement Shader Effects and Post-Processing
Incorporate post-processing pipelines (using `EffectComposer` or `@react-three/postprocessing`) to add bloom, chromatic aberration, depth of field, or film grain. Keep pass counts low and combine custom fragment shaders to minimize draw calls.

### Step 3: Integrate Interactive Physics and Motion
Utilize physics frameworks (such as Cannon.js or Rapier) or procedural spring animations to make 3D objects react to mouse hover, drag, and click inputs with organic feedback.

### Step 4: Asset Pipeline and Preloader
Optimize 3D models (using Draco compression) and load them using custom loading managers. Render interactive preloaders to entertain users while heavy assets are fetched in the background.

## Best Practices

- Set `dpr={[1, 2]}` to restrict the device pixel ratio to a maximum of 2.
- Choose renderer/composer antialiasing deliberately and measure output/performance.
- Use instance rendering (`THREE.InstancedMesh` or R3F `<Instances>`) for scenes containing multiple identical meshes.
- Respect reduced motion and provide keyboard/touch controls plus a usable non-WebGL/error fallback.
- Pause offscreen rendering, dispose owned GPU resources, and cap assets/passes.
- Compress external GLTF/OBJ models using Draco or Meshopt and verify trusted HTTPS CDNs.
