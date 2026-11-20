import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createThermalScreenMaterial } from '../Shaders';
import { MAT } from './materials';
import { Strut } from './parts';

export function AbyssalThermalModel({ overdrive = false }) {
  const thermalMat = useMemo(() => createThermalScreenMaterial(), []);
  const ringRef = useRef();

  useEffect(() => () => thermalMat.dispose(), [thermalMat]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    thermalMat.uniforms.uTime.value = t;
    thermalMat.uniforms.uOverdrive.value = THREE.MathUtils.lerp(
      thermalMat.uniforms.uOverdrive.value,
      overdrive ? 1 : 0,
      0.1
    );
    if (ringRef.current) {
      ringRef.current.material.emissiveIntensity = overdrive
        ? 3.6 + Math.sin(t * 14) * 1.1
        : 1.5 + Math.sin(t * 2.5) * 0.35;
    }
  });

  return (
    <group rotation={[0.14, -0.48, 0.04]}>
      {/* Main cinema camera body */}
      <mesh>
        <boxGeometry args={[1.18, 0.92, 1.15]} />
        <meshStandardMaterial {...MAT.chassisDark} />
      </mesh>
      {/* Heavy iron protective cage & top handle */}
      <mesh position={[0, 0.66, 0]}>
        <boxGeometry args={[1.42, 0.1, 0.24]} />
        <meshStandardMaterial {...MAT.chassisIron} />
      </mesh>
      {[-0.72, 0.72].map((x, idx) => (
        <group key={idx} position={[x, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.075, 0.075, 1.32, 14]} />
            <meshStandardMaterial {...MAT.gripRubber} />
          </mesh>
          <mesh position={[0, 0.66, 0]}>
            <boxGeometry args={[0.16, 0.14, 0.26]} />
            <meshStandardMaterial {...MAT.brushedSteel} />
          </mesh>
        </group>
      ))}
      {/* Cage braces + base plate tie the side rods into the body */}
      {[-1, 1].flatMap((side) =>
        [-0.28, 0.28].map((y) => (
          <mesh key={`${side}${y}`} position={[side * 0.655, y, 0]}>
            <boxGeometry args={[0.15, 0.07, 0.12]} />
            <meshStandardMaterial {...MAT.chassisIron} />
          </mesh>
        ))
      )}
      <mesh position={[0, -0.53, 0]}>
        <boxGeometry args={[1.52, 0.14, 0.5]} />
        <meshStandardMaterial {...MAT.chassisIron} />
      </mesh>
      {[-0.4, 0.4].map((x) => (
        <mesh key={x} position={[x, 0.535, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.16, 10]} />
          <meshStandardMaterial {...MAT.brushedSteel} />
        </mesh>
      ))}
      <mesh position={[0, 0.735, 0.1]}>
        <boxGeometry args={[0.22, 0.06, 0.14]} />
        <meshStandardMaterial {...MAT.brushedSteel} />
      </mesh>
      {/* Monitor hinge arm off the left cage rod */}
      <Strut from={[-0.72, 0.12, 0]} to={[-0.68, 0.12, 0.24]} radius={0.035} taper={1} material={MAT.brushedSteel} />
      <mesh position={[-0.72, 0.12, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial {...MAT.tarnishedBrass} />
      </mesh>
      {/* Primary Ruby Germanium Thermal Lens Barrel */}
      <group position={[0, 0, 0.78]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.36, 0.42, 0.54, 24]} />
          <meshStandardMaterial {...MAT.chassisIron} />
        </mesh>
        <mesh position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.39, 0.39, 0.12, 24]} />
          <meshStandardMaterial {...MAT.tarnishedBrass} />
        </mesh>
        {/* Glowing Ruby Lens Element */}
        <mesh position={[0, 0, 0.27]}>
          <sphereGeometry args={[0.29, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color="#991128"
            emissive="#ff2a4b"
            emissiveIntensity={overdrive ? 2.4 : 0.9}
            metalness={0.9}
            roughness={0.08}
          />
        </mesh>
        {/* IR Illuminator Ring */}
        <mesh ref={ringRef} position={[0, 0, 0.28]}>
          <torusGeometry args={[0.33, 0.025, 10, 32]} />
          <meshStandardMaterial
            color="#ff5522"
            emissive="#ff5522"
            emissiveIntensity={1.8}
            toneMapped={false}
          />
        </mesh>
      </group>
      {/* Top-mounted SLS Structured Light Depth Bar */}
      <group position={[0, 0.86, 0.16]}>
        <mesh>
          <boxGeometry args={[0.88, 0.2, 0.26]} />
          <meshStandardMaterial {...MAT.chassisDark} />
        </mesh>
        {[-0.28, 0, 0.28].map((x, i) => (
          <mesh key={i} position={[x, 0, 0.14]}>
            <circleGeometry args={[0.055, 16]} />
            <meshStandardMaterial
              color="#22ff88"
              emissive="#22ff88"
              emissiveIntensity={overdrive ? 3.8 : 1.7}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
      {/* Articulated Side Flip-Out Thermal Monitor (angled toward viewer!) */}
      <group position={[-0.98, 0.12, 0.34]} rotation={[0, 0.42, 0]}>
        <mesh>
          <boxGeometry args={[0.74, 0.56, 0.06]} />
          <meshStandardMaterial {...MAT.chassisIron} />
        </mesh>
        <mesh position={[0, 0, 0.036]}>
          <planeGeometry args={[0.66, 0.48]} />
          <primitive object={thermalMat} attach="material" />
        </mesh>
      </group>
    </group>
  );
}
