import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createCrtWaveformMaterial } from '../Shaders';
import { MAT } from './materials';

export function NecroSweepSpiritBoxModel({ overdrive = false }) {
  const crtMat = useMemo(() => createCrtWaveformMaterial(), []);
  const tipRef = useRef();
  const knob1Ref = useRef();
  const knob2Ref = useRef();

  useEffect(() => () => crtMat.dispose(), [crtMat]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    crtMat.uniforms.uTime.value = t;
    crtMat.uniforms.uOverdrive.value = THREE.MathUtils.lerp(
      crtMat.uniforms.uOverdrive.value,
      overdrive ? 1 : 0,
      0.1
    );
    if (tipRef.current) {
      tipRef.current.material.emissiveIntensity = overdrive
        ? 2.2 + Math.sin(t * 22) * 1.8
        : 1.2 + Math.sin(t * 4) * 0.4;
    }
    if (knob1Ref.current) knob1Ref.current.rotation.z = Math.sin(t * (overdrive ? 6 : 1.2)) * 0.6;
    if (knob2Ref.current) knob2Ref.current.rotation.z = -t * (overdrive ? 3.5 : 0.4);
  });

  return (
    <group position={[0, -0.25, 0]} rotation={[0.1, -0.36, 0.02]}>
      {/* Main transceiver body */}
      <mesh>
        <boxGeometry args={[1.38, 1.72, 0.48]} />
        <meshStandardMaterial {...MAT.chassisDark} />
      </mesh>
      {/* Armored corner brackets */}
      {[
        [-0.68, 0.84],
        [0.68, 0.84],
        [-0.68, -0.84],
        [0.68, -0.84],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0]}>
          <boxGeometry args={[0.16, 0.16, 0.54]} />
          <meshStandardMaterial {...MAT.brushedSteel} />
        </mesh>
      ))}
      {/* Display bezel */}
      <mesh position={[0, 0.44, 0.245]}>
        <boxGeometry args={[1.16, 0.54, 0.02]} />
        <meshStandardMaterial {...MAT.tarnishedBrass} />
      </mesh>
      {/* Animated GLSL OLED Frequency Waveform Display (placed cleanly ahead of bezel) */}
      <mesh position={[0, 0.44, 0.265]}>
        <planeGeometry args={[1.08, 0.46]} />
        <primitive object={crtMat} attach="material" />
      </mesh>
      {/* Dual Marshall-style knurled tuning dials */}
      {[
        [-0.36, -0.02, knob1Ref],
        [0.36, -0.02, knob2Ref],
      ].map(([x, y, ref], idx) => (
        <group key={idx} position={[x, y, 0.28]} ref={ref}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.17, 0.19, 0.14, 18]} />
            <meshStandardMaterial {...MAT.chassisIron} />
          </mesh>
          <mesh position={[0, 0, 0.075]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.02, 18]} />
            <meshStandardMaterial {...MAT.tarnishedBrass} />
          </mesh>
          <mesh position={[0, 0.08, 0.09]}>
            <boxGeometry args={[0.025, 0.08, 0.02]} />
            <meshStandardMaterial color="#ffffff" emissive="#22ff88" emissiveIntensity={1.4} />
          </mesh>
        </group>
      ))}
      {/* Speaker grille with glowing crimson acoustic core behind slats */}
      <mesh position={[0, -0.52, 0.23]}>
        <planeGeometry args={[1.02, 0.42]} />
        <meshStandardMaterial
          color="#2a050b"
          emissive="#ff2a4b"
          emissiveIntensity={overdrive ? 1.8 : 0.45}
        />
      </mesh>
      {[-0.14, -0.07, 0, 0.07, 0.14].map((offset, i) => (
        <mesh key={i} position={[0, -0.52 + offset, 0.255]}>
          <boxGeometry args={[1.06, 0.028, 0.03]} />
          <meshStandardMaterial {...MAT.chassisIron} />
        </mesh>
      ))}
      {/* Antenna ferrule bolted into the top plate */}
      <mesh position={[0.48, 0.9, -0.06]}>
        <cylinderGeometry args={[0.075, 0.09, 0.12, 14]} />
        <meshStandardMaterial {...MAT.tarnishedBrass} />
      </mesh>
      {/* Telescopic Chrome Whip Antenna + Glowing Beacon Tip */}
      <mesh position={[0.48, 1.32, -0.06]}>
        <cylinderGeometry args={[0.022, 0.045, 1.12, 12]} />
        <meshStandardMaterial {...MAT.brushedSteel} />
      </mesh>
      <mesh ref={tipRef} position={[0.48, 1.9, -0.06]}>
        <sphereGeometry args={[0.065, 14, 14]} />
        <meshStandardMaterial
          color="#22ff88"
          emissive="#22ff88"
          emissiveIntensity={1.8}
          toneMapped={false}
        />
      </mesh>
      {/* 6.35mm Guitar Amp Line-Out Jack on Top */}
      <mesh position={[-0.4, 0.92, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.14, 14]} />
        <meshStandardMaterial {...MAT.tarnishedBrass} />
      </mesh>
    </group>
  );
}
