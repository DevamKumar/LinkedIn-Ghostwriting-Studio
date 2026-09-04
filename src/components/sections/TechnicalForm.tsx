import React from 'react';

interface TechnicalFormProps {
  topic: string;
  setTopic: (t: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  activeStep: number;
}

export const TechnicalForm: React.FC<TechnicalFormProps> = ({
  topic, setTopic, onGenerate, isGenerating, activeStep
}) => {
  return (
    <div className="w-full max-w-[640px] mx-auto relative bg-paper border border-grid/20 p-8 sm:p-12 mb-16">
      {/* Corner Markers */}
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-forest"></div>
      <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-forest"></div>
      <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-forest"></div>
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-forest"></div>

      <div className="mb-8 border-b border-grid/20 pb-4">
        <h2 className="font-display text-3xl tracking-tight text-forest uppercase">
          Payload Configuration
        </h2>
        <p className="font-mono text-[10px] uppercase tracking-widest text-forest/60 mt-2">
          Initialize n8n automation webhook pipeline
        </p>
      </div>

      <div className="space-y-6">
        {/* Topic Input */}
        <div className="flex flex-col">
          <label className="font-mono text-[12px] uppercase tracking-widest text-forest mb-2">
            Target Topic
          </label>
          <input 
            type="text" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="bg-white border border-grid/20 px-4 py-3 font-sans text-forest focus:outline-none focus:border-forest"
            placeholder="Enter core concept..."
          />
        </div>

        {/* Action Button */}
        <button 
          onClick={onGenerate}
          disabled={isGenerating || !topic.trim()}
          className="w-full mt-8 bg-forest text-white border border-forest py-4 font-mono text-[12px] uppercase tracking-widest hover:bg-forest/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isGenerating ? (
            <>
              <div className="w-3 h-3 bg-mint animate-pulse rounded-none"></div>
              <span>Processing Step 0{activeStep}...</span>
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              <span>Execute Generation Sequence</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
