import React, { useMemo } from 'react';
import { Bloom, ChromaticAberration, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

export function StageEffects({ overdrive = false }) {
  const offset = useMemo(
    () => (overdrive ? new THREE.Vector2(0.0022, 0.0014) : new THREE.Vector2(0.0006, 0.0004)),
    [overdrive]
  );
  return (
    <EffectComposer disableNormalPass>
      <Bloom luminanceThreshold={0.42} mipmapBlur intensity={overdrive ? 1.7 : 1.05} radius={0.75} />
      <ChromaticAberration offset={offset} radialModulation={false} modulationOffset={0} />
      <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
      <Vignette eskil={false} offset={0.22} darkness={0.88} />
    </EffectComposer>
  );
}
