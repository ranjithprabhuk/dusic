import { useTutorialStore } from '../../store/useTutorialStore';
import type { Lesson, TutorialLevel } from '../../types/tutorial';
import { LEVEL_ORDER, LEVEL_LABELS, LEVEL_COLORS } from '../../types/tutorial';

interface ProgressMapProps {
  lessons: Lesson[];
  onSelectLesson: (lesson: Lesson) => void;
}

export default function ProgressMap({ lessons, onSelectLesson }: ProgressMapProps) {
  const { progress, isLessonUnlocked } = useTutorialStore();

  const grouped = LEVEL_ORDER.reduce<Record<TutorialLevel, Lesson[]>>((acc, level) => {
    acc[level] = lessons.filter((l) => l.level === level);
    return acc;
  }, { beginner: [], intermediate: [], advanced: [], expert: [] });

  const completedCount = lessons.filter((l) => progress[l.id]?.completed).length;

  return (
    <div>
      {/* Overall progress */}
      <div className="mb-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{ width: `${(completedCount / lessons.length) * 100}%` }}
          />
        </div>
        <span className="shrink-0 text-sm font-medium text-gray-600 dark:text-gray-400">
          {completedCount}/{lessons.length}
        </span>
      </div>

      {/* Levels */}
      {LEVEL_ORDER.map((level) => {
        const levelLessons = grouped[level];
        if (levelLessons.length === 0) return null;

        return (
          <div key={level} className="mb-4">
            <h4 className={`mb-2 inline-block rounded px-2 py-0.5 text-xs font-semibold ${LEVEL_COLORS[level]}`}>
              {LEVEL_LABELS[level]}
            </h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {levelLessons.map((lesson, idx) => {
                const lessonIndex = lessons.indexOf(lesson);
                const prevId = lessonIndex > 0 ? lessons[lessonIndex - 1].id : null;
                const unlocked = isLessonUnlocked(lesson.id, prevId);
                const prog = progress[lesson.id];
                const stars = prog?.stars ?? 0;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => unlocked && onSelectLesson(lesson)}
                    disabled={!unlocked}
                    className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                      unlocked
                        ? 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30'
                        : 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-50 dark:border-gray-800 dark:bg-gray-950'
                    }`}
                  >
                    {/* Lesson number */}
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      prog?.completed
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                        : unlocked
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                          : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                    }`}>
                      {idx + 1}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{lesson.title}</p>
                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                        {lesson.sequence.length} notes &middot; {lesson.tempo} BPM
                      </p>
                    </div>

                    {/* Stars */}
                    {unlocked && (
                      <div className="flex shrink-0 gap-0.5 text-sm">
                        {[1, 2, 3].map((i) => (
                          <span key={i} className={i <= stars ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}>
                            {i <= stars ? '\u2605' : '\u2606'}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Lock icon */}
                    {!unlocked && (
                      <svg className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
