import { useState, useEffect, useRef, useCallback } from 'react';
import { getInstrument } from '../../instruments';
import { instrumentEngine } from '../../engine/InstrumentEngine';
import { audioEngine } from '../../engine/AudioEngine';

interface TutorialSequence {
  name: string;
  keys: string[];
}

const tutorials: Record<string, TutorialSequence[]> = {
  piano: [
    { name: 'C Major Scale (Up)', keys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k'] },
    { name: 'C Major Scale (Down)', keys: ['k', 'j', 'h', 'g', 'f', 'd', 's', 'a'] },
    { name: 'Simple Melody', keys: ['a', 'd', 'f', 'g', 'f', 'd', 'a', 'a'] },
  ],
  guitar: [
    { name: 'Open Strings', keys: ['a', 's', 'd', 'f', 'g', 'h'] },
    { name: 'Basic Riff', keys: ['a', 'a', 'd', 'd', 'f', 'f', 'h', 'h'] },
  ],
  synthesizer: [
    { name: 'Square Wave Scale', keys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k'] },
    { name: 'Triangle Arpeggio', keys: ['q', 'e', 't', 'u', 't', 'e', 'q'] },
  ],
  dholak: [
    { name: 'Basic Taal', keys: ['a', 'd', 'a', 's', 'a', 'd', 'f', 'a'] },
    { name: 'Dha-Dhin Pattern', keys: ['a', 's', 'a', 's', 'd', 'f', 'd', 'f'] },
  ],
  tabla: [
    { name: 'Teen Taal', keys: ['g', 'h', 'a', 's', 'a', 's', 'd', 'f', 'a', 's', 'd', 'f', 'g', 'h', 'a', 's'] },
    { name: 'Na-Tin Pattern', keys: ['a', 's', 'a', 's', 'a', 'a', 's', 's'] },
  ],
};

interface GuidedTutorialProps {
  instrumentId: string;
}

export default function GuidedTutorial({ instrumentId }: GuidedTutorialProps) {
  const instrument = getInstrument(instrumentId);
  const sequences = tutorials[instrumentId] ?? [];
  const [seqIndex, setSeqIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const currentSeq = sequences[seqIndex];
  const expectedKey = currentSeq?.keys[stepIndex];

  const handleKeyDown = useCallback(async (e: KeyboardEvent) => {
    if (!currentSeq || !instrument) return;
    const key = e.key.toLowerCase();
    const mapping = instrument.keyMappings[key];
    if (!mapping) return;

    await audioEngine.ensureResumed();
    await instrumentEngine.init();
    instrumentEngine.playNote(instrumentId, key);

    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);

    if (key === expectedKey) {
      setFeedback('correct');
      setCompletedCount((c) => c + 1);
      if (stepIndex + 1 >= currentSeq.keys.length) {
        // Sequence complete
        feedbackTimer.current = setTimeout(() => {
          setFeedback(null);
          setStepIndex(0);
          if (seqIndex + 1 < sequences.length) {
            setSeqIndex(seqIndex + 1);
          }
        }, 800);
      } else {
        setStepIndex(stepIndex + 1);
        feedbackTimer.current = setTimeout(() => setFeedback(null), 300);
      }
    } else {
      setFeedback('wrong');
      feedbackTimer.current = setTimeout(() => setFeedback(null), 400);
    }
  }, [currentSeq, expectedKey, stepIndex, seqIndex, sequences.length, instrumentId, instrument]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    instrumentEngine.stopNote(instrumentId, e.key.toLowerCase());
  }, [instrumentId]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
      instrumentEngine.stopAll();
    };
  }, []);

  if (!instrument || sequences.length === 0) {
    return <p className="text-sm text-gray-500">No tutorials available for this instrument.</p>;
  }

  const progress = currentSeq ? (stepIndex / currentSeq.keys.length) * 100 : 0;
  const expectedMapping = expectedKey ? instrument.keyMappings[expectedKey] : undefined;

  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="font-semibold">Guided Tutorial</h4>
        <div className="flex items-center gap-2">
          {sequences.map((seq, i) => (
            <button
              key={i}
              onClick={() => { setSeqIndex(i); setStepIndex(0); setFeedback(null); }}
              className={`rounded px-2 py-0.5 text-xs font-medium ${
                i === seqIndex
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                  : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              {seq.name}
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Next key indicator */}
      <div className="mb-4 text-center">
        <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Next key:</p>
        <div className={`inline-flex flex-col items-center rounded-xl border-2 px-6 py-3 transition-all ${
          feedback === 'correct'
            ? 'border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-900/20'
            : feedback === 'wrong'
              ? 'border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-900/20'
              : 'border-indigo-300 bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-900/20'
        }`}>
          <kbd className="text-2xl font-bold uppercase">{expectedKey === ';' ? ';' : expectedKey}</kbd>
          {expectedMapping && (
            <span className="mt-1 text-sm text-gray-600 dark:text-gray-400">{expectedMapping.label}</span>
          )}
        </div>
        {feedback === 'correct' && (
          <p className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">Correct!</p>
        )}
        {feedback === 'wrong' && (
          <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
            Try pressing <kbd className="font-bold uppercase">{expectedKey}</kbd>
          </p>
        )}
      </div>

      {/* Sequence preview */}
      <div className="flex flex-wrap justify-center gap-1">
        {currentSeq?.keys.map((key, i) => {
          const m = instrument.keyMappings[key];
          return (
            <span
              key={i}
              className={`rounded px-2 py-1 text-xs font-medium ${
                i < stepIndex
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : i === stepIndex
                    ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-300'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
              }`}
            >
              {m?.label ?? key}
            </span>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs text-gray-400">
        {completedCount} notes played correctly
      </p>
    </div>
  );
}
