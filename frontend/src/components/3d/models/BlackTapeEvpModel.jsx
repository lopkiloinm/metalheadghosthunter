import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MAT } from './materials';
import { Strut } from './parts';

export function BlackTapeEvpModel({ overdrive = false }) {
  const leftReelRef = useRef();
  const rightReelRef = useRef();
  const vuRef = useRef([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const spinSpeed = overdrive ? 6.5 : 1.8;
    if (leftReelRef.current) leftReelRef.current.rotation.z = -t * spinSpeed;
    if (rightReelRef.current) rightReelRef.current.rotation.z = -t * spinSpeed * 1.15;

    vuRef.current.forEach((bar, i) => {
      if (!bar) return;
      const lvl = Math.abs(Math.sin(t * (overdrive ? 15 : 4.2) + i * 0.7));
      bar.scale.y = 0.2 + lvl * (overdrive ? 1.4 : 0.85);
    });
  });

  const renderReel = (ref, x) => (
    <group ref={ref} position={[x, 0.18, 0.28]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.31, 0.31, 0.06, 24]} />
        <meshStandardMaterial {...MAT.brushedSteel} />
      </mesh>
      <mesh position={[0, 0, 0.035]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.04, 16]} />
        <meshStandardMaterial {...MAT.tarnishedBrass} />
      </mesh>
      {[0, 1, 2].map((s) => {
        const a = (s / 3) * Math.PI * 2;
        return (
          <mesh key={s} position={[Math.cos(a) * 0.18, Math.sin(a) * 0.18, 0.038]}>
            <boxGeometry args={[0.06, 0.15, 0.02]} />
            <meshStandardMaterial color="#060608" />
          </mesh>
        );
      })}
    </group>
  );

  return (
    <group rotation={[0.12, -0.35, 0]}>
      {/* Analog Ferric Tape Recorder Deck */}
      <group position={[-0.45, -0.1, 0]}>
        <mesh>
          <boxGeometry args={[1.48, 1.15, 0.48]} />
          <meshStandardMaterial {...MAT.chassisDark} />
        </mesh>
        {/* Brushed Steel Top Plate */}
        <mesh position={[0, 0.18, 0.245]}>
          <boxGeometry args={[1.34, 0.72, 0.02]} />
          <meshStandardMaterial {...MAT.chassisIron} />
        </mesh>
        {renderReel(leftReelRef, -0.38)}
        {renderReel(rightReelRef, 0.38)}
        {/* Illuminated Amber VU Meter Window */}
        <mesh position={[0, -0.34, 0.25]}>
          <boxGeometry args={[1.22, 0.24, 0.03]} />
          <meshStandardMaterial color="#0b0804" roughness={0.2} />
        </mesh>
        {[-0.45, -0.3, -0.15, 0, 0.15, 0.3, 0.45].map((x, i) => (
          <mesh
            key={i}
            ref={(el) => (vuRef.current[i] = el)}
            position={[x, -0.34, 0.275]}
          >
            <boxGeometry args={[0.08, 0.14, 0.02]} />
            <meshStandardMaterial
              color={i > 4 ? '#ff2a4b' : '#f59e0b'}
              emissive={i > 4 ? '#ff2a4b' : '#f59e0b'}
              emissiveIntensity={overdrive ? 3.2 : 1.7}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      {/* Translucent Smoked-Acrylic Parabolic Microphone Dish */}
      <group position={[0.92, 0.15, 0.18]} rotation={[0.12, 0.32, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[0.68, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
          <meshPhysicalMaterial
            color="#1c2330"
            metalness={0.2}
            roughness={0.12}
            transparent
            opacity={0.58}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Brass Rim Ring */}
        <mesh position={[0, 0, 0.17]}>
          <torusGeometry args={[0.66, 0.025, 10, 36]} />
          <meshStandardMaterial {...MAT.tarnishedBrass} />
        </mesh>
        {/* Condenser Mic Capsule at Focal Point */}
        <mesh position={[0, 0, 0.44]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.34, 14]} />
          <meshStandardMaterial {...MAT.brushedSteel} />
        </mesh>
        <mesh position={[0, 0, 0.25]}>
          <sphereGeometry args={[0.075, 14, 14]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#f59e0b"
            emissiveIntensity={overdrive ? 3.4 : 1.1}
            toneMapped={false}
          />
        </mesh>
        {/* Rim bracket + pistol grip */}
        <mesh position={[0, -0.66, 0.17]}>
          <boxGeometry args={[0.18, 0.12, 0.16]} />
          <meshStandardMaterial {...MAT.chassisIron} />
        </mesh>
        <Strut from={[0, -0.7, 0.15]} to={[0, -1.18, 0.04]} radius={0.095} taper={0.85} material={MAT.gripRubber} />
        {/* Mounting arm from the rim into the tape deck */}
        <Strut from={[-0.66, 0, 0.17]} to={[-0.6, 0.03, -0.3]} radius={0.045} taper={1} material={MAT.brushedSteel} />
        {[[-0.66, 0, 0.17], [-0.6, 0.03, -0.3]].map((p) => (
          <mesh key={p.join()} position={p}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshStandardMaterial {...MAT.tarnishedBrass} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
