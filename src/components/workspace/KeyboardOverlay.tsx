import { useInstrumentStore } from '../../store/useInstrumentStore';
import { getInstrument } from '../../instruments';

const ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
];

export default function KeyboardOverlay() {
  const { selectedInstrumentId, pressedKeys } = useInstrumentStore();
  const instrument = getInstrument(selectedInstrumentId);
  if (!instrument) return null;

  return (
    <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/50">
      <div className="flex flex-col items-center gap-1.5">
        {ROWS.map((row, ri) => (
          <div key={ri} className="flex gap-1" style={{ marginLeft: ri * 16 }}>
            {row.map((key) => {
              const mapping = instrument.keyMappings[key];
              const isPressed = pressedKeys.has(key);
              return (
                <div
                  key={key}
                  className={`flex h-12 w-12 flex-col items-center justify-center rounded-lg border text-xs transition-all ${
                    isPressed
                      ? 'border-indigo-400 bg-indigo-100 text-indigo-700 scale-95 dark:border-indigo-500 dark:bg-indigo-900/50 dark:text-indigo-300'
                      : mapping
                        ? 'border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300'
                        : 'border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-600'
                  }`}
                >
                  <span className="text-[10px] font-medium uppercase opacity-60">
                    {key === ';' ? ';' : key}
                  </span>
                  {mapping && (
                    <span className="mt-0.5 font-semibold leading-none">
                      {mapping.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
