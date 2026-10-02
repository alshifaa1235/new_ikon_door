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
      <picture>
        <source srcSet={isLight ? '/logo-white.webp' : '/logo.webp'} type="image/webp" />
        <img
          src={isLight ? '/logo-white.png' : '/logo.png'}
          alt="New Ikon Doors"
          width={Math.round(height * 2.8)}
          height={height}
          decoding="async"
          style={{
            height: `${height}px`,
            width: 'auto',
            display: 'block',
            objectFit: 'contain'
          }}
        />
      </picture>
    </div>
  );
}
