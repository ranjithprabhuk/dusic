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
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoPlayIndex, setAutoPlayIndex] = useState(-1);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const autoPlayTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const currentSeq = sequences[seqIndex];
  const expectedKey = currentSeq?.keys[stepIndex];

  const stopAutoPlay = useCallback(() => {
    setIsAutoPlaying(false);
    setAutoPlayIndex(-1);
    if (autoPlayTimer.current) {
      clearTimeout(autoPlayTimer.current);
      autoPlayTimer.current = undefined;
    }
    instrumentEngine.stopAll();
  }, []);

  const startAutoPlay = useCallback(async () => {
    if (!currentSeq || !instrument) return;
    await audioEngine.ensureResumed();
    await instrumentEngine.init();

    stopAutoPlay();
    setIsAutoPlaying(true);

    const playStep = (i: number) => {
      if (i >= currentSeq.keys.length) {
        setIsAutoPlaying(false);
        setAutoPlayIndex(-1);
        return;
      }

      const key = currentSeq.keys[i];
      setAutoPlayIndex(i);
      instrumentEngine.playNote(instrumentId, key);

      // Stop the note after a short duration for tonal instruments
      const noteOffDelay = instrument.type === 'tonal' ? 280 : 150;
      autoPlayTimer.current = setTimeout(() => {
        instrumentEngine.stopNote(instrumentId, key);

        // Schedule next note
        autoPlayTimer.current = setTimeout(() => {
          playStep(i + 1);
        }, 120);
      }, noteOffDelay);
    };

    playStep(0);
  }, [currentSeq, instrument, instrumentId, stopAutoPlay]);

  const handleKeyDown = useCallback(async (e: KeyboardEvent) => {
    if (isAutoPlaying) return;
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
  }, [isAutoPlaying, currentSeq, expectedKey, stepIndex, seqIndex, sequences.length, instrumentId, instrument]);

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
      if (autoPlayTimer.current) clearTimeout(autoPlayTimer.current);
      instrumentEngine.stopAll();
    };
  }, []);

  // Stop autoplay when switching sequences
  useEffect(() => {
    stopAutoPlay();
  }, [seqIndex, stopAutoPlay]);

  if (!instrument || sequences.length === 0) {
    return <p className="text-sm text-gray-500">No tutorials available for this instrument.</p>;
  }

  const progress = currentSeq ? (stepIndex / currentSeq.keys.length) * 100 : 0;
  const expectedMapping = expectedKey ? instrument.keyMappings[expectedKey] : undefined;

  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-white p-3 sm:p-5 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="font-semibold">Guided Tutorial</h4>
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          {sequences.map((seq, i) => (
            <button
              key={i}
              onClick={() => { setSeqIndex(i); setStepIndex(0); setFeedback(null); }}
              className={`rounded px-2 py-1 text-xs font-medium sm:py-0.5 ${
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

      {/* Auto-play + progress */}
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={isAutoPlaying ? stopAutoPlay : startAutoPlay}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            isAutoPlaying
              ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50'
          }`}
        >
          {isAutoPlaying ? 'Stop' : 'Listen'}
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Auto-play visualization */}
      {isAutoPlaying && (
        <div className="mb-4 text-center">
          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Playing pattern — listen and learn:</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {currentSeq?.keys.map((key, i) => {
              const m = instrument.keyMappings[key];
              return (
                <span
                  key={i}
                  className={`rounded px-2.5 py-1.5 text-xs font-medium transition-all ${
                    i === autoPlayIndex
                      ? 'scale-110 bg-indigo-500 text-white shadow-lg shadow-indigo-300 dark:shadow-indigo-800'
                      : i < autoPlayIndex
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                  }`}
                >
                  {m?.label ?? key} <span className="opacity-60 uppercase">({key})</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Next key indicator (hidden during autoplay) */}
      {!isAutoPlaying && (
        <div className="mb-4 text-center">
          <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Next key:</p>
          <div className={`inline-flex flex-col items-center rounded-xl border-2 px-6 py-3 transition-all ${
            feedback === 'correct'
              ? 'border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-900/20'
              : feedback === 'wrong'
                ? 'border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-900/20'
                : 'border-indigo-300 bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-900/20'
          }`}>
            {expectedMapping && (
              <span className="text-2xl font-bold">{expectedMapping.label}</span>
            )}
            <kbd className="mt-1 text-sm uppercase text-gray-500 dark:text-gray-400">Key: {expectedKey === ';' ? ';' : expectedKey}</kbd>
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
      )}

      {/* Sequence preview */}
      {!isAutoPlaying && (
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
                {m?.label ?? key} <span className="opacity-60 uppercase">({key})</span>
              </span>
            );
          })}
        </div>
      )}

      <p className="mt-4 text-center text-xs text-gray-400">
        {completedCount} notes played correctly
      </p>
    </div>
  );
}
