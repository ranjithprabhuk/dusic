import { useState } from 'react';
import InstrumentList from '../components/tutorial/InstrumentList';
import PracticeMode from '../components/tutorial/PracticeMode';
import GuidedTutorial from '../components/tutorial/GuidedTutorial';

export default function TutorialPage() {
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null);

  if (selectedInstrument) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <PracticeMode
          instrumentId={selectedInstrument}
          onBack={() => setSelectedInstrument(null)}
        />
        <GuidedTutorial instrumentId={selectedInstrument} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h2 className="text-2xl font-bold">Tutorial & Practice</h2>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Choose an instrument to start practicing. Each key on your keyboard is mapped to a musical note.
      </p>
      <div className="mt-6">
        <InstrumentList onSelect={setSelectedInstrument} />
      </div>
    </div>
  );
}
