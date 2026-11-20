import React from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, OrbitControls, Sparkles } from '@react-three/drei';
import { CameraRig, CAMERA_PRESETS } from './CameraRig';
import { EquipmentModel } from './EquipmentModel';
import { GearFallback, WebGLBoundary } from './GearFallback';
import { RiftFloor, RisingEmbers, RuneHalo } from './StageAtmosphere';
import { StageEffects } from './StageEffects';

function StudioLights({ accentColor, overdrive, eco }) {
  return (
    <>
      <hemisphereLight args={['#b8c7ff', '#1b0d08', 0.85]} />
      <directionalLight position={[4, 6, 5]} intensity={2} color="#fff3e6" />
      <directionalLight position={[-4, 3, -3]} intensity={1.2} color="#7fe9ff" />
      <pointLight position={[-3.2, 2.2, 2.8]} intensity={overdrive ? 6 : 3.2} color={accentColor} />
      <pointLight position={[3, -0.8, 2]} intensity={1.8} color="#3ff2e3" />
      <spotLight position={[0, 6, 2.2]} angle={0.55} penumbra={0.85} intensity={2.6} color="#ffd9b8" />
      <Environment resolution={eco ? 32 : 128} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#ff7a3d" position={[-4, 1, 2]} scale={[2, 5, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.6} color="#3ff2e3" position={[4, 2, -1]} scale={[2, 4, 1]} target={[0, 0, 0]} />
        <Lightformer form="ring" intensity={1.2} color="#ffffff" position={[0, 5, 0]} scale={3} target={[0, 0, 0]} />
      </Environment>
    </>
  );
}

function StageScene({ modelKey, accentColor, overdrive, reducedMotion, eco, cameraPreset }) {
  return (
    <>
      <color attach="background" args={['#07070a']} />
      <fog attach="fog" args={['#07070a', 7, 15]} />
      <StudioLights accentColor={accentColor} overdrive={overdrive} eco={eco} />
      <EquipmentModel modelKey={modelKey} overdrive={overdrive} reducedMotion={reducedMotion} autoRotate={!reducedMotion} />
      <RuneHalo accentColor={accentColor} overdrive={overdrive} reducedMotion={reducedMotion} />
      <RiftFloor accentColor={accentColor} overdrive={overdrive} reducedMotion={reducedMotion} />
      <RisingEmbers count={eco ? 24 : 90} accentColor={accentColor} overdrive={overdrive} reducedMotion={reducedMotion} />
      {!eco && <Sparkles count={60} scale={[6, 3.5, 5]} size={2.4} speed={reducedMotion ? 0 : 0.35} color="#3ff2e3" opacity={0.6} />}
      <ContactShadows position={[0, -1.58, 0]} opacity={0.6} scale={6} blur={2.4} far={4} frames={eco ? 1 : Infinity} />
      <OrbitControls makeDefault enablePan={false} enableDamping dampingFactor={0.07} minDistance={2.1} maxDistance={6.8} maxPolarAngle={Math.PI * 0.62} />
      <CameraRig preset={cameraPreset} resetKey={modelKey} instant={reducedMotion} />
      {!eco && <StageEffects overdrive={overdrive} />}
    </>
  );
}

export function HeroStage3D({ webglSupported = true, paused = false, className = '', testId = 'stage-canvas', ...scene }) {
  const { modelKey, accentColor, eco, reducedMotion } = scene;
  const fallback = <GearFallback modelKey={modelKey} accentColor={accentColor} />;
  return (
    <div className={`relative w-full ${className}`} data-testid={testId} data-eco={eco ? 'on' : 'off'}>
      {webglSupported ? (
        <WebGLBoundary fallback={fallback}>
          <Canvas
            dpr={eco ? 1 : [1, 2]}
            frameloop={paused ? 'never' : reducedMotion ? 'demand' : 'always'}
            camera={{ position: CAMERA_PRESETS.hero.position, fov: 38 }}
            gl={{ antialias: !eco, powerPreference: eco ? 'low-power' : 'high-performance' }}
          >
            <StageScene {...scene} />
          </Canvas>
        </WebGLBoundary>
      ) : (
        fallback
      )}
    </div>
  );
}
