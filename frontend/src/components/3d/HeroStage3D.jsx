import React, { Component, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { EquipmentModel } from './EquipmentModels';
import { createEctoplasmRiftMaterial } from './Shaders';

/**
 * Instanced rising Anglesey forge embers / spectral ash particles (THREE.InstancedMesh best practice)
 */
function RisingEmbers({ count = 75, accentColor = '#ff2a4b', overdrive = false, reducedMotion = false }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 7.5,
        y: (Math.random() - 0.5) * 5.0,
        z: (Math.random() - 0.5) * 5.5,
        speed: 0.25 + Math.random() * 0.65,
        size: 0.015 + Math.random() * 0.032,
        phase: Math.random() * Math.PI * 2,
      })),
    [count]
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const speedBoost = overdrive ? 2.4 : 1.0;

    particles.forEach((p, i) => {
      const y = reducedMotion
        ? p.y
        : ((p.y + t * p.speed * speedBoost + 2.5) % 5.2) - 2.4;
      const swayX = reducedMotion ? p.x : p.x + Math.sin(t * 0.8 + p.phase) * 0.18;
      dummy.position.set(swayX, y, p.z);
      const s = p.size * (overdrive ? 1.35 : 1.0);
      dummy.scale.set(s, s, s);
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

/**
 * Undulating GLSL Ectoplasmic / Hellfire Rift Floor
 */
function EctoplasmicRiftFloor({ accentColor = '#ff2a4b', overdrive = false, reducedMotion = false }) {
  const mat = useMemo(() => createEctoplasmRiftMaterial(accentColor), []);

  useEffect(() => {
    mat.uniforms.uColor.value.set(accentColor);
  }, [accentColor, mat]);

  useEffect(() => () => mat.dispose(), [mat]);

  useFrame(({ clock }) => {
    if (!reducedMotion) {
      mat.uniforms.uTime.value = clock.getElapsedTime();
    }
    mat.uniforms.uOverdrive.value = THREE.MathUtils.lerp(
      mat.uniforms.uOverdrive.value,
      overdrive ? 1 : 0,
      0.08
    );
  });

  return (
    <mesh position={[0, -1.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[7.2, 7.2, 48, 48]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

class WebGLErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center rounded-xl border border-crimson/30 bg-iron/90 p-6 text-center">
          <p className="font-gothic text-lg text-crimson">3D WebGL Forge Viewport Unavailable</p>
          <p className="mt-2 max-w-sm text-xs text-bone/70">
            Your browser or graphics driver blocked WebGL hardware acceleration. All equipment
            specifications and rental booking tools remain fully operational below.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export function HeroStage3D({
  modelKey = 'emf',
  accentColor = '#ff2a4b',
  overdrive = false,
  reducedMotion = false,
  lowPower = false,
  cameraPreset = 'hero',
  heightClass = 'h-[440px] sm:h-[520px] lg:h-[560px]',
}) {
  const controlsRef = useRef();

  useEffect(() => {
    if (!controlsRef.current) return;
    const ctrl = controlsRef.current;
    if (cameraPreset === 'close') {
      ctrl.object.position.set(1.25, 0.55, 3.15);
    } else if (cameraPreset === 'top') {
      ctrl.object.position.set(0.4, 3.45, 2.75);
    } else {
      ctrl.object.position.set(0.45, 0.58, 5.15);
    }
    ctrl.target.set(0, 0.02, 0);
    ctrl.update();
  }, [cameraPreset, modelKey]);

  return (
    <div className={`relative w-full ${heightClass}`}>
      <WebGLErrorBoundary>
        <Canvas
          dpr={lowPower ? 1 : [1, 2]}
          camera={{ position: [0.45, 0.58, 5.15], fov: 38 }}
          gl={{
            powerPreference: 'high-performance',
            antialias: true,
            alpha: true,
          }}
        >
          <color attach="background" args={['#08080d']} />
          <fog attach="fog" args={['#08080d', 7.5, 16]} />

          {/* Forged studio dramatic lighting */}
          <hemisphereLight args={['#b8c7ff', '#1b0d14', 1.1]} />
          <ambientLight intensity={0.45} />
          <directionalLight position={[4, 6, 5]} intensity={2.2} color="#fff7ec" />
          <directionalLight position={[-4, 3, -3]} intensity={1.1} color="#93c5fd" />
          <pointLight
            position={[-3.2, 2.2, 2.8]}
            intensity={overdrive ? 5.2 : 3.0}
            color={accentColor}
          />
          <pointLight position={[3.0, -0.8, 2.0]} intensity={1.8} color="#22ff88" />
          <spotLight
            position={[0, 6.0, 2.2]}
            angle={0.6}
            penumbra={0.8}
            intensity={2.4}
            color="#ffe4c4"
          />

          <EquipmentModel
            modelKey={modelKey}
            overdrive={overdrive}
            reducedMotion={reducedMotion}
            autoRotate={!reducedMotion}
            scale={modelKey === 'evp' ? 0.94 : modelKey === 'laser' ? 0.88 : 1.0}
          />

          <EctoplasmicRiftFloor
            accentColor={accentColor}
            overdrive={overdrive}
            reducedMotion={reducedMotion}
          />

          <RisingEmbers
            count={lowPower ? 28 : 75}
            accentColor={accentColor}
            overdrive={overdrive}
            reducedMotion={reducedMotion}
          />

          <ContactShadows
            position={[0, -1.58, 0]}
            opacity={0.55}
            scale={6}
            blur={2.4}
            far={4}
            color="#000000"
          />

          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            enableDamping
            dampingFactor={0.07}
            minDistance={2.1}
            maxDistance={6.8}
            maxPolarAngle={Math.PI * 0.62}
          />

          {!lowPower && (
            <EffectComposer disableNormalPass>
              <Bloom
                luminanceThreshold={0.45}
                mipmapBlur
                intensity={overdrive ? 1.55 : 0.95}
              />
              <Vignette eskil={false} offset={0.2} darkness={0.9} />
            </EffectComposer>
          )}
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}
