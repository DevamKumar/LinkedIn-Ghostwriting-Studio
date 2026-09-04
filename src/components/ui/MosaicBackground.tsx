import React from 'react';

export const MosaicBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-paper">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="mosaic" width="240" height="240" patternUnits="userSpaceOnUse">
            {/* Base grid */}
            <rect width="240" height="240" fill="var(--color-paper)" />
            {/* Varying sized panels using lines */}
            <path 
              d="
                M 0 120 L 240 120 
                M 120 0 L 120 240
                M 40 0 L 40 120
                M 200 120 L 200 240
                M 120 60 L 240 60
                M 0 180 L 120 180
                M 80 120 L 80 240
                M 160 0 L 160 120
                M 0 40 L 40 40
                M 200 200 L 240 200
              " 
              stroke="var(--color-grid)" 
              strokeWidth="0.5" 
              strokeOpacity="0.3" 
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mosaic)" />
      </svg>
    </div>
  );
};
