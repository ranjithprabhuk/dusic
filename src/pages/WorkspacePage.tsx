import { useState } from 'react';
import { useCompositionStore } from '../store/useCompositionStore';
import { useKeyboardMapping } from '../hooks/useKeyboardMapping';
import { useUndoRedo } from '../hooks/useUndoRedo';
import { useBeforeUnload } from '../hooks/useBeforeUnload';
import TransportBar from '../components/workspace/TransportBar';
import InstrumentPanel from '../components/workspace/InstrumentPanel';
import KeyboardOverlay from '../components/workspace/KeyboardOverlay';
import Timeline from '../components/workspace/Timeline';
import Toolbar from '../components/workspace/Toolbar';
import PianoRoll from '../components/workspace/PianoRoll';
import EffectsPanel from '../components/workspace/EffectsPanel';
import SaveDialog from '../components/dialogs/SaveDialog';
import LoadDialog from '../components/dialogs/LoadDialog';
import ExportDialog from '../components/dialogs/ExportDialog';
import ImportDialog from '../components/dialogs/ImportDialog';
import AIGeneratePanel from '../components/ai/AIGeneratePanel';

type Dialog = 'save' | 'load' | 'export' | 'import' | null;

export default function WorkspacePage() {
  const { tracks } = useCompositionStore();
  useKeyboardMapping();
  useUndoRedo();
  useBeforeUnload();
  const [selectedTrackId, setSelectedTrackId] = useState<string>();
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>();
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [showEffects, setShowEffects] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);

  const handleSelectSegment = (trackId: string, segmentId: string) => {
    setSelectedTrackId(trackId);
    setSelectedSegmentId(segmentId);
  };

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId);
  const selectedSegment = selectedTrack?.segments.find((s) => s.id === selectedSegmentId);
  const showPianoRoll = selectedSegment?.type === 'notes';

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col overflow-hidden">
      <TransportBar />
      <InstrumentPanel />

      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 px-4 py-1 dark:border-gray-800 dark:bg-gray-900/50">
        <Toolbar selectedTrackId={selectedTrackId} selectedSegmentId={selectedSegmentId} />
        <div className="flex-1" />
        <FileButton label="Save" onClick={() => setDialog('save')} />
        <FileButton label="Load" onClick={() => setDialog('load')} />
        <FileButton label="Import" onClick={() => setDialog('import')} />
        <FileButton label="Export" onClick={() => setDialog('export')} />
        <div className="mx-1 h-5 w-px bg-gray-200 dark:bg-gray-700" />
        <ToggleBtn active={showKeyboard} onClick={() => setShowKeyboard(!showKeyboard)} label="Keyboard" />
        <ToggleBtn active={showEffects} onClick={() => setShowEffects(!showEffects)} label="Effects" />
        <ToggleBtn active={showAI} onClick={() => setShowAI(!showAI)} label="AI" />
      </div>

      <Timeline
        selectedSegmentId={selectedSegmentId}
        onSelectSegment={handleSelectSegment}
      />

      {showPianoRoll && selectedTrackId && selectedSegment && (
        <PianoRoll
          trackId={selectedTrackId}
          segment={selectedSegment}
          onClose={() => setSelectedSegmentId(undefined)}
        />
      )}

      {showEffects && selectedTrackId && selectedTrack && (
        <EffectsPanel trackId={selectedTrackId} effects={selectedTrack.effects} />
      )}

      {showAI && <AIGeneratePanel onClose={() => setShowAI(false)} />}

      {showKeyboard && <KeyboardOverlay />}

      {dialog === 'save' && <SaveDialog onClose={() => setDialog(null)} />}
      {dialog === 'load' && <LoadDialog onClose={() => setDialog(null)} />}
      {dialog === 'export' && <ExportDialog onClose={() => setDialog(null)} />}
      {dialog === 'import' && <ImportDialog onClose={() => setDialog(null)} />}
    </div>
  );
}

function FileButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded px-2 py-0.5 text-xs font-medium text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800"
    >
      {label}
    </button>
  );
}

function ToggleBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded px-2 py-0.5 text-xs font-medium ${
        active
          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
          : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
      }`}
    >
      {label}
    </button>
  );
}
