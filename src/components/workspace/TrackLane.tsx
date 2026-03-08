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
    <div className={`flex border-b border-gray-200 dark:border-gray-800 ${dropHighlight ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
      {/* Track Controls */}
      <div
        className={`sticky left-0 z-10 flex w-28 shrink-0 cursor-pointer flex-col justify-center gap-1.5 border-r px-2 py-2 transition-colors sm:w-48 sm:px-3 ${
          isSelected
            ? 'border-indigo-300 bg-gradient-to-r from-indigo-50 to-indigo-50/50 dark:border-indigo-700 dark:from-indigo-950/80 dark:to-indigo-950/40'
            : 'border-gray-200 bg-gradient-to-r from-gray-50 to-gray-50/50 hover:from-gray-100 dark:border-gray-800 dark:from-gray-900 dark:to-gray-900/50 dark:hover:from-gray-800/80'
        }`}
        onClick={() => onSelectTrack?.(track.id)}
      >
        <div className="flex items-center gap-1.5">
          {isSelected && (
            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
          )}
          <span className={`text-xs font-semibold truncate sm:text-sm ${
            isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'
          }`}>{track.name}</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Volume slider */}
          <div className="relative flex items-center gap-1 flex-1">
            <svg className="h-3 w-3 shrink-0 text-gray-400 dark:text-gray-500" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2L4 6H1v4h3l4 4V2z" />
              {!track.isMuted && <path d="M11 4.5a4 4 0 010 7M13 2.5a7 7 0 010 11" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />}
            </svg>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(track.volume * 100)}
              onChange={(e) => updateTrack(track.id, { volume: Number(e.target.value) / 100 })}
              className="h-1 w-full accent-indigo-500"
              title={`Volume: ${Math.round(track.volume * 100)}%`}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {/* Mute button */}
          <button
            onClick={(e) => { e.stopPropagation(); updateTrack(track.id, { isMuted: !track.isMuted }); }}
            title={track.isMuted ? 'Unmute track' : 'Mute track'}
            className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition-colors ${
              track.isMuted
                ? 'bg-amber-100 text-amber-700 shadow-sm dark:bg-amber-900/40 dark:text-amber-400'
                : 'text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700'
            }`}
          >
            M
          </button>
          {/* Solo button */}
          <button
            onClick={(e) => { e.stopPropagation(); updateTrack(track.id, { isSolo: !track.isSolo }); }}
            title={track.isSolo ? 'Unsolo track' : 'Solo track (mute all others)'}
            className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition-colors ${
              track.isSolo
                ? 'bg-emerald-100 text-emerald-700 shadow-sm dark:bg-emerald-900/40 dark:text-emerald-400'
                : 'text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700'
            }`}
          >
            S
          </button>
        </div>
      </div>

      {/* Track Content Area */}
      <div
        className="relative h-16 flex-1 bg-gray-50/30 dark:bg-gray-800/20"
        style={{ minWidth: totalBeats * pixelsPerBeat }}
      >
        {/* Subtle beat grid lines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, currentColor 0px, currentColor 1px, transparent 1px, transparent ${pixelsPerBeat * 4}px)`,
            backgroundSize: `${pixelsPerBeat * 4}px 100%`,
          }}
        />

        {track.segments.map((seg) => (
          <div
            key={seg.id}
            onMouseDown={(e) => {
              if (e.button !== 0) return;
              e.preventDefault();
              onSelectSegment?.(track.id, seg.id);
              onSegmentDragStart?.(track.id, seg.id, seg.startBeat, e);
            }}
            className={`absolute top-1 bottom-1 cursor-grab rounded-md border transition-all active:cursor-grabbing ${
              selectedSegmentId === seg.id
                ? 'border-indigo-400 bg-indigo-200/80 shadow-md shadow-indigo-200/50 ring-1 ring-indigo-300 dark:border-indigo-500 dark:bg-indigo-800/60 dark:shadow-indigo-900/30 dark:ring-indigo-600'
                : seg.type === 'audio'
                  ? 'border-emerald-300/80 bg-emerald-100/60 hover:bg-emerald-200/60 hover:shadow-sm dark:border-emerald-600/50 dark:bg-emerald-900/30 dark:hover:bg-emerald-800/40'
                  : 'border-indigo-300/60 bg-indigo-100/60 hover:bg-indigo-200/60 hover:shadow-sm dark:border-indigo-600/40 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/40'
            }`}
            style={{
              left: seg.startBeat * pixelsPerBeat,
              width: Math.max(seg.durationBeats * pixelsPerBeat, 4),
            }}
          >
            {seg.type === 'audio' && seg.waveformData ? (
              <MiniWaveform waveformData={seg.waveformData} isAudio />
            ) : (
              <div className="flex h-full items-center truncate px-1.5 text-[10px] font-medium text-gray-600 dark:text-gray-400">
                <svg className="mr-0.5 h-2.5 w-2.5 shrink-0 opacity-60" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M3 1v8.5a1.5 1.5 0 103 0V3h3V1H3z" />
                </svg>
                {seg.notes?.length ?? 0}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniWaveform({ waveformData, isAudio }: { waveformData: number[]; isAudio?: boolean }) {
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
    ctx.fillStyle = isAudio ? 'rgba(16, 185, 129, 0.6)' : 'rgba(99, 102, 241, 0.6)';

    const barWidth = w / waveformData.length;
    const mid = h / 2;

    for (let i = 0; i < waveformData.length; i++) {
      const amplitude = waveformData[i] * mid;
      ctx.fillRect(i * barWidth, mid - amplitude, Math.max(barWidth - 0.5, 0.5), amplitude * 2);
    }
  }, [waveformData, isAudio]);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      style={{ display: 'block' }}
    />
  );
}
