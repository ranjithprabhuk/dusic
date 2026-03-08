import { useState, useEffect, useRef, useCallback } from 'react';
import { getInstrument } from '../../instruments';
import { instrumentEngine } from '../../engine/InstrumentEngine';
import { audioEngine } from '../../engine/AudioEngine';
import { useTutorialStore } from '../../store/useTutorialStore';
import ScoreDisplay from './ScoreDisplay';
import type { Lesson, ScoreResult } from '../../types/tutorial';
import { LEVEL_LABELS, LEVEL_COLORS } from '../../types/tutorial';

interface LessonPlayerProps {
  lesson: Lesson;
  onBack: () => void;
  onNext: (() => void) | null;
}

type Phase = 'ready' | 'demo' | 'practice' | 'attempt' | 'done';

export default function LessonPlayer({ lesson, onBack, onNext }: LessonPlayerProps) {
  const instrument = getInstrument(lesson.instrumentId);
  const setLessonProgress = useTutorialStore((s) => s.setLessonProgress);

  const [phase, setPhase] = useState<Phase>('ready');
  const [stepIndex, setStepIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [practiceRound, setPracticeRound] = useState(0);

  // Demo state
  const [demoIndex, setDemoIndex] = useState(-1);
  const demoTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Scoring (attempt mode only)
  const correctCountRef = useRef(0);
  const timingMsRef = useRef<number[]>([]);
  const lastBeatTimeRef = useRef(0);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const msPerBeat = (60 / lesson.tempo) * 1000;

  const stopDemo = useCallback(() => {
    if (demoTimer.current) {
      clearTimeout(demoTimer.current);
      demoTimer.current = undefined;
    }
    instrumentEngine.stopAll();
    setDemoIndex(-1);
  }, []);

  const startDemo = useCallback(async () => {
    if (!instrument) return;
    await audioEngine.ensureResumed();
    await instrumentEngine.init();
    stopDemo();
    setPhase('demo');

    const playStep = (i: number) => {
      if (i >= lesson.sequence.length) {
        setPhase('ready');
        setDemoIndex(-1);
        return;
      }
      const key = lesson.sequence[i];
      setDemoIndex(i);
      instrumentEngine.playNote(lesson.instrumentId, key);

      const noteOff = instrument.type === 'tonal' ? msPerBeat * 0.7 : 150;
      demoTimer.current = setTimeout(() => {
        instrumentEngine.stopNote(lesson.instrumentId, key);
        demoTimer.current = setTimeout(() => playStep(i + 1), msPerBeat * 0.3);
      }, noteOff);
    };

    playStep(0);
  }, [instrument, lesson, msPerBeat, stopDemo]);

  const startPractice = useCallback(() => {
    stopDemo();
    setPhase('practice');
    setStepIndex(0);
    setFeedback(null);
    setScore(null);
    setPracticeRound((r) => r + 1);
  }, [stopDemo]);

  const startAttempt = useCallback(() => {
    stopDemo();
    setPhase('attempt');
    setStepIndex(0);
    setFeedback(null);
    setScore(null);
    correctCountRef.current = 0;
    timingMsRef.current = [];
    lastBeatTimeRef.current = performance.now();
  }, [stopDemo]);

  const finishAttempt = useCallback(() => {
    const correct = correctCountRef.current;
    const total = lesson.sequence.length;
    const accuracy = (correct / total) * 100;
    const timings = timingMsRef.current;
    const avgTimingMs = timings.length > 0
      ? timings.reduce((a, b) => a + b, 0) / timings.length
      : 999;

    let stars = 0;
    if (accuracy >= 90 && avgTimingMs < 200) stars = 3;
    else if (accuracy >= 80) stars = 2;
    else if (accuracy >= 70) stars = 1;

    const result: ScoreResult = { correct, total, accuracy, avgTimingMs, stars };
    setScore(result);
    setPhase('done');
    setLessonProgress(lesson.id, Math.round(accuracy), stars);
  }, [lesson, setLessonProgress]);

  const handleKeyDown = useCallback(async (e: KeyboardEvent) => {
    if (phase !== 'practice' && phase !== 'attempt') return;
    if (!instrument) return;
    const key = e.key.toLowerCase();
    if (!instrument.keyMappings[key]) return;

    await audioEngine.ensureResumed();
    await instrumentEngine.init();
    instrumentEngine.playNote(lesson.instrumentId, key);

    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);

    const expected = lesson.sequence[stepIndex];

    if (phase === 'attempt') {
      // Scored mode
      const now = performance.now();
      const timingDiff = Math.abs(now - lastBeatTimeRef.current);
      lastBeatTimeRef.current = now;

      if (key === expected) {
        correctCountRef.current++;
        timingMsRef.current.push(timingDiff);
        setFeedback('correct');
      } else {
        setFeedback('wrong');
      }

      // Always advance in attempt mode
      if (stepIndex + 1 >= lesson.sequence.length) {
        feedbackTimer.current = setTimeout(() => {
          setFeedback(null);
          finishAttempt();
        }, 400);
      } else {
        setStepIndex(stepIndex + 1);
        feedbackTimer.current = setTimeout(() => setFeedback(null), 200);
      }
    } else {
      // Practice mode — only advance on correct, loop forever
      if (key === expected) {
        setFeedback('correct');
        if (stepIndex + 1 >= lesson.sequence.length) {
          // Loop back to start for another round
          feedbackTimer.current = setTimeout(() => {
            setFeedback(null);
            setStepIndex(0);
            setPracticeRound((r) => r + 1);
          }, 500);
        } else {
          setStepIndex(stepIndex + 1);
          feedbackTimer.current = setTimeout(() => setFeedback(null), 200);
        }
      } else {
        setFeedback('wrong');
        feedbackTimer.current = setTimeout(() => setFeedback(null), 300);
        // Don't advance — let them try again
      }
    }
  }, [phase, instrument, lesson, stepIndex, finishAttempt]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    instrumentEngine.stopNote(lesson.instrumentId, e.key.toLowerCase());
  }, [lesson.instrumentId]);

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
      stopDemo();
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
      instrumentEngine.stopAll();
    };
  }, [stopDemo]);

  if (!instrument) return null;

  const isPlaying = phase === 'practice' || phase === 'attempt';
  const expectedKey = lesson.sequence[stepIndex];
  const expectedMapping = expectedKey ? instrument.keyMappings[expectedKey] : undefined;
  const progress = isPlaying ? (stepIndex / lesson.sequence.length) * 100 : 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <button
            onClick={onBack}
            className="mb-2 text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            &larr; Back to lessons
          </button>
          <h3 className="text-lg font-bold">{lesson.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{lesson.description}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${LEVEL_COLORS[lesson.level]}`}>
              {LEVEL_LABELS[lesson.level]}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{lesson.tempo} BPM</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{lesson.sequence.length} notes</span>
          </div>
        </div>
      </div>

      {/* Score display */}
      {phase === 'done' && score && (
        <ScoreDisplay
          score={score}
          onRetry={startAttempt}
          onNext={onNext}
        />
      )}

      {/* Active phases */}
      {phase !== 'done' && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          {/* Controls */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              onClick={phase === 'demo' ? stopDemo : startDemo}
              disabled={isPlaying}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                phase === 'demo'
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:opacity-50 dark:bg-indigo-900/30 dark:text-indigo-300'
              }`}
            >
              {phase === 'demo' ? 'Stop' : 'Listen'}
            </button>
            <button
              onClick={startPractice}
              disabled={phase === 'demo'}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                phase === 'practice'
                  ? 'bg-green-200 text-green-800 ring-2 ring-green-400 dark:bg-green-900/50 dark:text-green-300 dark:ring-green-600'
                  : 'bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 dark:bg-green-900/30 dark:text-green-400'
              }`}
            >
              {phase === 'practice' ? 'Practicing...' : 'Practice'}
            </button>
            <button
              onClick={startAttempt}
              disabled={phase === 'demo'}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                phase === 'attempt'
                  ? 'bg-amber-200 text-amber-800 ring-2 ring-amber-400 dark:bg-amber-900/50 dark:text-amber-300 dark:ring-amber-600'
                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200 disabled:opacity-50 dark:bg-amber-900/30 dark:text-amber-400'
              }`}
            >
              {phase === 'attempt' ? 'In Progress...' : 'Take Test'}
            </button>

            {/* Progress bar */}
            {isPlaying && (
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className={`h-full rounded-full transition-all ${phase === 'attempt' ? 'bg-amber-500' : 'bg-green-500'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>

          {/* Mode indicator for practice */}
          {phase === 'practice' && (
            <div className="mb-3 flex items-center justify-center gap-2 text-xs text-green-600 dark:text-green-400">
              <span>Round {practiceRound}</span>
              <span className="text-gray-300 dark:text-gray-600">&middot;</span>
              <span>No scoring — practice until you're ready</span>
            </div>
          )}

          {/* Mode indicator for attempt */}
          {phase === 'attempt' && (
            <div className="mb-3 text-center text-xs text-amber-600 dark:text-amber-400">
              Scored test — each note counts!
            </div>
          )}

          {/* Demo visualization */}
          {phase === 'demo' && (
            <div className="mb-4 text-center">
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Listen to the pattern:</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {lesson.sequence.map((key, i) => {
                  const m = instrument.keyMappings[key];
                  return (
                    <span
                      key={i}
                      className={`rounded px-2.5 py-1.5 text-xs font-medium transition-all ${
                        i === demoIndex
                          ? 'scale-110 bg-indigo-500 text-white shadow-lg shadow-indigo-300 dark:shadow-indigo-800'
                          : i < demoIndex
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

          {/* Practice / Attempt mode */}
          {isPlaying && (
            <>
              {/* Next key */}
              <div className="mb-4 text-center">
                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Press this key:</p>
                <div className={`inline-flex flex-col items-center rounded-xl border-2 px-6 py-3 transition-all ${
                  feedback === 'correct'
                    ? 'border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-900/20'
                    : feedback === 'wrong'
                      ? 'border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-900/20'
                      : phase === 'attempt'
                        ? 'border-amber-300 bg-amber-50 dark:border-amber-600 dark:bg-amber-900/20'
                        : 'border-indigo-300 bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-900/20'
                }`}>
                  {expectedMapping && (
                    <span className="text-2xl font-bold">{expectedMapping.label}</span>
                  )}
                  <kbd className="mt-1 text-sm uppercase text-gray-500 dark:text-gray-400">
                    Key: {expectedKey === ';' ? ';' : expectedKey}
                  </kbd>
                </div>
                {feedback === 'correct' && (
                  <p className="mt-1 text-xs font-medium text-green-600 dark:text-green-400">Correct!</p>
                )}
                {feedback === 'wrong' && phase === 'practice' && (
                  <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                    Try again — press <kbd className="font-bold uppercase">{expectedKey}</kbd>
                  </p>
                )}
                {feedback === 'wrong' && phase === 'attempt' && (
                  <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">Wrong key!</p>
                )}
              </div>

              {/* Sequence overview */}
              <div className="flex flex-wrap justify-center gap-1">
                {lesson.sequence.map((key, i) => {
                  const m = instrument.keyMappings[key];
                  return (
                    <span
                      key={i}
                      className={`rounded px-2 py-1 text-xs font-medium ${
                        i < stepIndex
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : i === stepIndex
                            ? phase === 'attempt'
                              ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-300 dark:bg-amber-900/40 dark:text-amber-300'
                              : 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-300'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                      }`}
                    >
                      {m?.label ?? key} <span className="opacity-60 uppercase">({key})</span>
                    </span>
                  );
                })}
              </div>
            </>
          )}

          {/* Ready state */}
          {phase === 'ready' && (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <p><strong>Listen</strong> to hear the pattern, <strong>Practice</strong> to play freely, or <strong>Take Test</strong> for a scored attempt.</p>
              {/* Show full sequence */}
              <div className="mt-3 flex flex-wrap justify-center gap-1">
                {lesson.sequence.map((key, i) => {
                  const m = instrument.keyMappings[key];
                  return (
                    <span key={i} className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-500">
                      {m?.label ?? key} <span className="opacity-60 uppercase">({key})</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
