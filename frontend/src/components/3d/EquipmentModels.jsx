import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  createCrtWaveformMaterial,
  createEnergyHaloMaterial,
  createThermalScreenMaterial,
} from './Shaders';

/**
 * Shared industrial metal PBR material presets
 */
const MAT = {
  chassisDark: { color: '#242836', metalness: 0.68, roughness: 0.34 },
  chassisIron: { color: '#394054', metalness: 0.82, roughness: 0.26 },
  brushedSteel: { color: '#c4cddb', metalness: 0.9, roughness: 0.2 },
  tarnishedBrass: { color: '#e2b357', metalness: 0.85, roughness: 0.26 },
  copperCoil: { color: '#eb8944', metalness: 0.88, roughness: 0.22 },
  gripRubber: { color: '#141720', metalness: 0.18, roughness: 0.78 },
};

/* ============================================================================
   1. K-II "DOOMSPIKE" EMF METER
   ============================================================================ */
function DoomspikeEmfModel({ overdrive = false }) {
  const ledsRef = useRef([]);
  const ledColors = ['#22ff88', '#84ff22', '#facc15', '#ff6b1a', '#ff1e3c'];

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const level = overdrive
      ? 3.8 + Math.sin(t * 18) * 1.3
      : 1.8 + Math.sin(t * 2.2) * 1.4 + Math.sin(t * 5.7) * 0.4;

    ledsRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const active = i <= level;
      mesh.material.emissiveIntensity = active ? (overdrive ? 4.2 : 2.2) : 0.12;
    });
  });

  return (
    <group position={[0, -0.12, 0]} rotation={[0.16, -0.35, 0.05]}>
      {/* Main beveled rugged housing */}
      <mesh castShadow>
        <boxGeometry args={[1.05, 1.95, 0.38]} />
        <meshStandardMaterial {...MAT.chassisDark} />
      </mesh>
      {/* Forged steel face plate */}
      <mesh position={[0, 0.08, 0.2]}>
        <boxGeometry args={[0.88, 1.56, 0.04]} />
        <meshStandardMaterial {...MAT.chassisIron} />
      </mesh>
      {/* Studded metal side bumpers (metalhead aesthetic!) */}
      {[-0.56, 0.56].map((x, sideIdx) => (
        <group key={sideIdx} position={[x, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.1, 1.78, 0.42]} />
            <meshStandardMaterial {...MAT.gripRubber} />
          </mesh>
          {[-0.65, -0.32, 0, 0.32, 0.65].map((y, j) => (
            <mesh key={j} position={[x > 0 ? 0.07 : -0.07, y, 0]} rotation={[0, 0, x > 0 ? -Math.PI / 2 : Math.PI / 2]}>
              <coneGeometry args={[0.055, 0.14, 6]} />
              <meshStandardMaterial {...MAT.brushedSteel} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Top EMF Sensor Dome & Copper Coil */}
      <mesh position={[0, 1.12, 0]}>
        <cylinderGeometry args={[0.26, 0.34, 0.3, 12]} />
        <meshStandardMaterial {...MAT.chassisIron} />
      </mesh>
      <mesh position={[0, 1.32, 0]}>
        <torusGeometry args={[0.16, 0.038, 12, 24]} />
        <meshStandardMaterial {...MAT.copperCoil} />
      </mesh>
      <mesh position={[0, 1.48, 0]}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial
          color="#ff2a4b"
          emissive="#ff2a4b"
          emissiveIntensity={overdrive ? 3.5 : 1.1}
          roughness={0.2}
        />
      </mesh>
      {/* 5 Dynamic Emissive EMF LEDs */}
      <mesh position={[0, 0.48, 0.22]}>
        <boxGeometry args={[0.74, 0.34, 0.05]} />
        <meshStandardMaterial color="#07080b" roughness={0.2} metalness={0.5} />
      </mesh>
      {ledColors.map((hex, i) => (
        <mesh
          key={hex}
          ref={(el) => (ledsRef.current[i] = el)}
          position={[-0.26 + i * 0.13, 0.48, 0.26]}
        >
          <sphereGeometry args={[0.048, 14, 14]} />
          <meshStandardMaterial
            color={hex}
            emissive={hex}
            emissiveIntensity={1.6}
            toneMapped={false}
          />
        </mesh>
      ))}
      {/* Brass emblem bar & engraved 666-MKIV plate */}
      <mesh position={[0, 0.1, 0.23]}>
        <boxGeometry args={[0.68, 0.12, 0.025]} />
        <meshStandardMaterial {...MAT.tarnishedBrass} />
      </mesh>
      {/* Heavy industrial rocker power button */}
      <mesh position={[0, -0.35, 0.24]} rotation={[overdrive ? -0.25 : 0.2, 0, 0]}>
        <boxGeometry args={[0.3, 0.42, 0.12]} />
        <meshStandardMaterial
          color="#b91c1c"
          emissive="#ff2a4b"
          emissiveIntensity={overdrive ? 1.5 : 0.35}
          metalness={0.4}
          roughness={0.35}
        />
      </mesh>
      {/* Bottom brass strap loop */}
      <mesh position={[0, -1.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.14, 0.028, 10, 20]} />
        <meshStandardMaterial {...MAT.tarnishedBrass} />
      </mesh>
    </group>
  );
}

/* ============================================================================
   2. SBM-7 "NECRO-SWEEP" SPIRIT BOX
   ============================================================================ */
function NecroSweepSpiritBoxModel({ overdrive = false }) {
  const crtMat = useMemo(() => createCrtWaveformMaterial(), []);
  const tipRef = useRef();
  const knob1Ref = useRef();
  const knob2Ref = useRef();

  useEffect(() => () => crtMat.dispose(), [crtMat]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    crtMat.uniforms.uTime.value = t;
    crtMat.uniforms.uOverdrive.value = THREE.MathUtils.lerp(
      crtMat.uniforms.uOverdrive.value,
      overdrive ? 1 : 0,
      0.1
    );
    if (tipRef.current) {
      tipRef.current.material.emissiveIntensity = overdrive
        ? 2.2 + Math.sin(t * 22) * 1.8
        : 1.2 + Math.sin(t * 4) * 0.4;
    }
    if (knob1Ref.current) knob1Ref.current.rotation.z = Math.sin(t * (overdrive ? 6 : 1.2)) * 0.6;
    if (knob2Ref.current) knob2Ref.current.rotation.z = -t * (overdrive ? 3.5 : 0.4);
  });

  return (
    <group position={[0, -0.25, 0]} rotation={[0.1, -0.36, 0.02]}>
      {/* Main transceiver body */}
      <mesh>
        <boxGeometry args={[1.38, 1.72, 0.48]} />
        <meshStandardMaterial {...MAT.chassisDark} />
      </mesh>
      {/* Armored corner brackets */}
      {[
        [-0.68, 0.84],
        [0.68, 0.84],
        [-0.68, -0.84],
        [0.68, -0.84],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0]}>
          <boxGeometry args={[0.16, 0.16, 0.54]} />
          <meshStandardMaterial {...MAT.brushedSteel} />
        </mesh>
      ))}
      {/* Display bezel */}
      <mesh position={[0, 0.44, 0.245]}>
        <boxGeometry args={[1.16, 0.54, 0.02]} />
        <meshStandardMaterial {...MAT.tarnishedBrass} />
      </mesh>
      {/* Animated GLSL OLED Frequency Waveform Display (placed cleanly ahead of bezel) */}
      <mesh position={[0, 0.44, 0.265]}>
        <planeGeometry args={[1.08, 0.46]} />
        <primitive object={crtMat} attach="material" />
      </mesh>
      {/* Dual Marshall-style knurled tuning dials */}
      {[
        [-0.36, -0.02, knob1Ref],
        [0.36, -0.02, knob2Ref],
      ].map(([x, y, ref], idx) => (
        <group key={idx} position={[x, y, 0.28]} ref={ref}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.17, 0.19, 0.14, 18]} />
            <meshStandardMaterial {...MAT.chassisIron} />
          </mesh>
          <mesh position={[0, 0, 0.075]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.02, 18]} />
            <meshStandardMaterial {...MAT.tarnishedBrass} />
          </mesh>
          <mesh position={[0, 0.08, 0.09]}>
            <boxGeometry args={[0.025, 0.08, 0.02]} />
            <meshStandardMaterial color="#ffffff" emissive="#22ff88" emissiveIntensity={1.4} />
          </mesh>
        </group>
      ))}
      {/* Speaker grille with glowing crimson acoustic core behind slats */}
      <mesh position={[0, -0.52, 0.23]}>
        <planeGeometry args={[1.02, 0.42]} />
        <meshStandardMaterial
          color="#2a050b"
          emissive="#ff2a4b"
          emissiveIntensity={overdrive ? 1.8 : 0.45}
        />
      </mesh>
      {[-0.14, -0.07, 0, 0.07, 0.14].map((offset, i) => (
        <mesh key={i} position={[0, -0.52 + offset, 0.255]}>
          <boxGeometry args={[1.06, 0.028, 0.03]} />
          <meshStandardMaterial {...MAT.chassisIron} />
        </mesh>
      ))}
      {/* Telescopic Chrome Whip Antenna + Glowing Beacon Tip */}
      <mesh position={[0.48, 1.32, -0.06]}>
        <cylinderGeometry args={[0.022, 0.045, 1.12, 12]} />
        <meshStandardMaterial {...MAT.brushedSteel} />
      </mesh>
      <mesh ref={tipRef} position={[0.48, 1.9, -0.06]}>
        <sphereGeometry args={[0.065, 14, 14]} />
        <meshStandardMaterial
          color="#22ff88"
          emissive="#22ff88"
          emissiveIntensity={1.8}
          toneMapped={false}
        />
      </mesh>
      {/* 6.35mm Guitar Amp Line-Out Jack on Top */}
      <mesh position={[-0.4, 0.92, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.14, 14]} />
        <meshStandardMaterial {...MAT.tarnishedBrass} />
      </mesh>
    </group>
  );
}

/* ============================================================================
   3. SLS-X "ABYSSAL RIG" THERMAL & LIDAR CAMERA
   ============================================================================ */
function AbyssalThermalModel({ overdrive = false }) {
  const thermalMat = useMemo(() => createThermalScreenMaterial(), []);
  const ringRef = useRef();

  useEffect(() => () => thermalMat.dispose(), [thermalMat]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    thermalMat.uniforms.uTime.value = t;
    thermalMat.uniforms.uOverdrive.value = THREE.MathUtils.lerp(
      thermalMat.uniforms.uOverdrive.value,
      overdrive ? 1 : 0,
      0.1
    );
    if (ringRef.current) {
      ringRef.current.material.emissiveIntensity = overdrive
        ? 3.6 + Math.sin(t * 14) * 1.1
        : 1.5 + Math.sin(t * 2.5) * 0.35;
    }
  });

  return (
    <group rotation={[0.14, -0.48, 0.04]}>
      {/* Main cinema camera body */}
      <mesh>
        <boxGeometry args={[1.18, 0.92, 1.15]} />
        <meshStandardMaterial {...MAT.chassisDark} />
      </mesh>
      {/* Heavy iron protective cage & top handle */}
      <mesh position={[0, 0.66, 0]}>
        <boxGeometry args={[1.42, 0.1, 0.24]} />
        <meshStandardMaterial {...MAT.chassisIron} />
      </mesh>
      {[-0.72, 0.72].map((x, idx) => (
        <group key={idx} position={[x, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.075, 0.075, 1.32, 14]} />
            <meshStandardMaterial {...MAT.gripRubber} />
          </mesh>
          <mesh position={[0, 0.66, 0]}>
            <boxGeometry args={[0.16, 0.14, 0.26]} />
            <meshStandardMaterial {...MAT.brushedSteel} />
          </mesh>
        </group>
      ))}
      {/* Primary Ruby Germanium Thermal Lens Barrel */}
      <group position={[0, 0, 0.78]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.36, 0.42, 0.54, 24]} />
          <meshStandardMaterial {...MAT.chassisIron} />
        </mesh>
        <mesh position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.39, 0.39, 0.12, 24]} />
          <meshStandardMaterial {...MAT.tarnishedBrass} />
        </mesh>
        {/* Glowing Ruby Lens Element */}
        <mesh position={[0, 0, 0.27]}>
          <sphereGeometry args={[0.29, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color="#991128"
            emissive="#ff2a4b"
            emissiveIntensity={overdrive ? 2.4 : 0.9}
            metalness={0.9}
            roughness={0.08}
          />
        </mesh>
        {/* IR Illuminator Ring */}
        <mesh ref={ringRef} position={[0, 0, 0.28]}>
          <torusGeometry args={[0.33, 0.025, 10, 32]} />
          <meshStandardMaterial
            color="#ff5522"
            emissive="#ff5522"
            emissiveIntensity={1.8}
            toneMapped={false}
          />
        </mesh>
      </group>
      {/* Top-mounted SLS Structured Light Depth Bar */}
      <group position={[0, 0.86, 0.16]}>
        <mesh>
          <boxGeometry args={[0.88, 0.2, 0.26]} />
          <meshStandardMaterial {...MAT.chassisDark} />
        </mesh>
        {[-0.28, 0, 0.28].map((x, i) => (
          <mesh key={i} position={[x, 0, 0.14]}>
            <circleGeometry args={[0.055, 16]} />
            <meshStandardMaterial
              color="#22ff88"
              emissive="#22ff88"
              emissiveIntensity={overdrive ? 3.8 : 1.7}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
      {/* Articulated Side Flip-Out Thermal Monitor (angled toward viewer!) */}
      <group position={[-0.98, 0.12, 0.34]} rotation={[0, 0.42, 0]}>
        <mesh>
          <boxGeometry args={[0.74, 0.56, 0.06]} />
          <meshStandardMaterial {...MAT.chassisIron} />
        </mesh>
        <mesh position={[0, 0, 0.036]}>
          <planeGeometry args={[0.66, 0.48]} />
          <primitive object={thermalMat} attach="material" />
        </mesh>
      </group>
    </group>
  );
}

/* ============================================================================
   4. REM-POD "IRON MAIDEN" PROXIMITY TOWER
   ============================================================================ */
function IronMaidenRemPodModel({ overdrive = false }) {
  const haloMat = useMemo(() => createEnergyHaloMaterial('#c026d3'), []);
  const domesRef = useRef([]);
  const ringsGroupRef = useRef();
  const domeColors = ['#ff2a4b', '#22ff88', '#c026d3', '#f59e0b'];

  useEffect(() => () => haloMat.dispose(), [haloMat]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    haloMat.uniforms.uTime.value = t;
    haloMat.uniforms.uOverdrive.value = THREE.MathUtils.lerp(
      haloMat.uniforms.uOverdrive.value,
      overdrive ? 1 : 0,
      0.1
    );
    domesRef.current.forEach((mesh, idx) => {
      if (!mesh) return;
      const phase = Math.sin(t * (overdrive ? 14 : 3) - idx * 1.5);
      mesh.material.emissiveIntensity = overdrive
        ? 1.5 + Math.max(0, phase) * 3.5
        : 0.7 + Math.max(0, phase) * 1.4;
    });
    if (ringsGroupRef.current) {
      ringsGroupRef.current.rotation.y = t * (overdrive ? 1.8 : 0.45);
    }
  });

  return (
    <group position={[0, -0.62, 0]} rotation={[0.14, 0.3, 0]}>
      {/* Heavy hexagonal cast-iron base */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.92, 1.05, 0.34, 6]} />
        <meshStandardMaterial {...MAT.chassisDark} />
      </mesh>
      {/* Tarnished brass trim ring */}
      <mesh position={[0, 0.19, 0]}>
        <cylinderGeometry args={[0.78, 0.86, 0.08, 6]} />
        <meshStandardMaterial {...MAT.tarnishedBrass} />
      </mesh>
      {/* 6 Spiked Industrial Feet */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.88, -0.24, Math.sin(a) * 0.88]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.1, 0.22, 6]} />
            <meshStandardMaterial {...MAT.brushedSteel} />
          </mesh>
        );
      })}
      {/* 4 Directional Jewel-Lens Beacon Domes */}
      {domeColors.map((hex, i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        return (
          <group key={hex} position={[Math.cos(a) * 0.56, 0.26, Math.sin(a) * 0.56]}>
            <mesh>
              <cylinderGeometry args={[0.13, 0.15, 0.08, 16]} />
              <meshStandardMaterial {...MAT.chassisIron} />
            </mesh>
            <mesh ref={(el) => (domesRef.current[i] = el)} position={[0, 0.08, 0]}>
              <sphereGeometry args={[0.11, 16, 16]} />
              <meshStandardMaterial
                color={hex}
                emissive={hex}
                emissiveIntensity={1.6}
                toneMapped={false}
              />
            </mesh>
          </group>
        );
      })}
      {/* Central Telescopic Copper EM Core */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.2, 0.28, 0.28, 12]} />
        <meshStandardMaterial {...MAT.chassisIron} />
      </mesh>
      <mesh position={[0, 1.18, 0]}>
        <cylinderGeometry args={[0.045, 0.075, 1.48, 16]} />
        <meshStandardMaterial {...MAT.copperCoil} />
      </mesh>
      <mesh position={[0, 1.94, 0]}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial
          color="#e879f9"
          emissive="#c026d3"
          emissiveIntensity={overdrive ? 4.0 : 1.8}
          toneMapped={false}
        />
      </mesh>
      {/* Radiating Animated GLSL Electromagnetic Energy Rings */}
      <group ref={ringsGroupRef} position={[0, 1.15, 0]}>
        {[0.48, 0.78, 1.08].map((radius, idx) => (
          <mesh
            key={radius}
            position={[0, -0.35 + idx * 0.35, 0]}
            rotation={[Math.PI / 2 + (idx - 1) * 0.14, 0, 0]}
          >
            <torusGeometry args={[radius, 0.022, 12, 48]} />
            <primitive object={haloMat} attach="material" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ============================================================================
   5. SLS-LASER "PENTAGRID" MATRIX PROJECTOR
   ============================================================================ */
function PentagridLaserModel({ overdrive = false }) {
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
    <group rotation={[0.15, -0.52, 0]}>
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
      {/* Heavy Tripod Yoke & 3 Legs */}
      <mesh position={[0, -0.45, -0.1]}>
        <cylinderGeometry args={[0.14, 0.18, 0.28, 12]} />
        <meshStandardMaterial {...MAT.brushedSteel} />
      </mesh>
      {[0, 1, 2].map((i) => {
        const angle = (i / 3) * Math.PI * 2 + 0.4;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.42, -0.92, -0.1 + Math.sin(angle) * 0.42]}
            rotation={[Math.sin(angle) * 0.55, 0, -Math.cos(angle) * 0.55]}
          >
            <cylinderGeometry args={[0.04, 0.03, 1.05, 10]} />
            <meshStandardMaterial {...MAT.chassisIron} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ============================================================================
   6. EVP-8 "BLACK TAPE" PARABOLIC MIC & REEL RECORDER
   ============================================================================ */
function BlackTapeEvpModel({ overdrive = false }) {
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
        {/* Pistol Grip */}
        <mesh position={[0, -0.58, -0.25]} rotation={[0.22, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.62, 12]} />
          <meshStandardMaterial {...MAT.gripRubber} />
        </mesh>
      </group>
    </group>
  );
}

/* ============================================================================
   UNIFIED ANIMATED MODEL WRAPPER
   ============================================================================ */
export function EquipmentModel({
  modelKey,
  overdrive = false,
  reducedMotion = false,
  autoRotate = true,
  scale = 1,
}) {
  const groupRef = useRef();

  useFrame(({ clock }) => {
    if (!groupRef.current || reducedMotion) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(t * 1.5) * 0.08;
    if (autoRotate) {
      groupRef.current.rotation.y = Math.sin(t * 0.45) * 0.35 + (overdrive ? t * 0.45 : 0);
    }
  });

  const renderInner = () => {
    switch (modelKey) {
      case 'emf':
        return <DoomspikeEmfModel overdrive={overdrive} />;
      case 'spiritbox':
        return <NecroSweepSpiritBoxModel overdrive={overdrive} />;
      case 'thermal':
        return <AbyssalThermalModel overdrive={overdrive} />;
      case 'rempod':
        return <IronMaidenRemPodModel overdrive={overdrive} />;
      case 'laser':
        return <PentagridLaserModel overdrive={overdrive} />;
      case 'evp':
        return <BlackTapeEvpModel overdrive={overdrive} />;
      default:
        return <DoomspikeEmfModel overdrive={overdrive} />;
    }
  };

  return (
    <group ref={groupRef} scale={scale}>
      {renderInner()}
    </group>
  );
}
