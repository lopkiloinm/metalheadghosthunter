import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export const CAMERA_PRESETS = {
  hero: { label: '3/4', position: [0.45, 0.58, 5.15] },
  close: { label: 'Macro', position: [1.25, 0.55, 3.15] },
  top: { label: 'Overhead', position: [0.4, 3.45, 2.75] },
};

const ORIGIN = new THREE.Vector3(0, 0.02, 0);
const MAX_GLIDE_SECONDS = 1.4;

// Glides the camera to a preset exactly once, then hands control back to OrbitControls.
// Any user interaction (drag, wheel, touch -> controls 'start') cancels the glide immediately.
export function CameraRig({ preset, resetKey, instant = false }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls);
  const glide = useRef(null);

  useEffect(() => {
    const target = new THREE.Vector3(...(CAMERA_PRESETS[preset] || CAMERA_PRESETS.hero).position);
    if (instant) {
      camera.position.copy(target);
      controls?.target.copy(ORIGIN);
      controls?.update();
      glide.current = null;
    } else {
      glide.current = { target, elapsed: 0 };
    }
  }, [preset, resetKey, instant, camera, controls]);

  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;
    const cams = (window.__spectreCams ||= []);
    cams.push(camera);
    return () => cams.splice(cams.indexOf(camera), 1);
  }, [camera]);

  useEffect(() => {
    if (!controls) return undefined;
    const cancel = () => {
      glide.current = null;
    };
    controls.addEventListener('start', cancel);
    return () => controls.removeEventListener('start', cancel);
  }, [controls]);

  useFrame((_, delta) => {
    const g = glide.current;
    if (!g) return;
    g.elapsed += delta;
    const k = 1 - Math.exp(-delta * 5);
    camera.position.lerp(g.target, k);
    controls?.target.lerp(ORIGIN, k);
    if (camera.position.distanceTo(g.target) < 0.02 || g.elapsed > MAX_GLIDE_SECONDS) {
      camera.position.copy(g.target);
      controls?.target.copy(ORIGIN);
      glide.current = null;
    }
    controls?.update();
  });

  return null;
}
