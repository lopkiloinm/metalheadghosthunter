import React, { Component, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EquipmentModel } from './EquipmentModels';

class CardWebGLErrorBoundary extends Component {
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
        <div className="flex h-full w-full items-center justify-center bg-[#090a0f] font-mono text-[11px] text-bone/50">
          3D Preview Unavailable
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Embedded interactive 3D viewport inside each EquipmentCard.
 * Uses IntersectionObserver to mount WebGL only when near the viewport,
 * pausing offscreen rendering and keeping active WebGL contexts minimal.
 */
export function EquipmentCardViewport({ modelKey, accentColor = '#ff2a4b', reducedMotion = false }) {
  const containerRef = useRef(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: '240px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-56 w-full cursor-grab overflow-hidden rounded-t-xl bg-[#090a10] active:cursor-grabbing"
      aria-label={`Interactive 3D model viewport for ${modelKey}`}
    >
      {visible ? (
        <CardWebGLErrorBoundary>
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0.55, 0.52, 5.1], fov: 36 }}
            gl={{ powerPreference: 'high-performance', antialias: true, alpha: false }}
          >
            <color attach="background" args={['#090a10']} />
            <hemisphereLight args={['#b8c7ff', '#1c0f16', 1.15]} />
            <directionalLight position={[4, 6, 5]} intensity={2.2} color="#fff7ec" />
            <directionalLight position={[-4, 3, -3]} intensity={1.1} color="#93c5fd" />
            <pointLight position={[-3.0, 1.8, 2.6]} intensity={3.2} color={accentColor} />
            <pointLight position={[2.8, -1.2, 2.0]} intensity={1.5} color="#22ff88" />
            <EquipmentModel
              modelKey={modelKey}
              overdrive={false}
              reducedMotion={reducedMotion}
              autoRotate={!reducedMotion}
              scale={modelKey === 'evp' ? 0.92 : modelKey === 'laser' ? 0.85 : 0.98}
            />
            <OrbitControls enableZoom={false} enablePan={false} enableDamping dampingFactor={0.08} />
          </Canvas>
        </CardWebGLErrorBoundary>
      ) : (
        <div className="flex h-full w-full items-center justify-center font-mono text-[10px] uppercase tracking-widest text-bone/35">
          Initializing 3D Rig...
        </div>
      )}
    </div>
  );
}
