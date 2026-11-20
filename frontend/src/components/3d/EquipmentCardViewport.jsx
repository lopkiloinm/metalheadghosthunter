import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EquipmentModel } from './EquipmentModel';
import { GearFallback, WebGLBoundary } from './GearFallback';

// Per-card 3D preview; the WebGL context only exists while the card is near the viewport.
export function EquipmentCardViewport({ modelKey, accentColor, reducedMotion, eco, webglSupported, paused }) {
  const ref = useRef(null);
  const [nearView, setNearView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setNearView(true);
      return undefined;
    }
    const io = new IntersectionObserver(([entry]) => setNearView(entry.isIntersecting), { rootMargin: '200px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const fallback = <GearFallback modelKey={modelKey} accentColor={accentColor} compact />;

  return (
    <div ref={ref} className="relative h-60 w-full cursor-grab overflow-hidden bg-void active:cursor-grabbing" aria-label={`Interactive 3D preview: ${modelKey}`}>
      <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(circle at 50% 60%, ${accentColor}26, transparent 65%)` }} />
      {!webglSupported ? (
        fallback
      ) : nearView ? (
        <WebGLBoundary fallback={fallback}>
          <Canvas
            dpr={eco ? 1 : [1, 1.5]}
            frameloop={paused ? 'never' : reducedMotion ? 'demand' : 'always'}
            camera={{ position: [0.55, 0.52, 5.1], fov: 36 }}
            gl={{ antialias: !eco, alpha: true, powerPreference: 'low-power' }}
          >
            <hemisphereLight args={['#b8c7ff', '#1c0f16', 1.15]} />
            <directionalLight position={[4, 6, 5]} intensity={2.2} color="#fff7ec" />
            <directionalLight position={[-4, 3, -3]} intensity={1.1} color="#7fe9ff" />
            <pointLight position={[-3, 1.8, 2.6]} intensity={3.2} color={accentColor} />
            <pointLight position={[2.8, -1.2, 2]} intensity={1.4} color="#3ff2e3" />
            <EquipmentModel modelKey={modelKey} reducedMotion={reducedMotion} autoRotate={!reducedMotion} scale={0.98} />
            <OrbitControls enableZoom={false} enablePan={false} enableDamping dampingFactor={0.08} />
          </Canvas>
        </WebGLBoundary>
      ) : (
        <div className="overline flex h-full items-center justify-center text-ash">Heating the forge…</div>
      )}
    </div>
  );
}
