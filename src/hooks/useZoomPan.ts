import { useState, useCallback, useRef } from 'react';

export function useZoomPan() {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanMode, setIsPanMode] = useState(false);
  const [isDraggingPan, setIsDraggingPan] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const resetView = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, []);

  const startPan = useCallback((e: React.MouseEvent) => {
    setIsDraggingPan(true);
    panStartRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }, [pan]);

  const movePan = useCallback((e: React.MouseEvent) => {
    if (!isDraggingPan) return;
    setPan({ x: panStartRef.current.panX + e.clientX - panStartRef.current.x, y: panStartRef.current.panY + e.clientY - panStartRef.current.y });
  }, [isDraggingPan]);

  const endPan = useCallback(() => { setIsDraggingPan(false); }, []);

  return { zoom, setZoom, pan, setPan, isPanMode, setIsPanMode, isDraggingPan, startPan, movePan, endPan, resetView };
}