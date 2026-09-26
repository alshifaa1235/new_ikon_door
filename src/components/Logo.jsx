import React from 'react';

export default function Logo({ variant = 'dark', height = 40, className = '' }) {
  // variant: 'dark' (for light/ivory background) or 'light' (for dark/graphite background)
  const isLight = variant === 'light';

  return (
    <div
      className={`new-ikon-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none'
      }}
    >
      <img
        src={isLight ? '/logo-white.png' : '/logo.png'}
        alt="New Ikon Doors"
        style={{
          height: `${height}px`,
          width: 'auto',
          display: 'block',
          objectFit: 'contain'
        }}
      />
    </div>
  );
}
