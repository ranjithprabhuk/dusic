import { useEffect, useRef, useState, useCallback } from 'react';
import { getInstrument } from '../../instruments';
import { instrumentEngine } from '../../engine/InstrumentEngine';
import { audioEngine } from '../../engine/AudioEngine';

const ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
];

interface PracticeModeProps {
  instrumentId: string;
  onBack: () => void;
}

export default function PracticeMode({ instrumentId, onBack }: PracticeModeProps) {
  const instrument = getInstrument(instrumentId);
  const [pressedKeys, setPressedKeys] = useState(new Set<string>());
  const [lastNote, setLastNote] = useState('');
  const heldKeys = useRef(new Set<string>());

  const handleKeyDown = useCallback(async (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (heldKeys.current.has(key)) return;
    if (!instrument?.keyMappings[key]) return;

    await audioEngine.ensureResumed();
    await instrumentEngine.init();
    heldKeys.current.add(key);
    setPressedKeys(new Set(heldKeys.current));
    const mapping = instrumentEngine.playNote(instrumentId, key);
    if (mapping) setLastNote(mapping.label);
  }, [instrumentId, instrument]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (!heldKeys.current.has(key)) return;
    heldKeys.current.delete(key);
    setPressedKeys(new Set(heldKeys.current));
    instrumentEngine.stopNote(instrumentId, key);
  }, [instrumentId]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      instrumentEngine.stopAll();
    };
  }, [handleKeyDown, handleKeyUp]);

  if (!instrument) return null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">{instrument.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Press keys on your keyboard to play. {instrument.type === 'tonal' ? 'Hold for sustained notes.' : 'Tap for each stroke.'}
          </p>
        </div>
        <button onClick={onBack} className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
          ← Back
        </button>
      </div>

      {lastNote && (
        <div className="mb-4 text-center">
          <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{lastNote}</span>
        </div>
      )}

      <div className="flex flex-col items-center gap-1.5">
        {ROWS.map((row, ri) => (
          <div key={ri} className="flex gap-1.5" style={{ marginLeft: ri * 20 }}>
            {row.map((key) => {
              const mapping = instrument.keyMappings[key];
              const isPressed = pressedKeys.has(key);
              return (
                <div
                  key={key}
                  className={`flex h-14 w-14 flex-col items-center justify-center rounded-lg border-2 text-sm transition-all ${
                    isPressed
                      ? 'scale-95 border-indigo-500 bg-indigo-100 text-indigo-700 shadow-lg shadow-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:shadow-indigo-900/50'
                      : mapping
                        ? 'border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300'
                        : 'border-gray-200 bg-gray-50 text-gray-300 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-700'
                  }`}
                >
                  <span className="text-[10px] font-medium uppercase opacity-50">
                    {key === ';' ? ';' : key}
                  </span>
                  {mapping && (
                    <span className="mt-0.5 font-bold leading-none">{mapping.label}</span>
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
