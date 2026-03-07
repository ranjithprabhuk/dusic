import { useRef, useCallback, useEffect } from 'react';
import { useCompositionStore } from '../../store/useCompositionStore';
import type { Track } from '../../types/composition';

interface TrackLaneProps {
  track: Track;
  pixelsPerBeat: number;
  totalBeats: number;
  onSelectSegment?: (trackId: string, segmentId: string) => void;
  selectedSegmentId?: string;
}

export default function TrackLane({
  track,
  pixelsPerBeat,
  totalBeats,
  onSelectSegment,
  selectedSegmentId,
}: TrackLaneProps) {
  const { updateTrack, updateSegment } = useCompositionStore();

  const dragRef = useRef<{
    segmentId: string;
    startX: number;
    originalBeat: number;
  } | null>(null);

  const handleSegmentMouseDown = useCallback(
    (segmentId: string, startBeat: number, e: React.MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      dragRef.current = {
        segmentId,
        startX: e.clientX,
        originalBeat: startBeat,
      };
      onSelectSegment?.(track.id, segmentId);
    },
    [track.id, onSelectSegment]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const deltaBeat = dx / pixelsPerBeat;
      const newBeat = Math.max(0, Math.round((dragRef.current.originalBeat + deltaBeat) * 4) / 4);
      updateSegment(track.id, dragRef.current.segmentId, { startBeat: newBeat });
    };

    const handleMouseUp = () => {
      dragRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [track.id, pixelsPerBeat, updateSegment]);

  return (
    <div className="flex border-b border-gray-200 dark:border-gray-800">
      {/* Track Controls */}
      <div className="flex w-48 shrink-0 flex-col gap-1 border-r border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-900/50">
        <span className="text-sm font-medium truncate">{track.name}</span>
        <div className="flex items-center gap-1">
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(track.volume * 100)}
            onChange={(e) => updateTrack(track.id, { volume: Number(e.target.value) / 100 })}
            className="h-1 w-20 accent-indigo-600"
            title={`Volume: ${Math.round(track.volume * 100)}%`}
          />
          <button
            onClick={() => updateTrack(track.id, { isMuted: !track.isMuted })}
            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
              track.isMuted
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            M
          </button>
          <button
            onClick={() => updateTrack(track.id, { isSolo: !track.isSolo })}
            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
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
            onMouseDown={(e) => handleSegmentMouseDown(seg.id, seg.startBeat, e)}
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
            <div className="truncate px-1.5 py-0.5 text-[10px] font-medium text-gray-700 dark:text-gray-300">
              {seg.type === 'notes' ? `${seg.notes?.length ?? 0} notes` : 'Audio'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
