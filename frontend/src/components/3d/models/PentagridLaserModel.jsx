import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MAT } from './materials';
import { Strut } from './parts';

export function PentagridLaserModel({ overdrive = false }) {
  const beamRef = useRef();
  const gridRef = useRef();

  const dotPositions = useMemo(() => {
    const pts = [];
    for (let x = -3; x <= 3; x++) {
      for (let y = -3; y <= 3; y++) {
        pts.push([x * 0.22, y * 0.22, 0]);
      }
    }
    return pts;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (beamRef.current) {
      beamRef.current.material.opacity = overdrive
        ? 0.26 + Math.sin(t * 16) * 0.06
        : 0.13 + Math.sin(t * 3) * 0.03;
    }
    if (gridRef.current) {
      gridRef.current.rotation.z = t * (overdrive ? 0.9 : 0.2);
    }
  });

  return (
    <group rotation={[0, -0.52, 0]}>
      <LaserTripod />
      <LaserBody overdrive={overdrive} beamRef={beamRef} gridRef={gridRef} dotPositions={dotPositions} />
    </group>
  );
}

const HEAD_Y = -0.6;
const COLLAR_Y = -0.95;
const FOOT_Y = -1.84;
const LEG_ANGLES = [0, 1, 2].map((i) => (i / 3) * Math.PI * 2 + Math.PI / 6);

function LaserTripod() {
  return (
    <group position={[0, 0, -0.17]}>
      {/* Pan head */}
      <mesh position={[0, HEAD_Y, 0]}>
        <cylinderGeometry args={[0.2, 0.17, 0.12, 20]} />
        <meshStandardMaterial {...MAT.chassisIron} />
      </mesh>
      {/* Centre column */}
      <mesh position={[0, (HEAD_Y + COLLAR_Y) / 2, 0]}>
        <cylinderGeometry args={[0.055, 0.055, HEAD_Y - COLLAR_Y, 12]} />
        <meshStandardMaterial {...MAT.brushedSteel} />
      </mesh>
      {/* Leg collar / hub */}
      <mesh position={[0, COLLAR_Y, 0]}>
        <cylinderGeometry args={[0.15, 0.13, 0.14, 18]} />
        <meshStandardMaterial {...MAT.tarnishedBrass} />
      </mesh>
      {LEG_ANGLES.map((a) => {
        const top = [Math.cos(a) * 0.11, COLLAR_Y, Math.sin(a) * 0.11];
        const foot = [Math.cos(a) * 0.82, FOOT_Y + 0.04, Math.sin(a) * 0.82];
        return (
          <group key={a}>
            <Strut from={top} to={foot} radius={0.042} taper={0.75} material={MAT.chassisIron} />
            <mesh position={foot}>
              <sphereGeometry args={[0.05, 12, 12]} />
              <meshStandardMaterial {...MAT.gripRubber} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function LaserBody({ overdrive, beamRef, gridRef, dotPositions }) {
  return (
    <group rotation={[0.15, 0, 0]}>
      {/* Milled billet aluminium emitter barrel */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.34, 1.48, 24]} />
        <meshStandardMaterial {...MAT.chassisDark} />
      </mesh>
      {/* Power-tube style CNC cooling fins */}
      {[-0.44, -0.26, -0.08, 0.1, 0.28].map((z, i) => (
        <mesh key={i} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.055, 24]} />
          <meshStandardMaterial {...MAT.chassisIron} />
        </mesh>
      ))}
      {/* Knurled Brass Diffraction Aperture Ring */}
      <mesh position={[0, 0, 0.78]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.33, 0.18, 20]} />
        <meshStandardMaterial {...MAT.tarnishedBrass} />
      </mesh>
      {/* Glowing 532nm Emerald Laser Lens */}
      <mesh position={[0, 0, 0.88]}>
        <circleGeometry args={[0.2, 20]} />
        <meshStandardMaterial
          color="#22ff88"
          emissive="#10ff70"
          emissiveIntensity={overdrive ? 4.8 : 2.6}
          toneMapped={false}
        />
      </mesh>
      {/* Volumetric Laser Cone */}
      <mesh ref={beamRef} position={[0, 0, 1.72]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.88, 1.68, 24, 1, true]} />
        <meshBasicMaterial
          color="#10ff70"
          transparent
          opacity={0.16}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Projected Emerald Matrix Dot-Field */}
      <group ref={gridRef} position={[0, 0, 2.38]}>
        {dotPositions.map(([x, y, z], idx) => (
          <mesh key={idx} position={[x, y, z]}>
            <sphereGeometry args={[overdrive ? 0.028 : 0.02, 8, 8]} />
            <meshBasicMaterial color="#22ff88" toneMapped={false} />
          </mesh>
        ))}
      </group>
      {/* Clamp band + stem bolting the barrel to the tripod head */}
      <mesh position={[0, 0, -0.17]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.345, 0.345, 0.1, 24]} />
        <meshStandardMaterial {...MAT.tarnishedBrass} />
      </mesh>
      <mesh position={[0, -0.47, -0.17]}>
        <cylinderGeometry args={[0.07, 0.09, 0.3, 12]} />
        <meshStandardMaterial {...MAT.brushedSteel} />
      </mesh>
    </group>
  );
}

