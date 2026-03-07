import { useWaveform } from '../../hooks/useWaveform';
import type { Segment as SegmentType } from '../../types/composition';

interface SegmentProps {
  segment: SegmentType;
  pixelsPerBeat: number;
  isSelected: boolean;
  onClick: () => void;
}

export default function Segment({ segment, pixelsPerBeat, isSelected, onClick }: SegmentProps) {
  const width = Math.max(segment.durationBeats * pixelsPerBeat, 8);
  const height = 48;

  const canvasRef = useWaveform(segment.waveformData, width, height);

  return (
    <div
      onClick={onClick}
      className={`absolute top-1 bottom-1 cursor-pointer rounded border transition-colors ${
        isSelected
          ? 'border-indigo-400 bg-indigo-200/80 dark:border-indigo-500 dark:bg-indigo-800/60'
          : 'border-gray-300 bg-indigo-100/60 hover:bg-indigo-200/60 dark:border-gray-600 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/40'
      }`}
      style={{
        left: segment.startBeat * pixelsPerBeat,
        width,
      }}
    >
      {segment.type === 'audio' && segment.waveformData ? (
        <canvas ref={canvasRef} className="h-full w-full" />
      ) : (
        <div className="flex h-full items-center px-1.5">
          <span className="truncate text-[10px] font-medium text-gray-700 dark:text-gray-300">
            {segment.type === 'notes' ? `${segment.notes?.length ?? 0} notes` : 'Audio'}
          </span>
        </div>
      )}
    </div>
  );
}
