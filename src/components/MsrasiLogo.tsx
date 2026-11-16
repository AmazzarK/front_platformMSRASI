import React from 'react';

interface MsrasiLogoProps {
  variant?: 'light' | 'dark';
  compact?: boolean;
  className?: string;
}

export const MsrasiLogo: React.FC<MsrasiLogoProps> = ({
  variant = 'light',
  compact = false,
  className = '',
}) => {
  const isDark = variant === 'dark';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        viewBox="0 0 60 60"
        className="w-9 h-9 shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="30" cy="30" r="28" fill="#10243B" />
        <ellipse
          cx="30"
          cy="30"
          rx="23"
          ry="9.5"
          stroke="#2466C5"
          strokeWidth="1.8"
          transform="rotate(-30 30 30)"
          opacity="0.9"
        />
        <ellipse
          cx="30"
          cy="30"
          rx="23"
          ry="9.5"
          stroke="#F58200"
          strokeWidth="1.8"
          transform="rotate(30 30 30)"
          opacity="0.9"
        />
        <ellipse
          cx="30"
          cy="30"
          rx="23"
          ry="9.5"
          stroke="#087A4B"
          strokeWidth="1.5"
          transform="rotate(90 30 30)"
          opacity="0.85"
        />
        <polygon
          points="30,19 33.5,26.5 41.5,27.5 35.5,33 37,41 30,37 23,41 24.5,33 18.5,27.5 26.5,26.5"
          fill="#FFFFFF"
          stroke="#1646A8"
          strokeWidth="1"
        />
        <circle cx="30" cy="30" r="3.5" fill="#D62828" />
        <circle cx="10" cy="20" r="2.5" fill="#F58200" />
        <circle cx="50" cy="40" r="2.5" fill="#2466C5" />
        <circle cx="30" cy="6" r="2" fill="#087A4B" />
      </svg>

      {!compact && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-2">
            <span
              className={`font-headline-sm text-[19px] font-extrabold tracking-wide ${
                isDark ? 'text-white' : 'text-[#10243B]'
              }`}
            >
              MSRASI
            </span>
          </div>
          <span
            className={`text-[9px] font-bold tracking-wider uppercase mt-0.5 ${
              isDark ? 'text-tertiary-fixed-dim' : 'text-primary-container'
            }`}
          >
            Recherche Appliquée &amp; Innovation
          </span>
        </div>
      )}
    </div>
  );
};
