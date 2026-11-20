import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createEctoplasmRiftMaterial } from './Shaders';

export function RisingEmbers({ count = 80, accentColor, overdrive = false, reducedMotion = false }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 7.5,
        y: (Math.random() - 0.5) * 5,
        z: (Math.random() - 0.5) * 5.5,
        speed: 0.25 + Math.random() * 0.65,
        size: 0.012 + Math.random() * 0.03,
        phase: Math.random() * Math.PI * 2,
      })),
    [count]
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const boost = overdrive ? 2.4 : 1;
    particles.forEach((p, i) => {
      const y = reducedMotion ? p.y : ((p.y + t * p.speed * boost + 2.5) % 5.2) - 2.4;
      const x = reducedMotion ? p.x : p.x + Math.sin(t * 0.8 + p.phase) * 0.18;
      dummy.position.set(x, y, p.z);
      dummy.scale.setScalar(p.size * (overdrive ? 1.4 : 1));
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color={accentColor} toneMapped={false} />
    </instancedMesh>
  );
}

export function RiftFloor({ accentColor, overdrive = false, reducedMotion = false }) {
  const mat = useMemo(() => createEctoplasmRiftMaterial(accentColor), []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    mat.uniforms.uColor.value.set(accentColor);
  }, [accentColor, mat]);
  useEffect(() => () => mat.dispose(), [mat]);

  useFrame(({ clock }) => {
    if (!reducedMotion) mat.uniforms.uTime.value = clock.getElapsedTime();
    mat.uniforms.uOverdrive.value = THREE.MathUtils.lerp(mat.uniforms.uOverdrive.value, overdrive ? 1 : 0, 0.08);
  });

  return (
    <mesh position={[0, -1.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[7.2, 7.2, 48, 48]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

const TICKS = Array.from({ length: 24 }, (_, i) => (i / 24) * Math.PI * 2);

// Sigil halo behind the rig; bloom turns it into a glowing forge ring.
export function RuneHalo({ accentColor, overdrive = false, reducedMotion = false }) {
  const outerRef = useRef();
  const innerRef = useRef();

  useFrame((_, delta) => {
    if (reducedMotion || !outerRef.current) return;
    outerRef.current.rotation.z += delta * (overdrive ? 0.9 : 0.16);
    innerRef.current.rotation.z -= delta * (overdrive ? 1.4 : 0.28);
  });

  return (
    <group position={[0, 0.1, -1.7]}>
      <group ref={outerRef}>
        <mesh>
          <torusGeometry args={[1.95, 0.012, 8, 160]} />
          <meshBasicMaterial color={accentColor} toneMapped={false} transparent opacity={0.9} />
        </mesh>
        {TICKS.map((a, i) => (
          <mesh key={a} position={[Math.cos(a) * 1.78, Math.sin(a) * 1.78, 0]} rotation={[0, 0, a]}>
            <boxGeometry args={[i % 3 === 0 ? 0.18 : 0.07, 0.022, 0.02]} />
            <meshBasicMaterial color={i % 3 === 0 ? '#3ff2e3' : accentColor} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <group ref={innerRef}>
        <mesh>
          <torusGeometry args={[1.52, 0.006, 8, 160]} />
          <meshBasicMaterial color="#3ff2e3" toneMapped={false} transparent opacity={0.55} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 5]}>
          <torusGeometry args={[1.38, 0.004, 3, 5]} />
          <meshBasicMaterial color={accentColor} toneMapped={false} transparent opacity={0.5} />
        </mesh>
      </group>
    </group>
  );
}
