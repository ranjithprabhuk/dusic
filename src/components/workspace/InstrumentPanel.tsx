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
    <div className="flex flex-wrap items-center gap-1 overflow-x-auto border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-800 dark:bg-gray-900/50">
      <span className="mr-2 text-xs font-medium text-gray-500 dark:text-gray-400">
        Instrument
      </span>
      {instruments.map((inst) => (
        <button
          key={inst.id}
          onClick={() => selectInstrument(inst.id)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            selectedInstrumentId === inst.id
              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
              : 'text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800'
          }`}
          title={inst.name}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded bg-gray-200 text-xs font-bold dark:bg-gray-700">
            {iconMap[inst.icon] ?? inst.name[0]}
          </span>
          {inst.name}
        </button>
      ))}
    </div>
  );
}
