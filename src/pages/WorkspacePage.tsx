import { useState } from 'react';
import { useCompositionStore } from '../store/useCompositionStore';
import { useKeyboardMapping } from '../hooks/useKeyboardMapping';
import { usePlayback } from '../hooks/usePlayback';
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
  const [selectedTrackId, setSelectedTrackId] = useState<string>();
  const activeTrackId = selectedTrackId ?? tracks[0]?.id;
  useKeyboardMapping(activeTrackId);
  usePlayback();
  useUndoRedo();
  useBeforeUnload();
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
      <TransportBar selectedTrackId={activeTrackId} />
      <InstrumentPanel />

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50/80 px-2 py-1 backdrop-blur-sm sm:px-4 dark:border-gray-800 dark:bg-gray-900/80">
        {/* Edit tools */}
        <div className="hidden sm:contents">
          <Toolbar selectedTrackId={selectedTrackId} selectedSegmentId={selectedSegmentId} />
        </div>

        <div className="flex-1" />

        {/* File operations */}
        <div className="flex items-center gap-0.5 rounded-md bg-gray-100 p-0.5 dark:bg-gray-800">
          <FileButton icon={<SaveIcon />} label="Save" onClick={() => setDialog('save')} />
          <FileButton icon={<FolderIcon />} label="Load" onClick={() => setDialog('load')} />
          <FileButton icon={<ImportIcon />} label="Import" onClick={() => setDialog('import')} />
          <FileButton icon={<ExportIcon />} label="Export" onClick={() => setDialog('export')} />
        </div>

        <div className="mx-0.5 h-5 w-px bg-gray-200 sm:mx-1 dark:bg-gray-700" />

        {/* Panel toggles */}
        <div className="flex items-center gap-0.5">
          <PanelToggle active={showKeyboard} onClick={() => setShowKeyboard(!showKeyboard)} icon={<KeyboardIcon />} label="Keys" smLabel="Keyboard" />
          <PanelToggle active={showEffects} onClick={() => setShowEffects(!showEffects)} icon={<FxIcon />} label="FX" smLabel="Effects" />
          <PanelToggle active={showAI} onClick={() => setShowAI(!showAI)} icon={<SparkleIcon />} label="AI" />
        </div>
      </div>

      <Timeline
        selectedSegmentId={selectedSegmentId}
        selectedTrackId={activeTrackId}
        onSelectSegment={handleSelectSegment}
        onSelectTrack={(trackId) => setSelectedTrackId(trackId)}
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

function FileButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="flex items-center gap-1 rounded px-2 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-white hover:text-gray-700 sm:py-1 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function PanelToggle({ active, onClick, icon, label, smLabel }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; smLabel?: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all sm:py-1 ${
        active
          ? 'bg-indigo-100 text-indigo-700 shadow-sm dark:bg-indigo-900/40 dark:text-indigo-300'
          : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800'
      }`}
    >
      {icon}
      <span className="sm:hidden">{label}</span>
      {smLabel && <span className="hidden sm:inline">{smLabel}</span>}
      {!smLabel && <span className="hidden sm:inline">{label}</span>}
    </button>
  );
}

// --- Inline SVG icons (small, 14x14) ---

function SaveIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3h8l4 4v8a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
      <path strokeLinecap="round" d="M7 3v4h5V3M7 13h6" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7V5a2 2 0 012-2h3l2 2h5a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  );
}

function ImportIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 3v10m0 0l-3-3m3 3l3-3M4 17h12" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 13V3m0 0l-3 3m3-3l3 3M4 17h12" />
    </svg>
  );
}

function KeyboardIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="5" width="16" height="10" rx="2" />
      <path d="M5 8h1M8 8h1M11 8h1M14 8h1M6 11h8" />
    </svg>
  );
}

function FxIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" d="M3 10c2-4 4 4 7 0s5 4 7 0" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2z" />
    </svg>
  );
}
