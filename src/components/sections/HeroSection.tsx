import React from 'react';
import { NetworkTopologyGraph } from '../ui/NetworkTopologyGraph';

export const HeroSection: React.FC = () => {
  return (
    <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-grid/20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Typography */}
        <div>
          <div className="pl-4 border-l border-grid/20 mb-8">
            <p className="font-mono text-[14px] uppercase tracking-widest text-forest">
              System Initialization Sequence
            </p>
          </div>
          <h1 className="font-display text-8xl tracking-tight text-forest mb-6">
            GHOSTWRITE<br />STUDIO
          </h1>
          <p className="font-sans text-forest/70 text-lg max-w-md">
            A high-converting LinkedIn content and ghostwriting studio powered by declarative n8n automation pipelines.
          </p>
        </div>

        {/* Right Graphic */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative mix-blend-luminosity hover:mix-blend-normal transition-all duration-500 w-full max-w-[450px]">
            <NetworkTopologyGraph />
          </div>
        </div>
      </div>
    </section>
  );
};
