// `?webgl=off` forces the static fallback (handy for demos and tests).
export function detectWebGL() {
  try {
    if (new URLSearchParams(window.location.search).get('webgl') === 'off') return false;
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function detectLowPower() {
  const nav = window.navigator;
  return Boolean(
    (nav.hardwareConcurrency && nav.hardwareConcurrency <= 2) ||
      (nav.deviceMemory && nav.deviceMemory <= 2) ||
      nav.connection?.saveData
  );
}
