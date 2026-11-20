import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createEnergyHaloMaterial } from '../Shaders';
import { MAT } from './materials';

export function IronMaidenRemPodModel({ overdrive = false }) {
  const haloMat = useMemo(() => createEnergyHaloMaterial('#c026d3'), []);
  const domesRef = useRef([]);
  const ringsGroupRef = useRef();
  const domeColors = ['#ff2a4b', '#22ff88', '#c026d3', '#f59e0b'];

  useEffect(() => () => haloMat.dispose(), [haloMat]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    haloMat.uniforms.uTime.value = t;
    haloMat.uniforms.uOverdrive.value = THREE.MathUtils.lerp(
      haloMat.uniforms.uOverdrive.value,
      overdrive ? 1 : 0,
      0.1
    );
    domesRef.current.forEach((mesh, idx) => {
      if (!mesh) return;
      const phase = Math.sin(t * (overdrive ? 14 : 3) - idx * 1.5);
      mesh.material.emissiveIntensity = overdrive
        ? 1.5 + Math.max(0, phase) * 3.5
        : 0.7 + Math.max(0, phase) * 1.4;
    });
    if (ringsGroupRef.current) {
      ringsGroupRef.current.rotation.y = t * (overdrive ? 1.8 : 0.45);
    }
  });

  return (
    <group position={[0, -1.22, 0]} rotation={[0, 0.3, 0]}>
      {/* Heavy hexagonal cast-iron base */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.92, 1.05, 0.34, 6]} />
        <meshStandardMaterial {...MAT.chassisDark} />
      </mesh>
      {/* Tarnished brass trim ring */}
      <mesh position={[0, 0.19, 0]}>
        <cylinderGeometry args={[0.78, 0.86, 0.08, 6]} />
        <meshStandardMaterial {...MAT.tarnishedBrass} />
      </mesh>
      {/* 6 Spiked Industrial Feet */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.88, -0.24, Math.sin(a) * 0.88]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.1, 0.22, 6]} />
            <meshStandardMaterial {...MAT.brushedSteel} />
          </mesh>
        );
      })}
      {/* 4 Directional Jewel-Lens Beacon Domes */}
      {domeColors.map((hex, i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        return (
          <group key={hex} position={[Math.cos(a) * 0.56, 0.26, Math.sin(a) * 0.56]}>
            <mesh>
              <cylinderGeometry args={[0.13, 0.15, 0.08, 16]} />
              <meshStandardMaterial {...MAT.chassisIron} />
            </mesh>
            <mesh ref={(el) => (domesRef.current[i] = el)} position={[0, 0.08, 0]}>
              <sphereGeometry args={[0.11, 16, 16]} />
              <meshStandardMaterial
                color={hex}
                emissive={hex}
                emissiveIntensity={1.6}
                toneMapped={false}
              />
            </mesh>
          </group>
        );
      })}
      {/* Central Telescopic Copper EM Core */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.2, 0.28, 0.28, 12]} />
        <meshStandardMaterial {...MAT.chassisIron} />
      </mesh>
      <mesh position={[0, 1.18, 0]}>
        <cylinderGeometry args={[0.045, 0.075, 1.48, 16]} />
        <meshStandardMaterial {...MAT.copperCoil} />
      </mesh>
      <mesh position={[0, 1.94, 0]}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial
          color="#e879f9"
          emissive="#c026d3"
          emissiveIntensity={overdrive ? 4.0 : 1.8}
          toneMapped={false}
        />
      </mesh>
      {/* Radiating Animated GLSL Electromagnetic Energy Rings */}
      <group ref={ringsGroupRef} position={[0, 1.15, 0]}>
        {[0.48, 0.78, 1.08].map((radius, idx) => (
          <mesh
            key={radius}
            position={[0, -0.35 + idx * 0.35, 0]}
            rotation={[Math.PI / 2 + (idx - 1) * 0.14, 0, 0]}
          >
            <torusGeometry args={[radius, 0.022, 12, 48]} />
            <primitive object={haloMat} attach="material" />
          </mesh>
        ))}
      </group>
    </group>
  );
}
