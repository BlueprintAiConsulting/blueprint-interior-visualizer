import { useState } from 'react';

export function useAIProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isQuickGenerating, setIsQuickGenerating] = useState(false);
  const [isDetectingSections, setIsDetectingSections] = useState(false);
  const [detectionProgress, setDetectionProgress] = useState('');
  const [error, setError] = useState<string | null>(null);

  const friendlyError = (msg: string): string => {
    const lower = (msg || '').toLowerCase();
    if (lower.includes('preflight_failure')) return "This image doesn't appear to be an interior room.";
    if (lower.includes('quota')) return 'Servers under heavy load. Try again in a few minutes.';
    if (lower.includes('safety')) return "This image couldn't be processed. Try a different photo.";
    if (lower.includes('failed to fetch') || lower.includes('network')) return 'Trouble connecting. Check your internet.';
    if (lower.includes('timeout')) return 'Taking longer than expected. Try again.';
    return msg;
  };

  return { isProcessing, setIsProcessing, isQuickGenerating, setIsQuickGenerating, isDetectingSections, setIsDetectingSections, detectionProgress, setDetectionProgress, error, setError, friendlyError };
}