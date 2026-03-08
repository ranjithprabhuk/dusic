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
    <div className="border-t border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100 px-2 py-2.5 sm:px-4 sm:py-3 dark:border-gray-800 dark:from-gray-900/80 dark:to-gray-900">
      <div className="flex flex-col items-center gap-1 overflow-x-auto sm:gap-1.5">
        {ROWS.map((row, ri) => (
          <div key={ri} className="flex gap-0.5 sm:gap-1" style={{ marginLeft: ri * 14 }}>
            {row.map((key) => {
              const mapping = instrument.keyMappings[key];
              const isPressed = pressedKeys.has(key);
              return (
                <div
                  key={key}
                  className={`relative flex h-10 w-10 flex-col items-center justify-center rounded-lg border text-[10px] transition-all sm:h-12 sm:w-12 sm:text-xs ${
                    isPressed
                      ? 'scale-95 border-indigo-400 bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 dark:border-indigo-400 dark:bg-indigo-600'
                      : mapping
                        ? 'border-gray-200 bg-white text-gray-700 shadow-sm hover:border-gray-300 hover:shadow-md dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-gray-500'
                        : 'border-gray-100 bg-gray-50 text-gray-300 dark:border-gray-700/50 dark:bg-gray-800/30 dark:text-gray-600'
                  }`}
                >
                  <span className={`text-[7px] font-bold uppercase sm:text-[9px] ${
                    isPressed ? 'opacity-70' : 'opacity-40'
                  }`}>
                    {key === ';' ? ';' : key}
                  </span>
                  {mapping && (
                    <span className="mt-0.5 truncate px-0.5 font-bold leading-none max-w-full">
                      {mapping.label}
                    </span>
                  )}
                  {/* Key press indicator dot */}
                  {isPressed && mapping && (
                    <span className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-white" />
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
