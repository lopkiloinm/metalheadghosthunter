import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AbyssalThermalModel } from './models/AbyssalThermalModel';
import { BlackTapeEvpModel } from './models/BlackTapeEvpModel';
import { DoomspikeEmfModel } from './models/DoomspikeEmfModel';
import { IronMaidenRemPodModel } from './models/IronMaidenRemPodModel';
import { NecroSweepSpiritBoxModel } from './models/NecroSweepSpiritBoxModel';
import { PentagridLaserModel } from './models/PentagridLaserModel';

const MODELS = {
  emf: DoomspikeEmfModel,
  spiritbox: NecroSweepSpiritBoxModel,
  thermal: AbyssalThermalModel,
  rempod: IronMaidenRemPodModel,
  laser: PentagridLaserModel,
  evp: BlackTapeEvpModel,
};

export const MODEL_SCALE = { evp: 0.92, laser: 0.86 };
// Free-standing rigs stay planted on the floor instead of hovering.
const GROUNDED = { laser: true, rempod: true };

export function EquipmentModel({ modelKey, overdrive = false, reducedMotion = false, autoRotate = true, scale = 1 }) {
  const groupRef = useRef();
  const Model = MODELS[modelKey] || DoomspikeEmfModel;

  useFrame(({ clock }) => {
    if (!groupRef.current || reducedMotion) return;
    const t = clock.getElapsedTime();
    if (!GROUNDED[modelKey]) groupRef.current.position.y = Math.sin(t * 1.5) * 0.08;
    if (autoRotate) groupRef.current.rotation.y = Math.sin(t * 0.45) * 0.35 + (overdrive ? t * 0.45 : 0);
  });

  return (
    <group ref={groupRef} scale={scale * (MODEL_SCALE[modelKey] || 1)}>
      <Model overdrive={overdrive} />
    </group>
  );
}
