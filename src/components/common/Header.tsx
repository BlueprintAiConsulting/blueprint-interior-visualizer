import React from 'react';
import { Trash2, Sparkles } from 'lucide-react';
import { BRAND } from '../../constants/branding';

interface HeaderProps { hasImage: boolean; onStartOver: () => void; onQuoteClick: () => void; isQuoteAvailable: boolean; }

const Header: React.FC<HeaderProps> = ({ hasImage, onStartOver, onQuoteClick, isQuoteAvailable }) => {
  return (
    <header className="border-b border-[#3B82F6]/15 bg-[#060B18]/95 backdrop-blur-md sticky top-0 z-10 shadow-[0_1px_24px_rgba(59,130,246,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 bg-[#1E3A8A] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
            </svg>
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="font-bold text-[15px] leading-none tracking-tight text-white whitespace-nowrap">
              BLUEPRINT<span className="text-[#60A5FA]">ENVISION</span>
            </h1>
            {BRAND.presenter && (
              <span className="text-[8px] uppercase tracking-[0.18em] font-semibold whitespace-nowrap mt-0.5" style={{background: BRAND.accentGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                Presented by {BRAND.presenter}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {hasImage && (
            <button onClick={onStartOver} className="hover:text-red-400 text-red-500/70 transition-colors hidden sm:flex items-center gap-1.5 text-xs font-medium" title="Start Over">
              <Trash2 className="w-3.5 h-3.5" /><span>Reset</span>
            </button>
          )}
          <button onClick={onQuoteClick} disabled={!isQuoteAvailable}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-all active:scale-95 text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap ${
              isQuoteAvailable ? 'bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]' : 'bg-[#1E293B] text-[#475569] cursor-not-allowed'}`}>
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">Get Free Estimate & Download</span>
            <span className="sm:hidden">Quote</span>
          </button>
        </div>
      </div>
    </header>
  );
};
export default Header;
