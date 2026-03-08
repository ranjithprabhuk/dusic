import { instruments } from '../../instruments';

const descriptions: Record<string, string> = {
  piano: 'Classic piano with 2 octaves (C3-E5). Smooth sine wave tones.',
  guitar: 'Acoustic guitar from E2-E5. Sawtooth wave timbre.',
  synthesizer: 'Dual-wave synth — square (lower) and triangle (upper) oscillators.',
  dholak: 'Traditional Indian two-headed drum. 12 distinct strokes.',
  tabla: 'Indian percussion pair. Right drum (dayan) and left drum (bayan) sounds.',
};

// Twemoji (MIT licensed) instrument images in public/images/instruments/
const instrumentImages: Record<string, string> = {
  piano: '/dusic/images/instruments/piano.svg',
  guitar: '/dusic/images/instruments/guitar.svg',
  synthesizer: '/dusic/images/instruments/synthesizer.svg',
  dholak: '/dusic/images/instruments/dholak.svg',
  tabla: '/dusic/images/instruments/tabla.svg',
};

const gradients: Record<string, string> = {
  piano: 'from-indigo-500/20 to-purple-500/20 dark:from-indigo-500/10 dark:to-purple-500/10',
  guitar: 'from-amber-500/20 to-orange-500/20 dark:from-amber-500/10 dark:to-orange-500/10',
  synthesizer: 'from-violet-500/20 to-fuchsia-500/20 dark:from-violet-500/10 dark:to-fuchsia-500/10',
  dholak: 'from-orange-500/20 to-red-500/20 dark:from-orange-500/10 dark:to-red-500/10',
  tabla: 'from-teal-500/20 to-emerald-500/20 dark:from-teal-500/10 dark:to-emerald-500/10',
};

const accentColors: Record<string, string> = {
  piano: 'text-indigo-600 dark:text-indigo-400',
  guitar: 'text-amber-600 dark:text-amber-400',
  synthesizer: 'text-violet-600 dark:text-violet-400',
  dholak: 'text-orange-600 dark:text-orange-400',
  tabla: 'text-teal-600 dark:text-teal-400',
};

const borderHover: Record<string, string> = {
  piano: 'hover:border-indigo-400 dark:hover:border-indigo-600',
  guitar: 'hover:border-amber-400 dark:hover:border-amber-600',
  synthesizer: 'hover:border-violet-400 dark:hover:border-violet-600',
  dholak: 'hover:border-orange-400 dark:hover:border-orange-600',
  tabla: 'hover:border-teal-400 dark:hover:border-teal-600',
};

interface InstrumentListProps {
  onSelect: (instrumentId: string) => void;
}

export default function InstrumentList({ onSelect }: InstrumentListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {instruments.map((inst) => {
        const mappingCount = Object.keys(inst.keyMappings).length;
        const sampleKeys = Object.entries(inst.keyMappings).slice(0, 5);
        const imgSrc = instrumentImages[inst.id];
        const gradient = gradients[inst.id] ?? 'from-gray-500/20 to-gray-500/20';
        const accent = accentColors[inst.id] ?? 'text-indigo-600 dark:text-indigo-400';
        const hover = borderHover[inst.id] ?? 'hover:border-indigo-400';

        return (
          <button
            key={inst.id}
            onClick={() => onSelect(inst.id)}
            className={`group flex flex-col rounded-xl border border-gray-200 bg-white text-left transition-all hover:shadow-lg hover:-translate-y-0.5 dark:border-gray-700 dark:bg-gray-900 ${hover}`}
          >
            {/* Illustration area */}
            <div className={`flex items-center justify-center rounded-t-xl bg-gradient-to-br p-5 ${gradient}`}>
              {imgSrc ? (
                <img src={imgSrc} alt={inst.name} className="h-16 w-16 drop-shadow-md" />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/50 text-2xl font-bold dark:bg-gray-800/50">
                  {inst.name[0]}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-4">
              <div className="flex items-center justify-between">
                <h3 className={`text-base font-bold ${accent}`}>
                  {inst.name}
                </h3>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  {inst.type === 'tonal' ? 'Tonal' : 'Percussion'}
                </span>
              </div>

              <p className="mt-1.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                {descriptions[inst.id] ?? ''}
              </p>

              {/* Key mappings preview */}
              <div className="mt-3 flex flex-wrap gap-1">
                {sampleKeys.map(([key, mapping]) => (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] dark:bg-gray-800"
                  >
                    <kbd className="font-mono font-bold uppercase text-gray-700 dark:text-gray-300">{key}</kbd>
                    <span className="text-gray-400">{mapping.label}</span>
                  </span>
                ))}
                {mappingCount > 5 && (
                  <span className="self-center text-[10px] text-gray-400">+{mappingCount - 5} more</span>
                )}
              </div>

              {/* Footer */}
              <div className={`mt-auto pt-3 text-xs font-semibold ${accent} opacity-80 group-hover:opacity-100`}>
                {mappingCount} keys &middot; Start learning &rarr;
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
