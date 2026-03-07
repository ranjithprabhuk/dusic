import { useInstrumentStore } from '../../store/useInstrumentStore';
import { instruments } from '../../instruments';

const iconMap: Record<string, string> = {
  piano: 'P',
  guitar: 'G',
  synth: 'S',
  dholak: 'D',
  tabla: 'T',
};

export default function InstrumentPanel() {
  const { selectedInstrumentId, selectInstrument } = useInstrumentStore();

  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-gray-200 bg-gray-50 px-2 py-1.5 sm:px-4 sm:py-2 dark:border-gray-800 dark:bg-gray-900/50">
      <span className="mr-1 shrink-0 text-xs font-medium text-gray-500 sm:mr-2 dark:text-gray-400">
        Instrument
      </span>
      {instruments.map((inst) => (
        <button
          key={inst.id}
          onClick={() => selectInstrument(inst.id)}
          className={`flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors sm:gap-1.5 sm:px-3 sm:text-sm ${
            selectedInstrumentId === inst.id
              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
              : 'text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800'
          }`}
          title={inst.name}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-200 text-[10px] font-bold sm:h-6 sm:w-6 sm:text-xs dark:bg-gray-700">
            {iconMap[inst.icon] ?? inst.name[0]}
          </span>
          <span className="hidden sm:inline">{inst.name}</span>
          <span className="sm:hidden">{inst.name.slice(0, 5)}</span>
        </button>
      ))}
    </div>
  );
}
