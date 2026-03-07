import { useRef, useCallback } from 'react';
import { useCompositionStore } from '../../store/useCompositionStore';
import { useTransportStore } from '../../store/useTransportStore';
import TrackLane from './TrackLane';

const PIXELS_PER_BEAT = 30;
const TOTAL_BEATS = 128;

interface TimelineProps {
  selectedSegmentId?: string;
  onSelectSegment?: (trackId: string, segmentId: string) => void;
}

export default function Timeline({ selectedSegmentId, onSelectSegment }: TimelineProps) {
  const { tracks, bpm, addTrack } = useCompositionStore();
  const { playheadPosition, seek, loopEnabled, loopStart, loopEnd, setLoopEnabled, setLoopRegion } = useTransportStore();
  const rulerRef = useRef<HTMLDivElement>(null);
  const loopDragRef = useRef<{ startBeat: number } | null>(null);

  const handleRulerMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left + (e.currentTarget.scrollLeft || 0);
      const beat = Math.max(0, x / PIXELS_PER_BEAT);

      if (e.shiftKey) {
        // Shift+drag to set loop region
        loopDragRef.current = { startBeat: beat };
        setLoopRegion(beat, beat);
        setLoopEnabled(true);
      } else {
        seek(beat);
      }
    },
    [seek, setLoopRegion, setLoopEnabled]
  );

  const handleRulerMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!loopDragRef.current) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left + (e.currentTarget.scrollLeft || 0);
      const beat = Math.max(0, x / PIXELS_PER_BEAT);
      const start = Math.min(loopDragRef.current.startBeat, beat);
      const end = Math.max(loopDragRef.current.startBeat, beat);
      setLoopRegion(Math.round(start * 4) / 4, Math.round(end * 4) / 4);
    },
    [setLoopRegion]
  );

  const handleRulerMouseUp = useCallback(() => {
    if (!loopDragRef.current) return;
    loopDragRef.current = null;
    // If loop region is too small, disable it
    if (Math.abs(loopEnd - loopStart) < 0.5) {
      setLoopEnabled(false);
    }
  }, [loopStart, loopEnd, setLoopEnabled]);

  // Generate bar numbers for ruler
  const beatsPerBar = 4;
  const bars = Math.ceil(TOTAL_BEATS / beatsPerBar);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Ruler */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <div className="flex w-28 shrink-0 items-center gap-1 border-r border-gray-200 bg-gray-50 px-2 py-1 sm:w-48 sm:px-3 dark:border-gray-800 dark:bg-gray-900/50">
          <button
            onClick={() => addTrack()}
            className="rounded bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-500 sm:py-0.5"
          >
            + Track
          </button>
          <button
            onClick={() => setLoopEnabled(!loopEnabled)}
            title={loopEnabled ? 'Disable loop (Shift+drag ruler to set region)' : 'Enable loop (Shift+drag ruler to set region)'}
            className={`rounded px-1.5 py-1 text-[10px] font-bold sm:py-0.5 ${
              loopEnabled
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Loop
          </button>
        </div>
        <div
          ref={rulerRef}
          className="relative flex-1 cursor-pointer overflow-x-auto bg-gray-50 dark:bg-gray-900/30"
          onMouseDown={handleRulerMouseDown}
          onMouseMove={handleRulerMouseMove}
          onMouseUp={handleRulerMouseUp}
          onMouseLeave={handleRulerMouseUp}
          style={{ minWidth: TOTAL_BEATS * PIXELS_PER_BEAT }}
        >
          <div className="relative h-6" style={{ width: TOTAL_BEATS * PIXELS_PER_BEAT }}>
            {/* Loop region highlight */}
            {loopEnabled && loopEnd > loopStart && (
              <div
                className="absolute top-0 h-full bg-amber-300/30 dark:bg-amber-500/20"
                style={{
                  left: loopStart * PIXELS_PER_BEAT,
                  width: (loopEnd - loopStart) * PIXELS_PER_BEAT,
                }}
              >
                {/* Loop start marker */}
                <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-amber-500" />
                {/* Loop end marker */}
                <div className="absolute top-0 right-0 bottom-0 w-0.5 bg-amber-500" />
              </div>
            )}

            {Array.from({ length: bars }, (_, i) => (
              <div
                key={i}
                className="absolute top-0 h-full border-l border-gray-300 dark:border-gray-700"
                style={{ left: i * beatsPerBar * PIXELS_PER_BEAT }}
              >
                <span className="ml-1 text-[10px] text-gray-500 dark:text-gray-500">
                  {i + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tracks */}
      <div className="relative flex-1 overflow-auto">
        <div style={{ minWidth: TOTAL_BEATS * PIXELS_PER_BEAT + 192 }}>
          {tracks.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-gray-400 dark:text-gray-600">
              <p>No tracks yet. Click "+ Track" to get started.</p>
            </div>
          ) : (
            tracks.map((track) => (
              <TrackLane
                key={track.id}
                track={track}
                pixelsPerBeat={PIXELS_PER_BEAT}
                totalBeats={TOTAL_BEATS}
                selectedSegmentId={selectedSegmentId}
                onSelectSegment={onSelectSegment}
              />
            ))
          )}
        </div>

        {/* Loop region overlay on tracks */}
        {loopEnabled && loopEnd > loopStart && (
          <div
            className="pointer-events-none absolute top-0 bottom-0 bg-amber-200/10 dark:bg-amber-500/5"
            style={{
              left: 192 + loopStart * PIXELS_PER_BEAT,
              width: (loopEnd - loopStart) * PIXELS_PER_BEAT,
            }}
          />
        )}

        {/* Playhead */}
        <div
          className="pointer-events-none absolute top-0 bottom-0 w-px bg-red-500"
          style={{ left: 192 + playheadPosition * PIXELS_PER_BEAT }}
        />
      </div>

      {/* BPM display */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-1 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-400">
        {bpm} BPM &middot; {tracks.length} tracks &middot; {TOTAL_BEATS / 4} bars
        {loopEnabled && loopEnd > loopStart && (
          <span className="ml-2 text-amber-600 dark:text-amber-400">
            Loop: {loopStart.toFixed(1)} – {loopEnd.toFixed(1)}
          </span>
        )}
      </div>
    </div>
  );
}
