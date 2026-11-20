import { useCallback, useEffect, useState } from 'react';
import { detectLowPower, detectWebGL } from '../lib/webgl';

const MOBILE_QUERY = '(max-width: 767px)';
const MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const matches = (q) => window.matchMedia?.(q).matches ?? false;

export function usePerformanceMode() {
  const [reducedMotion, setReducedMotion] = useState(() => matches(MOTION_QUERY));
  const [isMobile, setIsMobile] = useState(() => matches(MOBILE_QUERY));
  const [lowPower] = useState(detectLowPower);
  const [webglSupported] = useState(detectWebGL);
  const [ecoOverride, setEcoOverride] = useState(null);

  useEffect(() => {
    const motionMq = window.matchMedia(MOTION_QUERY);
    const onMotion = (e) => setReducedMotion(e.matches);
    const onResize = () => setIsMobile(matches(MOBILE_QUERY));
    motionMq.addEventListener('change', onMotion);
    window.addEventListener('resize', onResize);
    onResize();
    return () => {
      motionMq.removeEventListener('change', onMotion);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const autoEco = isMobile || lowPower;
  const eco = ecoOverride ?? autoEco;
  const toggleEco = useCallback(() => setEcoOverride((prev) => !(prev ?? autoEco)), [autoEco]);

  return { reducedMotion, eco, ecoIsAuto: ecoOverride === null, toggleEco, webglSupported };
}
