import { useState, useCallback } from 'react';
import { getCurriculum } from '../../data/curricula';
import { getInstrument } from '../../instruments';
import ProgressMap from './ProgressMap';
import LessonPlayer from './LessonPlayer';
import type { Lesson } from '../../types/tutorial';

interface AdvancedTutorialProps {
  instrumentId: string;
  onBack: () => void;
}

export default function AdvancedTutorial({ instrumentId, onBack }: AdvancedTutorialProps) {
  const instrument = getInstrument(instrumentId);
  const curriculum = getCurriculum(instrumentId);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const handleNext = useCallback(() => {
    if (!curriculum || !selectedLesson) return;
    const idx = curriculum.lessons.indexOf(selectedLesson);
    if (idx >= 0 && idx + 1 < curriculum.lessons.length) {
      setSelectedLesson(curriculum.lessons[idx + 1]);
    } else {
      setSelectedLesson(null);
    }
  }, [curriculum, selectedLesson]);

  if (!instrument || !curriculum) {
    return (
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        No advanced lessons available for this instrument.
      </div>
    );
  }

  // Lesson player
  if (selectedLesson) {
    const idx = curriculum.lessons.indexOf(selectedLesson);
    const hasNext = idx >= 0 && idx + 1 < curriculum.lessons.length;

    return (
      <LessonPlayer
        key={selectedLesson.id}
        lesson={selectedLesson}
        onBack={() => setSelectedLesson(null)}
        onNext={hasNext ? handleNext : null}
      />
    );
  }

  // Lesson list
  return (
    <div>
      <div className="mb-4">
        <button
          onClick={onBack}
          className="mb-2 text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          &larr; Back to instruments
        </button>
        <h3 className="text-lg font-bold">{instrument.name} — Advanced Lessons</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Progress through {curriculum.lessons.length} lessons from beginner to expert.
          Complete each lesson with at least 1 star to unlock the next.
        </p>
      </div>

      <ProgressMap
        lessons={curriculum.lessons}
        onSelectLesson={setSelectedLesson}
      />
    </div>
  );
}
