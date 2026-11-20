import React from 'react';

// Blurred hooded silhouette used for 2D apparitions and the WebGL-off fallback.
export function ApparitionShape({ id, className = '', style }) {
  return (
    <svg viewBox="0 0 100 220" className={className} style={style} aria-hidden="true">
      <defs>
        <radialGradient id={`ap-fill-${id}`} cx="50%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#bff9f2" stopOpacity="0.9" />
          <stop offset="55%" stopColor="#3ff2e3" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#3ff2e3" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`ap-fade-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="65%" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`ap-mask-${id}`}>
          <rect width="100" height="220" fill={`url(#ap-fade-${id})`} />
        </mask>
        <filter id={`ap-blur-${id}`} x="-40%" y="-20%" width="180%" height="140%">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
      </defs>
      <path
        d="M50 8 C36 8 29 22 31 38 C33 46 30 52 27 60 C19 88 15 140 8 214 L92 214 C85 140 81 88 73 60 C70 52 67 46 69 38 C71 22 64 8 50 8 Z"
        fill={`url(#ap-fill-${id})`}
        filter={`url(#ap-blur-${id})`}
        mask={`url(#ap-mask-${id})`}
      />
    </svg>
  );
}
