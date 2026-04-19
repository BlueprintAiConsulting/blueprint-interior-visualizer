import React from 'react';
import { Loader2 } from 'lucide-react';
import { RenderPhase } from '../../types';

interface VisualizerCanvasProps {
  selectedImage: string | null; resultImage: string | null; isProcessing: boolean;
  isQuickGenerating: boolean; sliderPos: number; setSliderPos: (pos: number) => void;
  elapsedSecs: number; renderPhase: RenderPhase; swatchPreviewHex: string | null; swatchPreviewName: string | null;
}

const PHASE_LABELS: Record<string, string> = {
  paint: 'Applying Paint Colors...', cabinets: 'Rendering Cabinets...',
  countertops: 'Rendering Countertops & Backsplash...', flooring: 'Rendering Flooring...',
};

const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({
  selectedImage, resultImage, isProcessing, isQuickGenerating, sliderPos, setSliderPos, elapsedSecs, renderPhase, swatchPreviewHex, swatchPreviewName,
}) => {
  const isGenerating = isProcessing || isQuickGenerating;
  const hasResult = !!resultImage;
  const handleSliderMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasResult) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setSliderPos(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * 100);
  };
  return (
    <div className="flex-1 relative overflow-hidden bg-[#0A0E17] rounded-b-xl">
      {!selectedImage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#1E293B] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-[#475569]">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
              </svg>
            </div>
            <p className="text-[11px] text-[#475569] font-medium">Upload a room photo to begin</p>
          </div>
        </div>
      )}
      {selectedImage && (
        <div className="absolute inset-0 cursor-col-resize select-none" onMouseMove={hasResult ? handleSliderMove : undefined}>
          <img src={selectedImage} alt="Original room" className="absolute inset-0 w-full h-full object-contain" draggable={false} />
          {hasResult && (
            <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
              <img src={resultImage} alt="Visualized result" className="absolute inset-0 w-full h-full object-contain" draggable={false} />
            </div>
          )}
          {hasResult && (
            <div className="absolute top-0 bottom-0 w-0.5 bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.5)] z-10" style={{ left: `${sliderPos}%` }}>
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white/90 shadow-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" className="w-4 h-4"><path d="M8 18l-6-6 6-6M16 6l6 6-6 6"/></svg>
              </div>
            </div>
          )}
          {hasResult && (
            <>
              <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 rounded text-[9px] font-bold text-white/80 uppercase tracking-wider backdrop-blur-sm">Before</div>
              <div className="absolute top-3 right-3 px-2 py-1 bg-[#3B82F6]/80 rounded text-[9px] font-bold text-white uppercase tracking-wider backdrop-blur-sm">After</div>
            </>
          )}
        </div>
      )}
      {swatchPreviewHex && (
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-[#0F172A]/90 backdrop-blur-sm border border-[#334155] rounded-lg px-3 py-2 z-20">
          <div className="w-6 h-6 rounded-md border border-white/20" style={{ backgroundColor: swatchPreviewHex }} />
          <span className="text-[10px] text-[#E2E8F0] font-medium">{swatchPreviewName}</span>
        </div>
      )}
      {isGenerating && (
        <div className="absolute inset-0 bg-[#0A0E17]/80 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="text-center space-y-4">
            <Loader2 className="w-10 h-10 text-[#3B82F6] animate-spin mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-[#E2E8F0]">{PHASE_LABELS[renderPhase] || 'Generating Visualization...'}</p>
              <p className="text-[10px] text-[#64748B]">{elapsedSecs}s elapsed — AI is rendering your remodel</p>
            </div>
            <div className="w-48 h-1 bg-[#1E293B] rounded-full overflow-hidden mx-auto">
              <div className="h-full bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default VisualizerCanvas;
