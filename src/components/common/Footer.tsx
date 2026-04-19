import React from 'react';
import { BRAND } from '../../constants/branding';
interface FooterProps { onShowToS: () => void; onShowPrivacy: () => void; }
const Footer: React.FC<FooterProps> = ({ onShowToS, onShowPrivacy }) => {
  return (
    <footer className="border-t border-[#1E293B] bg-[#060B18] mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#1E3A8A] rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-white">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
              </svg>
            </div>
            <span className="text-[10px] text-[#475569] font-medium">
              BLUEPRINT<span className="text-[#60A5FA]">ENVISION</span>
              {BRAND.presenter && <span className="text-[#334155]"> · Presented by {BRAND.presenter}</span>}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[9px] text-[#475569]">
            <span>© {new Date().getFullYear()} Blueprint AI Consulting</span>
            <button onClick={onShowToS} className="hover:text-[#94A3B8] transition-colors">Terms of Use</button>
            <button onClick={onShowPrivacy} className="hover:text-[#94A3B8] transition-colors">Privacy</button>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-[#1E293B]">
          <p className="text-[8px] text-[#334155] text-center leading-relaxed max-w-2xl mx-auto">
            AI-generated visualizations are approximations for design inspiration. Actual installed materials may vary in color, texture, and appearance. 
            Always confirm selections with physical samples before placing orders. Not a guarantee of final results.
          </p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
