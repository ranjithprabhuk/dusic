import type { ScoreResult } from '../../types/tutorial';

interface ScoreDisplayProps {
  score: ScoreResult;
  onRetry: () => void;
  onNext: (() => void) | null;
}

export default function ScoreDisplay({ score, onRetry, onNext }: ScoreDisplayProps) {
  const stars = score.stars;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 text-center dark:border-gray-700 dark:bg-gray-900">
      {/* Stars */}
      <div className="mb-3 flex justify-center gap-1 text-3xl">
        {[1, 2, 3].map((i) => (
          <span key={i} className={i <= stars ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}>
            {i <= stars ? '\u2605' : '\u2606'}
          </span>
        ))}
      </div>

      {/* Accuracy */}
      <p className="text-2xl font-bold">
        {Math.round(score.accuracy)}%
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">Accuracy</p>

      {/* Stats */}
      <div className="mt-3 flex justify-center gap-6 text-sm">
        <div>
          <span className="font-semibold text-green-600 dark:text-green-400">{score.correct}</span>
          <span className="text-gray-500 dark:text-gray-400"> / {score.total} correct</span>
        </div>
        <div>
          <span className="font-semibold">{Math.round(score.avgTimingMs)}</span>
          <span className="text-gray-500 dark:text-gray-400"> ms avg timing</span>
        </div>
      </div>

      {/* Message */}
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        {stars === 3 ? 'Perfect! You\'ve mastered this lesson.' :
         stars === 2 ? 'Great job! Try again for 3 stars.' :
         stars === 1 ? 'Good! Lesson unlocked. Keep practicing for a better score.' :
         'Keep practicing! You need 70% accuracy to pass.'}
      </p>

      {/* Actions */}
      <div className="mt-4 flex justify-center gap-2">
        <button
          onClick={onRetry}
          className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Retake Test
        </button>
        {onNext && stars >= 1 && (
          <button
            onClick={onNext}
            className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Next Lesson
          </button>
        )}
      </div>
    </div>
  );
}
