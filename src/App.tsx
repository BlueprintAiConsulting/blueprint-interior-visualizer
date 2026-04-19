import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Sparkles, Info, ChevronDown, Paintbrush } from 'lucide-react';
import { RoomType, RoomZone, MaterialColor, RenderPhase } from './types';
import { getDefaultZonesForRoom } from './constants/defaultZones';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import RoomTypeSelector from './components/visualizer/RoomTypeSelector';
import SourceAsset from './components/visualizer/SourceAsset';
import InteriorCatalog from './components/catalog/InteriorCatalog';
import VisualizerCanvas from './components/visualizer/VisualizerCanvas';
import { useAIProcessing } from './hooks/useAIProcessing';
import { downscaleImage } from './utils/image';
import { API_BASE } from './utils/apiConfig';

const RENDER_PASSES: { key: string; label: string; categories: string[] }[] = [
  { key: 'paint', label: 'Paint & Walls', categories: ['walls', 'accent-wall', 'trim', 'ceiling'] },
  { key: 'cabinets', label: 'Cabinetry', categories: ['cabinets', 'vanity'] },
  { key: 'countertops', label: 'Countertops & Tile', categories: ['countertops', 'backsplash', 'shower-surround'] },
  { key: 'flooring', label: 'Flooring', categories: ['flooring'] },
];

const App: React.FC = () => {
  const [roomType, setRoomType] = useState<RoomType>('kitchen');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [zones, setZones] = useState<RoomZone[]>(getDefaultZonesForRoom('kitchen'));
  const [expandedZoneId, setExpandedZoneId] = useState<string | null>(null);
  const [showEnhancePrompt, setShowEnhancePrompt] = useState(false);
  const [imageOptimizeInfo, setImageOptimizeInfo] = useState<string | null>(null);
  const [sliderPos, setSliderPos] = useState(100);
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const [renderPhase, setRenderPhase] = useState<RenderPhase>('idle');
  const [completedPasses, setCompletedPasses] = useState<string[]>([]);
  const [collapsedPanels, setCollapsedPanels] = useState<Set<string>>(new Set());
  const [swatchPreviewHex, setSwatchPreviewHex] = useState<string | null>(null);
  const [swatchPreviewName, setSwatchPreviewName] = useState<string | null>(null);
  const ai = useAIProcessing();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (ai.isQuickGenerating) { setElapsedSecs(0); timerRef.current = setInterval(() => setElapsedSecs(s => s + 1), 1000); }
    else { if (timerRef.current) clearInterval(timerRef.current); }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [ai.isQuickGenerating]);

  const handleRoomChange = (newRoom: RoomType) => { setRoomType(newRoom); setZones(getDefaultZonesForRoom(newRoom)); setExpandedZoneId(null); setResultImage(null); setCompletedPasses([]); setRenderPhase('idle'); };
  const handleUpload = (file: File) => { const reader = new FileReader(); reader.onload = (e) => { setSelectedImage(e.target?.result as string); setResultImage(null); setEnhancedImage(null); setShowEnhancePrompt(true); setCompletedPasses([]); setRenderPhase('idle'); }; reader.readAsDataURL(file); };
  const handleStartOver = () => { if (confirm('Start over? All progress will be lost.')) { setSelectedImage(null); setResultImage(null); setEnhancedImage(null); setShowEnhancePrompt(false); setImageOptimizeInfo(null); setZones(getDefaultZonesForRoom(roomType)); setCompletedPasses([]); setRenderPhase('idle'); } };

  const handleSelectSample = async (url: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = (e) => { setSelectedImage(e.target?.result as string); setResultImage(null); setEnhancedImage(null); setShowEnhancePrompt(false); setCompletedPasses([]); setRenderPhase('idle'); };
      reader.readAsDataURL(blob);
    } catch { /* fallback: just use the URL directly */ setSelectedImage(url); setResultImage(null); setEnhancedImage(null); setShowEnhancePrompt(false); setCompletedPasses([]); setRenderPhase('idle'); }
  };

  const handleEnhance = async () => {
    if (!selectedImage) return;
    ai.setIsProcessing(true); ai.setError(null);
    try {
      const scaled = await downscaleImage(selectedImage, 1536);
      const res = await fetch(`${API_BASE}/api/enhance-image`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageBase64: scaled.split(',')[1] }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Optimization failed');
      if (data.enhancedImageBase64) setEnhancedImage(`data:${data.mimeType || 'image/png'};base64,${data.enhancedImageBase64}`);
    } catch (e: unknown) { ai.setError(e instanceof Error ? e.message : 'Optimization failed.'); }
    finally { ai.setIsProcessing(false); }
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;
    const enabledZones = zones.filter(z => z.enabled);
    if (enabledZones.length === 0) return;
    ai.setIsQuickGenerating(true); ai.setError(null); setCompletedPasses([]);
    try {
      let currentImage = selectedImage;
      const zonePayloads = enabledZones.map(z => ({ name: z.name, category: z.category, brand: z.selectedLine.brand, lineName: z.selectedLine.line, colorName: z.selectedColor.name, colorHex: z.selectedColor.hex, hue: z.selectedColor.hue, materialType: z.selectedLine.material }));
      for (const pass of RENDER_PASSES) {
        const passZones = zonePayloads.filter(z => pass.categories.includes(z.category));
        if (passZones.length === 0) { setCompletedPasses(prev => [...prev, pass.key]); continue; }
        setRenderPhase(pass.key as RenderPhase);
        const base64 = currentImage.includes(',') ? currentImage.split(',')[1] : currentImage;
        const mime = currentImage.includes(',') ? currentImage.split(';')[0].split(':')[1] || 'image/png' : 'image/png';
        const res = await fetch(`${API_BASE}/api/interior-render`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageBase64: base64, mimeType: mime, roomType, renderPass: pass.key, zones: passZones }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `${pass.label} render failed.`);
        currentImage = data.resultImage;
        setCompletedPasses(prev => [...prev, pass.key]);
      }
      setRenderPhase('done'); setResultImage(currentImage);
    } catch (err: any) { ai.setError(ai.friendlyError(err.message || 'Generation failed.')); }
    finally { ai.setIsQuickGenerating(false); setTimeout(() => setRenderPhase('idle'), 3000); }
  };

  const PANEL_CONFIG = [
    { key: 'paint', label: 'Paint & Walls', num: '01', categories: ['walls', 'accent-wall', 'trim', 'ceiling'] },
    { key: 'cabinets', label: 'Cabinetry', num: '02', categories: ['cabinets', 'vanity'] },
    { key: 'countertops', label: 'Countertops & Tile', num: '03', categories: ['countertops', 'backsplash', 'shower-surround'] },
    { key: 'flooring', label: 'Flooring', num: '04', categories: ['flooring'] },
  ];
  const togglePanel = (panel: string) => { setCollapsedPanels(prev => { const next = new Set(prev); if (next.has(panel)) next.delete(panel); else next.add(panel); return next; }); };

  return (
    <div className="min-h-screen bg-[#060B18] text-[#E2E8F0] font-sans antialiased overflow-x-hidden">
      <Header hasImage={!!selectedImage} onStartOver={handleStartOver} onQuoteClick={() => {}} isQuoteAvailable={!!resultImage} />
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-4 space-y-4 lg:space-y-5">
            <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] mb-3">Room Type</h2>
              <RoomTypeSelector selectedRoom={roomType} onSelectRoom={handleRoomChange} />
            </div>
            <SourceAsset selectedImage={selectedImage} onUpload={handleUpload} onSelectSampleUrl={handleSelectSample} showEnhancePrompt={showEnhancePrompt} setShowEnhancePrompt={setShowEnhancePrompt} isEnhancing={ai.isProcessing && !enhancedImage} enhancedImage={enhancedImage} enhanceError={ai.error} onEnhance={handleEnhance}
              onAcceptEnhanced={() => { if (enhancedImage) setSelectedImage(enhancedImage); setEnhancedImage(null); setShowEnhancePrompt(false); setImageOptimizeInfo('Room photo optimized for visualization'); }} imageOptimizeInfo={imageOptimizeInfo} />
            <div className="space-y-3">
              {PANEL_CONFIG.map(panel => {
                const panelZones = zones.filter(z => panel.categories.includes(z.category));
                if (panelZones.length === 0) return null;
                const isCompleted = completedPasses.includes(panel.key);
                const isActive = renderPhase === panel.key;
                return (
                  <div key={panel.key} className="rounded-xl border border-[#1E293B] overflow-hidden">
                    <button onClick={() => togglePanel(panel.key)} className="w-full flex items-center justify-between px-5 py-3.5 bg-[#111827] hover:bg-[#0F172A] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-[#1E3A8A] text-[#60A5FA] rounded-lg flex items-center justify-center text-[10px] font-bold">{panel.num}</div>
                        <h2 className="text-xs font-bold uppercase tracking-wider text-[#E2E8F0]">{panel.label}</h2>
                      </div>
                      <div className="flex items-center gap-2">
                        {isActive && <div className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />}
                        {isCompleted && <span className="text-[9px] text-[#10B981] font-bold">✓</span>}
                        <ChevronDown className={`w-4 h-4 text-[#64748B] transition-transform duration-200 ${collapsedPanels.has(panel.key) ? '' : 'rotate-180'}`} />
                      </div>
                    </button>
                    {!collapsedPanels.has(panel.key) && (
                      <div className="border-t border-[#1E293B] bg-[#111827] p-4">
                        <InteriorCatalog zones={panelZones} setZones={setZones} expandedZoneId={expandedZoneId} setExpandedZoneId={setExpandedZoneId}
                          onColorMouseEnter={c => { setSwatchPreviewHex(c.hex); setSwatchPreviewName(c.name); }} onColorMouseLeave={() => { setSwatchPreviewHex(null); setSwatchPreviewName(null); }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {renderPhase !== 'idle' && (
              <div className="bg-[#0A0E17] rounded-xl border border-[#1E293B] p-4 space-y-2">
                <div className="flex items-center gap-2 mb-3"><Paintbrush className="w-4 h-4 text-[#60A5FA]" /><span className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">Rendering Pipeline</span></div>
                {RENDER_PASSES.map(pass => {
                  const passZones = zones.filter(z => z.enabled && pass.categories.includes(z.category));
                  const isAct = renderPhase === pass.key; const isDone = completedPasses.includes(pass.key); const isSkipped = passZones.length === 0;
                  return (<div key={pass.key} className="flex items-center gap-2">
                    {isAct ? <Loader2 className="w-3 h-3 text-[#3B82F6] animate-spin" /> : isDone ? <span className="text-[#10B981] text-xs">✓</span> : <span className="text-[#334155] text-xs">○</span>}
                    <span className={`text-[10px] font-medium ${isAct ? 'text-[#60A5FA]' : isDone ? 'text-[#10B981]' : 'text-[#475569]'}`}>{isSkipped ? `${pass.label} (skipped)` : pass.label}</span>
                  </div>);
                })}
                {renderPhase === 'done' && <div className="pt-2 border-t border-[#1E293B] mt-2"><span className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest">✦ Complete — Full remodel render ready</span></div>}
              </div>
            )}
            {ai.error && <div className="bg-red-950/30 border border-red-800/50 rounded-lg p-3"><p className="text-[10px] text-red-400">{ai.error}</p></div>}
            <div className="flex items-start gap-2 px-3 py-2.5 bg-[#0A0E17] border border-[#1E293B] rounded-lg">
              <Info className="w-3 h-3 text-[#475569] shrink-0 mt-0.5" />
              <p className="text-[8.5px] text-[#475569] leading-relaxed">Colors shown are approximations. <span className="text-[#64748B]">Always confirm with physical samples before purchasing materials.</span></p>
            </div>
            <div className="flex gap-2 mt-4">
              {resultImage && <button onClick={() => { setResultImage(null); setCompletedPasses([]); }} className="w-[120px] py-4 rounded-lg font-bold text-[#94A3B8] bg-[#1E293B] hover:bg-[#334155] hover:text-white transition-all text-[10px] tracking-widest uppercase border border-[#334155] flex flex-col items-center justify-center gap-1">← Edit</button>}
              <button disabled={ai.isQuickGenerating || !selectedImage || !zones.some(z => z.enabled)} onClick={handleGenerate}
                className={`flex-1 py-4 rounded-lg font-bold text-white shadow-lg flex items-center justify-center gap-3 transition-all uppercase tracking-wider text-[11px] ${
                  ai.isQuickGenerating || !selectedImage || !zones.some(z => z.enabled)
                    ? 'bg-[#1E293B] text-[#64748B] cursor-not-allowed border border-[#334155]'
                    : resultImage ? 'bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-[0_0_20px_rgba(59,130,246,0.35)]'
                }`}>
                {ai.isQuickGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Rendering...</> : resultImage ? <><Sparkles className="w-4 h-4" /> Re-Generate</> : <><Paintbrush className="w-4 h-4" /> Visualize Remodel</>}
              </button>
            </div>
          </div>
          <div className="lg:col-span-8 lg:sticky lg:top-4 self-start">
            <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-1 flex flex-col shadow-2xl overflow-hidden" style={{ height: 'min(calc(100vh - 100px), 900px)', minHeight: '320px' }}>
              <div className="bg-[#0F172A] border-b border-[#1E293B] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" /><span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Engine Active</span></div>
                <span className="text-[9px] text-[#475569]">{roomType.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())} Remodel</span>
              </div>
              <VisualizerCanvas selectedImage={selectedImage} resultImage={resultImage} isProcessing={ai.isProcessing} isQuickGenerating={ai.isQuickGenerating} sliderPos={sliderPos} setSliderPos={setSliderPos} elapsedSecs={elapsedSecs} renderPhase={renderPhase} swatchPreviewHex={swatchPreviewHex} swatchPreviewName={swatchPreviewName} />
            </div>
          </div>
        </div>
      </main>
      <Footer onShowToS={() => {}} onShowPrivacy={() => {}} />
    </div>
  );
};
export default App;
