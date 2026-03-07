import { useEffect, useRef } from 'react';

export function useWaveform(
  waveformData: number[] | undefined,
  width: number,
  height: number
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !waveformData || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    const step = Math.max(1, Math.floor(waveformData.length / width));
    const mid = height / 2;

    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let x = 0; x < width; x++) {
      const idx = Math.min(x * step, waveformData.length - 1);
      const val = waveformData[idx] ?? 0;
      const y = mid + val * mid;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.stroke();
  }, [waveformData, width, height]);

  return canvasRef;
}
