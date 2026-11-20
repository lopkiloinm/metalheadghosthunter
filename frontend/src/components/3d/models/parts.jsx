import React, { useMemo } from 'react';
import * as THREE from 'three';

const UP = new THREE.Vector3(0, 1, 0);

// Cylinder spanning two points, so joints always meet exactly.
export function Strut({ from, to, radius = 0.03, taper = 0.8, material, segments = 10 }) {
  const { position, quaternion, length } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    return {
      position: a.clone().add(b).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize()),
      length: dir.length(),
    };
  }, [from, to]);

  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[radius * taper, radius, length, segments]} />
      <meshStandardMaterial {...material} />
    </mesh>
  );
}
