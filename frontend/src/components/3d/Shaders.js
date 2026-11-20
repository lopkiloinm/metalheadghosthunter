import * as THREE from 'three';

/**
 * Custom GLSL Shaders for Llanfair Spectre Forge
 * Built following premium-3d-website guidelines: lightweight single-pass fragment shaders,
 * animated via uniforms.uTime in useFrame, with explicit GPU disposal on unmount.
 */

export function createEctoplasmRiftMaterial(accentHex = '#ff2a4b') {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(accentHex) },
      uSecondary: { value: new THREE.Color('#22ff88') },
      uOverdrive: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying float vWave;
      uniform float uTime;
      uniform float uOverdrive;

      void main() {
        vUv = uv;
        vec3 pos = position;
        float dist = length(uv - 0.5) * 2.0;
        float amp = mix(0.06, 0.14, uOverdrive);
        float wave = sin(dist * 14.0 - uTime * 2.4) * amp * (1.0 - smoothstep(0.2, 1.0, dist));
        wave += cos(pos.x * 3.5 + uTime * 1.3) * 0.025;
        pos.z += wave;
        vWave = wave;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      varying float vWave;
      uniform float uTime;
      uniform vec3 uColor;
      uniform vec3 uSecondary;
      uniform float uOverdrive;

      void main() {
        vec2 centered = (vUv - 0.5) * 2.0;
        float r = length(centered);
        float angle = atan(centered.y, centered.x);

        // Concentric spectral summon rings + subtle arcane grid
        float rings = smoothstep(0.92, 0.99, sin(r * 28.0 - uTime * 3.2));
        float runeSpokes = smoothstep(0.96, 1.0, abs(sin(angle * 6.0 + uTime * 0.35))) * smoothstep(0.18, 0.72, r);
        float outerCircle = smoothstep(0.025, 0.0, abs(r - 0.82)) + smoothstep(0.015, 0.0, abs(r - 0.52));

        vec2 grid = abs(fract(vUv * 18.0 - 0.5) - 0.5) / fwidth(vUv * 18.0);
        float gridLine = 1.0 - min(min(grid.x, grid.y), 1.0);

        float radialFade = 1.0 - smoothstep(0.28, 0.98, r);
        vec3 baseTint = mix(uColor, uSecondary, 0.25 + 0.25 * sin(uTime * 0.8 + r * 6.0));
        vec3 finalColor = baseTint * (rings * 1.1 + outerCircle * 1.6 + runeSpokes * 0.55 + gridLine * 0.22);
        finalColor += uColor * (0.25 + uOverdrive * 0.65) * exp(-r * 2.6);

        float alpha = clamp((rings * 0.45 + outerCircle * 0.8 + gridLine * 0.12 + exp(-r * 2.4) * 0.35), 0.0, 0.95) * radialFade;
        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
  });
}

export function createCrtWaveformMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uOverdrive: { value: 0 },
      uColor: { value: new THREE.Color('#22ff88') },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uOverdrive;
      uniform vec3 uColor;

      void main() {
        float speed = mix(4.0, 14.0, uOverdrive);
        float freq = mix(12.0, 28.0, uOverdrive);
        float wave = 0.5
          + 0.18 * sin(vUv.x * freq + uTime * speed)
          + 0.10 * sin(vUv.x * freq * 2.7 - uTime * speed * 1.6)
          + 0.06 * cos(vUv.x * 45.0 + uTime * 22.0) * (0.4 + uOverdrive);

        float dist = abs(vUv.y - wave);
        float trace = smoothstep(0.055, 0.008, dist);
        float scan = 0.82 + 0.18 * sin(vUv.y * 90.0);
        vec3 bg = vec3(0.02, 0.06, 0.04);
        vec3 tint = mix(uColor, vec3(1.0, 0.22, 0.32), uOverdrive * 0.65);
        vec3 col = (bg + tint * trace * (1.5 + uOverdrive)) * scan;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

export function createThermalScreenMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uOverdrive: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uOverdrive;

      void main() {
        vec2 p = vUv - 0.5;
        // Spectral humanoid heat/cold silhouette drifting inside thermal monitor
        float drift = sin(uTime * 1.4) * 0.06;
        float head = exp(-length((p - vec2(drift, 0.18)) * vec2(5.5, 4.5)) * 2.2);
        float torso = exp(-length((p - vec2(drift * 0.7, -0.08)) * vec2(3.2, 2.2)) * 2.0);
        float heat = clamp(head + torso * 0.9 + 0.08 * sin(vUv.y * 30.0 + uTime * 5.0), 0.0, 1.0);

        vec3 coldBlue = vec3(0.04, 0.08, 0.28);
        vec3 violet = vec3(0.55, 0.08, 0.62);
        vec3 molten = vec3(1.0, 0.28, 0.08);
        vec3 whiteHot = vec3(1.0, 0.96, 0.72);

        vec3 col = mix(coldBlue, violet, smoothstep(0.05, 0.35, heat));
        col = mix(col, molten, smoothstep(0.35, 0.72, heat));
        col = mix(col, whiteHot, smoothstep(0.75, 0.98, heat));

        // Crosshair reticle
        float crossH = smoothstep(0.012, 0.002, abs(p.y)) * step(abs(p.x), 0.25);
        float crossV = smoothstep(0.012, 0.002, abs(p.x)) * step(abs(p.y), 0.25);
        col += vec3(0.15, 1.0, 0.55) * max(crossH, crossV) * (0.55 + uOverdrive * 0.65);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

export function createEnergyHaloMaterial(hex = '#c026d3') {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(hex) },
      uOverdrive: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uOverdrive;

      void main() {
        float pulse = 0.5 + 0.5 * sin(vUv.x * 18.0 - uTime * mix(3.5, 12.0, uOverdrive));
        float edge = sin(vUv.y * 3.14159);
        vec3 col = mix(uColor, vec3(1.0, 0.2, 0.35), uOverdrive * 0.55) * (1.2 + pulse * 0.9);
        float alpha = edge * (0.28 + pulse * 0.42) * (0.75 + uOverdrive * 0.5);
        gl_FragColor = vec4(col, alpha);
      }
    `,
  });
}
