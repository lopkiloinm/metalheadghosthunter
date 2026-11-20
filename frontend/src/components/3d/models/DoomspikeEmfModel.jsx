import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MAT } from './materials';

export function DoomspikeEmfModel({ overdrive = false }) {
  const ledsRef = useRef([]);
  const ledColors = ['#22ff88', '#84ff22', '#facc15', '#ff6b1a', '#ff1e3c'];

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const level = overdrive
      ? 3.8 + Math.sin(t * 18) * 1.3
      : 1.8 + Math.sin(t * 2.2) * 1.4 + Math.sin(t * 5.7) * 0.4;

    ledsRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const active = i <= level;
      mesh.material.emissiveIntensity = active ? (overdrive ? 4.2 : 2.2) : 0.12;
    });
  });

  return (
    <group position={[0, -0.12, 0]} rotation={[0.16, -0.35, 0.05]}>
      {/* Main beveled rugged housing */}
      <mesh castShadow>
        <boxGeometry args={[1.05, 1.95, 0.38]} />
        <meshStandardMaterial {...MAT.chassisDark} />
      </mesh>
      {/* Forged steel face plate */}
      <mesh position={[0, 0.08, 0.2]}>
        <boxGeometry args={[0.88, 1.56, 0.04]} />
        <meshStandardMaterial {...MAT.chassisIron} />
      </mesh>
      {/* Studded metal side bumpers (metalhead aesthetic!) */}
      {[-0.56, 0.56].map((x, sideIdx) => (
        <group key={sideIdx} position={[x, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.1, 1.78, 0.42]} />
            <meshStandardMaterial {...MAT.gripRubber} />
          </mesh>
          {[-0.65, -0.32, 0, 0.32, 0.65].map((y, j) => (
            <mesh key={j} position={[x > 0 ? 0.07 : -0.07, y, 0]} rotation={[0, 0, x > 0 ? -Math.PI / 2 : Math.PI / 2]}>
              <coneGeometry args={[0.055, 0.14, 6]} />
              <meshStandardMaterial {...MAT.brushedSteel} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Top EMF Sensor Dome & Copper Coil */}
      <mesh position={[0, 1.12, 0]}>
        <cylinderGeometry args={[0.26, 0.34, 0.3, 12]} />
        <meshStandardMaterial {...MAT.chassisIron} />
      </mesh>
      <mesh position={[0, 1.32, 0]}>
        <torusGeometry args={[0.16, 0.038, 12, 24]} />
        <meshStandardMaterial {...MAT.copperCoil} />
      </mesh>
      <mesh position={[0, 1.48, 0]}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial
          color="#ff2a4b"
          emissive="#ff2a4b"
          emissiveIntensity={overdrive ? 3.5 : 1.1}
          roughness={0.2}
        />
      </mesh>
      {/* 5 Dynamic Emissive EMF LEDs */}
      <mesh position={[0, 0.48, 0.22]}>
        <boxGeometry args={[0.74, 0.34, 0.05]} />
        <meshStandardMaterial color="#07080b" roughness={0.2} metalness={0.5} />
      </mesh>
      {ledColors.map((hex, i) => (
        <mesh
          key={hex}
          ref={(el) => (ledsRef.current[i] = el)}
          position={[-0.26 + i * 0.13, 0.48, 0.26]}
        >
          <sphereGeometry args={[0.048, 14, 14]} />
          <meshStandardMaterial
            color={hex}
            emissive={hex}
            emissiveIntensity={1.6}
            toneMapped={false}
          />
        </mesh>
      ))}
      {/* Brass emblem bar & engraved 666-MKIV plate */}
      <mesh position={[0, 0.1, 0.23]}>
        <boxGeometry args={[0.68, 0.12, 0.025]} />
        <meshStandardMaterial {...MAT.tarnishedBrass} />
      </mesh>
      {/* Heavy industrial rocker power button */}
      <mesh position={[0, -0.35, 0.24]} rotation={[overdrive ? -0.25 : 0.2, 0, 0]}>
        <boxGeometry args={[0.3, 0.42, 0.12]} />
        <meshStandardMaterial
          color="#b91c1c"
          emissive="#ff2a4b"
          emissiveIntensity={overdrive ? 1.5 : 0.35}
          metalness={0.4}
          roughness={0.35}
        />
      </mesh>
      {/* Bottom brass strap loop */}
      <mesh position={[0, -1.06, 0]}>
        <torusGeometry args={[0.14, 0.028, 10, 20]} />
        <meshStandardMaterial {...MAT.tarnishedBrass} />
      </mesh>
    </group>
  );
}
