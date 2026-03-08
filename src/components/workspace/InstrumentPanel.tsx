import { useInstrumentStore } from '../../store/useInstrumentStore';
import { instruments } from '../../instruments';

const instrumentImages: Record<string, string> = {
  piano: '/dusic/images/instruments/piano.svg',
  guitar: '/dusic/images/instruments/guitar.svg',
  synthesizer: '/dusic/images/instruments/synthesizer.svg',
  dholak: '/dusic/images/instruments/dholak.svg',
  tabla: '/dusic/images/instruments/tabla.svg',
  bass: '/dusic/images/instruments/bass.svg',
  flute: '/dusic/images/instruments/flute.svg',
  organ: '/dusic/images/instruments/organ.svg',
};

const accentRing: Record<string, string> = {
  piano: 'ring-indigo-400 dark:ring-indigo-500',
  guitar: 'ring-amber-400 dark:ring-amber-500',
  synthesizer: 'ring-violet-400 dark:ring-violet-500',
  dholak: 'ring-orange-400 dark:ring-orange-500',
  tabla: 'ring-teal-400 dark:ring-teal-500',
  bass: 'ring-blue-400 dark:ring-blue-500',
  flute: 'ring-sky-400 dark:ring-sky-500',
  organ: 'ring-purple-400 dark:ring-purple-500',
};

export default function InstrumentPanel() {
  const { selectedInstrumentId, selectInstrument } = useInstrumentStore();

  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-gray-200 bg-gray-50 px-2 py-1.5 sm:gap-1.5 sm:px-4 sm:py-2 dark:border-gray-800 dark:bg-gray-900/50">
      <span className="mr-1 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:mr-2 dark:text-gray-500">
        Instrument
      </span>
      {instruments.map((inst) => {
        const isSelected = selectedInstrumentId === inst.id;
        const imgSrc = instrumentImages[inst.id];
        const ring = accentRing[inst.id] ?? 'ring-indigo-400';

        return (
          <button
            key={inst.id}
            onClick={() => selectInstrument(inst.id)}
            className={`group flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-all sm:gap-2 sm:px-3 sm:py-1.5 sm:text-sm ${
              isSelected
                ? `bg-white shadow-sm ring-2 ${ring} dark:bg-gray-800`
                : 'text-gray-500 hover:bg-white hover:shadow-sm dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
            title={inst.name}
          >
            <span className={`flex h-6 w-6 items-center justify-center rounded-md transition-transform group-hover:scale-110 sm:h-7 sm:w-7 ${
              isSelected ? 'bg-gray-50 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-700/50'
            }`}>
              {imgSrc ? (
                <img src={imgSrc} alt={inst.name} className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <span className="text-[10px] font-bold sm:text-xs">{inst.name[0]}</span>
              )}
            </span>
            <span className={`hidden sm:inline ${isSelected ? 'text-gray-900 dark:text-white' : ''}`}>
              {inst.name}
            </span>
            <span className={`sm:hidden ${isSelected ? 'text-gray-900 dark:text-white' : ''}`}>
              {inst.name.length > 6 ? inst.name.slice(0, 5) : inst.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
