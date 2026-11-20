import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Billboard } from '@react-three/drei';

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Billboarded smoke shroud: a noise-warped hooded silhouette with a glowing rim (fresnel-like), dark hood void, no face.
const FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uSeed;
  uniform float uOpacity;
  uniform vec3 uCyan;
  uniform vec3 uEmber;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }
  void main() {
    vec2 p = vec2((vUv.x - 0.5) * 2.0, vUv.y);
    float t = uTime * 0.22;
    float n = fbm(vec2(p.x * 2.2, p.y * 3.0 - t) + uSeed);
    float n2 = fbm(vec2(p.x * 5.0, p.y * 7.0 - t * 2.2) + uSeed * 3.1);
    p.x += (n - 0.5) * 0.5 * (1.0 - p.y) + sin(p.y * 6.0 + uTime * 0.6 + uSeed) * 0.04;
    float hw = mix(0.66, 0.3, smoothstep(0.0, 0.62, p.y));
    hw = mix(hw, 0.25, smoothstep(0.62, 0.72, p.y));
    hw *= sqrt(clamp((0.95 - p.y) / 0.2, 0.0, 1.0));
    float d = abs(p.x) - hw + (n2 - 0.5) * 0.16;
    float body = 1.0 - smoothstep(-0.22, 0.02, d);
    float rim = exp(-pow((d + 0.035) / 0.055, 2.0));
    float vfade = smoothstep(0.0, 0.42, p.y + (n - 0.5) * 0.35);
    float smoke = 0.3 + 0.7 * n2;
    float hood = 1.0 - smoothstep(0.0, 0.11, length((p - vec2(0.0, 0.8)) * vec2(1.1, 1.5)) - 0.05);
    float alpha = (body * 0.28 * smoke + rim * 0.75 * smoke) * vfade * (1.0 - hood * 0.85) * uOpacity;
    vec3 col = mix(uCyan, uEmber, smoothstep(0.32, 0.0, p.y) * 0.75) * (0.45 + rim * 0.7);
    gl_FragColor = vec4(col, alpha);
  }
`;

export function Wraith({ position = [0, 0, -3], scale = 1, seed = 0, reducedMotion = false, opacity = 0.65 }) {
  const group = useRef();
  const uniforms = useMemo(
    () => ({
      uTime: { value: seed * 10 },
      uSeed: { value: seed },
      uOpacity: { value: opacity },
      uCyan: { value: new THREE.Color('#3ff2e3') },
      uEmber: { value: new THREE.Color('#ff4a1c') },
    }),
    [seed, opacity]
  );

  useFrame((_, delta) => {
    if (reducedMotion || !group.current) return;
    const t = (uniforms.uTime.value += delta);
    group.current.position.x = position[0] + Math.sin(t * 0.11 + seed) * 0.45;
    group.current.position.y = position[1] + Math.sin(t * 0.32 + seed * 2) * 0.12;
  });

  return (
    <group ref={group} position={position} scale={scale}>
      <Billboard>
        <mesh renderOrder={-1}>
          <planeGeometry args={[1.6, 2.9]} />
          <shaderMaterial vertexShader={VERT} fragmentShader={FRAG} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </Billboard>
    </group>
  );
}

const SPOTS = {
  hero: [
    { position: [-2.9, 0.25, -3.6], scale: 1.15, seed: 1.3 },
    { position: [2.8, 0.45, -4.2], scale: 1.35, seed: 4.1 },
    { position: [0.4, 1.0, -6.2], scale: 1.8, seed: 7.7 },
  ],
  inspector: [{ position: [2.1, 0.35, -4], scale: 1.4, seed: 2.6 }],
};

export function WraithChoir({ count, layout = 'hero', eco, reducedMotion }) {
  return SPOTS[layout].slice(0, count).map((s) => <Wraith key={s.seed} {...s} opacity={eco ? 0.5 : 0.65} reducedMotion={reducedMotion} />);
}
