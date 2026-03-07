import { instruments } from '../../instruments';

const descriptions: Record<string, string> = {
  piano: 'Classic piano with 2 octaves (C3-E5). Smooth sine wave tones.',
  guitar: 'Acoustic guitar from E2-E5. Sawtooth wave timbre.',
  synthesizer: 'Dual-wave synth — square (lower) and triangle (upper) oscillators.',
  dholak: 'Traditional Indian two-headed drum. 12 distinct strokes.',
  tabla: 'Indian percussion pair. Right drum (dayan) and left drum (bayan) sounds.',
};

const iconMap: Record<string, string> = {
  piano: 'P',
  guitar: 'G',
  synth: 'S',
  dholak: 'D',
  tabla: 'T',
};

interface InstrumentListProps {
  onSelect: (instrumentId: string) => void;
}

export default function InstrumentList({ onSelect }: InstrumentListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {instruments.map((inst) => {
        const mappingCount = Object.keys(inst.keyMappings).length;
        const sampleKeys = Object.entries(inst.keyMappings).slice(0, 6);

        return (
          <button
            key={inst.id}
            onClick={() => onSelect(inst.id)}
            className="group rounded-xl border border-gray-200 bg-white p-5 text-left transition-all hover:border-indigo-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-indigo-600"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-lg font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                {iconMap[inst.icon] ?? inst.name[0]}
              </span>
              <div>
                <div className="font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {inst.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {inst.type === 'tonal' ? 'Tonal' : 'Percussion'} &middot; {mappingCount} keys
                </div>
              </div>
            </div>

            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              {descriptions[inst.id] ?? ''}
            </p>

            <div className="mt-3 flex flex-wrap gap-1">
              {sampleKeys.map(([key, mapping]) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] dark:bg-gray-800"
                >
                  <kbd className="font-mono font-bold uppercase">{key}</kbd>
                  <span className="text-gray-500">{mapping.label}</span>
                </span>
              ))}
              {mappingCount > 6 && (
                <span className="text-[10px] text-gray-400">+{mappingCount - 6} more</span>
              )}
            </div>

            <div className="mt-3 text-xs font-medium text-indigo-600 group-hover:underline dark:text-indigo-400">
              Practice this instrument →
            </div>
          </button>
        );
      })}
    </div>
  );
}
