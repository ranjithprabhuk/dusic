import { useRef, useEffect } from 'react';
import { useCompositionStore } from '../../store/useCompositionStore';
import type { Track } from '../../types/composition';

interface TrackLaneProps {
  track: Track;
  pixelsPerBeat: number;
  totalBeats: number;
  onSelectSegment?: (trackId: string, segmentId: string) => void;
  onSelectTrack?: (trackId: string) => void;
  onSegmentDragStart?: (trackId: string, segmentId: string, startBeat: number, e: React.MouseEvent) => void;
  selectedSegmentId?: string;
  isSelected?: boolean;
  dropHighlight?: boolean;
}

export default function TrackLane({
  track,
  pixelsPerBeat,
  totalBeats,
  onSelectSegment,
  onSelectTrack,
  onSegmentDragStart,
  selectedSegmentId,
  isSelected,
  dropHighlight,
}: TrackLaneProps) {
  const { updateTrack } = useCompositionStore();

  return (
    <div className={`flex border-b border-gray-200 dark:border-gray-800 ${dropHighlight ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
      {/* Track Controls */}
      <div
        className={`sticky left-0 z-10 flex w-28 shrink-0 cursor-pointer flex-col gap-1 border-r px-2 py-2 sm:w-48 sm:px-3 ${
          isSelected
            ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-950'
            : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900'
        }`}
        onClick={() => onSelectTrack?.(track.id)}
      >
        <span className="text-xs font-medium truncate sm:text-sm">{track.name}</span>
        <div className="flex items-center gap-0.5 sm:gap-1">
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(track.volume * 100)}
            onChange={(e) => updateTrack(track.id, { volume: Number(e.target.value) / 100 })}
            className="h-1 w-12 accent-indigo-600 sm:w-20"
            title={`Volume: ${Math.round(track.volume * 100)}%`}
          />
          <button
            onClick={() => updateTrack(track.id, { isMuted: !track.isMuted })}
            title={track.isMuted ? 'Unmute track' : 'Mute track'}
            className={`rounded px-1.5 py-1 text-[10px] font-bold sm:py-0.5 ${
              track.isMuted
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            M
          </button>
          <button
            onClick={() => updateTrack(track.id, { isSolo: !track.isSolo })}
            title={track.isSolo ? 'Unsolo track' : 'Solo track (mute all others)'}
            className={`rounded px-1.5 py-1 text-[10px] font-bold sm:py-0.5 ${
              track.isSolo
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            S
          </button>
        </div>
      </div>

      {/* Track Content Area */}
      <div
        className="relative h-16 flex-1 bg-gray-100/50 dark:bg-gray-800/30"
        style={{ minWidth: totalBeats * pixelsPerBeat }}
      >
        {track.segments.map((seg) => (
          <div
            key={seg.id}
            onMouseDown={(e) => {
              if (e.button !== 0) return;
              e.preventDefault();
              onSelectSegment?.(track.id, seg.id);
              onSegmentDragStart?.(track.id, seg.id, seg.startBeat, e);
            }}
            className={`absolute top-1 bottom-1 cursor-grab rounded border transition-colors active:cursor-grabbing ${
              selectedSegmentId === seg.id
                ? 'border-indigo-400 bg-indigo-200/80 dark:border-indigo-500 dark:bg-indigo-800/60'
                : 'border-gray-300 bg-indigo-100/60 hover:bg-indigo-200/60 dark:border-gray-600 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/40'
            }`}
            style={{
              left: seg.startBeat * pixelsPerBeat,
              width: Math.max(seg.durationBeats * pixelsPerBeat, 4),
            }}
          >
            {seg.type === 'audio' && seg.waveformData ? (
              <MiniWaveform waveformData={seg.waveformData} />
            ) : (
              <div className="truncate px-1.5 py-0.5 text-[10px] font-medium text-gray-700 dark:text-gray-300">
                {seg.type === 'notes' ? `${seg.notes?.length ?? 0} notes` : 'Audio'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniWaveform({ waveformData }: { waveformData: number[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(99, 102, 241, 0.6)';

    const barWidth = w / waveformData.length;
    const mid = h / 2;

    for (let i = 0; i < waveformData.length; i++) {
      const amplitude = waveformData[i] * mid;
      ctx.fillRect(i * barWidth, mid - amplitude, Math.max(barWidth - 0.5, 0.5), amplitude * 2);
    }
  }, [waveformData]);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      style={{ display: 'block' }}
    />
  );
}
