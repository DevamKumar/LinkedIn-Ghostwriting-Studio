import React from 'react';
import { GeneratedArticle } from '../../types';

interface BentoGridProps {
  currentArticle: GeneratedArticle | null;
  history: GeneratedArticle[];
  onSelectArticle: (article: GeneratedArticle) => void;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ currentArticle, history, onSelectArticle }) => {
  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16">
      <div className="mb-8">
        <h2 className="font-display text-4xl tracking-tight text-forest uppercase">
          System Output
        </h2>
      </div>

      <div className="bg-grid/20 border border-grid/20 p-[1px] grid grid-cols-1 md:grid-cols-2 gap-[1px]">
        
        {/* Cell 1: Generated Content (Main Output) */}
        <div className="bg-paper p-8 min-h-[400px]">
          <div className="pl-3 border-l-2 border-mint mb-6">
            <h3 className="font-mono text-[12px] uppercase tracking-widest text-forest">
              Output_Buffer.txt
            </h3>
          </div>
          {currentArticle ? (
            <div className="bg-white border border-grid/20 p-6 h-[calc(100%-3rem)] overflow-y-auto">
              <div className="font-sans text-forest whitespace-pre-wrap leading-relaxed text-[15px]">
                {currentArticle.content}
              </div>
            </div>
          ) : (
            <div className="bg-grid/5 border border-grid/20 p-6 h-[calc(100%-3rem)] flex flex-col items-center justify-center text-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-forest/30 mb-4">
                <path d="M4 19h16M4 15h16M4 11h16M4 7h16" strokeWidth="2" strokeLinecap="square" />
              </svg>
              <p className="font-mono text-[10px] uppercase tracking-widest text-forest/50">
                Awaiting payload generation...
              </p>
            </div>
          )}
        </div>



        {/* Cell 3: History Archive */}
        <div className="bg-paper p-8 min-h-[400px]">
          <div className="pl-3 border-l-2 border-coral mb-6">
            <h3 className="font-mono text-[12px] uppercase tracking-widest text-forest">
              Archive.log
            </h3>
          </div>
          
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {history.length > 0 ? history.map((item) => (
              <div 
                key={item.id} 
                onClick={() => onSelectArticle(item)}
                className="bg-white border border-grid/20 p-4 hover:border-forest hover:bg-forest/5 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-mono text-[10px] text-forest/60">{new Date(item.createdAt).toLocaleDateString()}</div>
                  <div className="px-2 py-0.5 bg-grid/5 text-forest font-mono text-[10px] uppercase tracking-widest">{item.category}</div>
                </div>
                <h4 className="font-sans text-forest font-semibold line-clamp-1">{item.topic}</h4>
              </div>
            )) : (
              <div className="font-mono text-[10px] text-forest/50">No archive records found.</div>
            )}
          </div>
        </div>



      </div>
    </section>
  );
};
