import React from 'react';

export const TechnicalNav: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-paper/90 backdrop-blur-sm border-b border-grid/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-forest flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
              <path d="M4 4h16v16H4z" />
              <path d="M4 12h16" />
              <path d="M12 4v16" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
};
