import { useState } from 'react';
import InstrumentList from '../components/tutorial/InstrumentList';
import PracticeMode from '../components/tutorial/PracticeMode';
import GuidedTutorial from '../components/tutorial/GuidedTutorial';
import AdvancedTutorial from '../components/tutorial/AdvancedTutorial';

type TutorialMode = 'basic' | 'advanced';

export default function TutorialPage() {
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null);
  const [mode, setMode] = useState<TutorialMode>('basic');

  // Advanced tutorial for selected instrument
  if (selectedInstrument && mode === 'advanced') {
    return (
      <div className="mx-auto max-w-4xl px-3 py-4 sm:p-6">
        <AdvancedTutorial
          instrumentId={selectedInstrument}
          onBack={() => setSelectedInstrument(null)}
        />
      </div>
    );
  }

  // Basic tutorial for selected instrument
  if (selectedInstrument && mode === 'basic') {
    return (
      <div className="mx-auto max-w-4xl px-3 py-4 sm:p-6">
        <PracticeMode
          instrumentId={selectedInstrument}
          onBack={() => setSelectedInstrument(null)}
        />
        <GuidedTutorial instrumentId={selectedInstrument} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-3 py-4 sm:p-6">
      <h2 className="text-xl font-bold sm:text-2xl">Tutorial & Practice</h2>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Choose an instrument to start practicing. Each key on your keyboard is mapped to a musical note.
      </p>

      {/* Mode toggle */}
      <div className="mt-4 flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        <button
          onClick={() => setMode('basic')}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            mode === 'basic'
              ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          Basic
          <span className="ml-1.5 text-xs text-gray-500 dark:text-gray-400">Free practice & guided</span>
        </button>
        <button
          onClick={() => setMode('advanced')}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            mode === 'advanced'
              ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          Advanced
          <span className="ml-1.5 text-xs text-gray-500 dark:text-gray-400">Structured lessons & scoring</span>
        </button>
      </div>

      <div className="mt-6">
        <InstrumentList onSelect={setSelectedInstrument} />
      </div>
    </div>
  );
}
