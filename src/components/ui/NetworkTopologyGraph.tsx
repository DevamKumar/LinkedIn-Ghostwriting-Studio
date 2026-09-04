import React from 'react';

export const NetworkTopologyGraph: React.FC = () => {
  return (
    <div className="relative w-full max-w-[450px] aspect-square border border-grid/20 flex items-center justify-center bg-paper/50">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Orbit Path */}
        <div className="absolute w-[280px] h-[280px] rounded-full border border-dashed border-grid/30"></div>
        
        {/* Rotating container for orbit nodes */}
        <div className="absolute w-[280px] h-[280px] animate-[spin_20s_linear_infinite]">
          {/* Node 1 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-3 h-3 bg-coral border border-grid"></div>
            {/* Connection Line */}
            <div className="absolute top-1/2 left-1/2 w-[1px] h-[140px] bg-grid/20 origin-top"></div>
          </div>
          
          {/* Node 2 */}
          <div className="absolute bottom-1/4 right-0 translate-x-1/2 translate-y-1/2">
            <div className="w-3 h-3 bg-mint border border-grid"></div>
            {/* Connection Line to center (approx math for visual) */}
            <div className="absolute top-1/2 right-1/2 h-[1px] w-[140px] bg-grid/20 origin-right -rotate-[30deg]"></div>
          </div>

          {/* Node 3 */}
          <div className="absolute bottom-1/4 left-0 -translate-x-1/2 translate-y-1/2">
            <div className="w-3 h-3 bg-gold border border-grid"></div>
            {/* Connection Line to center */}
            <div className="absolute top-1/2 left-1/2 h-[1px] w-[140px] bg-grid/20 origin-left rotate-[30deg]"></div>
          </div>
        </div>

        {/* Center Node */}
        <div className="absolute w-4 h-4 bg-forest"></div>
      </div>
    </div>
  );
};
