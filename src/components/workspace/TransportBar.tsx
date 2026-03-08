import { useTransportStore } from '../../store/useTransportStore';
import { useCompositionStore } from '../../store/useCompositionStore';
import { audioEngine } from '../../engine/AudioEngine';
import { playbackEngine } from '../../engine/PlaybackEngine';
import { instrumentEngine } from '../../engine/InstrumentEngine';
import { metronome } from '../../engine/Metronome';
import { micEngine } from '../../engine/MicEngine';
import { audioImportService } from '../../services/AudioImportService';

// Auto-stop: when AudioEngine detects end of composition, clean up playback
audioEngine.onAutoStop = () => {
  playbackEngine.stop();
  metronome.stop();
};

audioEngine.onLoop = (loopStartBeat) => {
  playbackEngine.resetForLoop(loopStartBeat);
};

async function handlePlay() {
  const transport = useTransportStore.getState();
  if (transport.isPlaying) {
    // Pause
    transport.pause();
    playbackEngine.stop();
    metronome.stop();
    audioEngine.stopPlayheadUpdate();
    return;
  }

  // Resume AudioContext from user gesture (critical for autoplay policy)
  await audioEngine.ensureResumed();
  await instrumentEngine.init();

  const { bpm } = useCompositionStore.getState();

  transport.play();
  audioEngine.startPlayheadAnimation();
  playbackEngine.start(transport.playheadPosition);

  if (transport.metronomeEnabled) {
    metronome.start(bpm);
  }
}

async function handleRecord() {
  const transport = useTransportStore.getState();
  await audioEngine.ensureResumed();
  await instrumentEngine.init();

  transport.toggleRecord();

  const updated = useTransportStore.getState();
  if (updated.isPlaying && updated.isRecording) {
    const { bpm } = useCompositionStore.getState();
    audioEngine.startPlayheadAnimation();
    playbackEngine.start(updated.playheadPosition);
    if (updated.metronomeEnabled) {
      metronome.start(bpm);
    }
  } else if (!updated.isPlaying) {
    playbackEngine.stop();
    metronome.stop();
    audioEngine.stopPlayheadUpdate();
  }
}

function handleStop() {
  const transport = useTransportStore.getState();
  if (transport.isMicRecording) {
    micEngine.stopRecording(); // discard recording on stop
  }
  transport.stop();
  playbackEngine.stop();
  metronome.stop();
  audioEngine.stopPlayheadUpdate();
}

// Stored when mic recording starts so we know where to place the segment
let micRecordStartBeat = 0;

async function handleMicRecord(targetTrackId?: string) {
  const transport = useTransportStore.getState();
  await audioEngine.ensureResumed();

  if (transport.isMicRecording) {
    // --- Stop mic recording ---
    const audioBuffer = await micEngine.stopRecording();
    transport.toggleMicRecord();

    // Stop the playhead animation that was tracking recording time
    audioEngine.stopPlayheadUpdate();
    transport.pause();

    if (audioBuffer) {
      const { bpm, tracks, addSegment } = useCompositionStore.getState();
      const segment = await audioImportService.createSegmentFromBuffer(audioBuffer, bpm, micRecordStartBeat);

      // Place on selected track, or fall back to first track
      const target = tracks.find((t) => t.id === targetTrackId) ?? tracks[0];
      if (target) {
        addSegment(target.id, segment);
      }
    }
  } else {
    // --- Start mic recording ---
    const granted = await micEngine.requestPermission();
    if (!granted) {
      alert(micEngine.getErrorMessage());
      return;
    }

    const started = micEngine.startRecording();
    if (!started) {
      alert('Failed to start microphone recording.');
      return;
    }

    // Capture playhead position NOW (before it moves)
    micRecordStartBeat = transport.playheadPosition;

    transport.toggleMicRecord();

    // Only advance the playhead so the user sees time passing, but do NOT
    // play existing tracks — the user just wants to record their voice.
    audioEngine.startPlayheadAnimation();
  }
}

interface TransportBarProps {
  selectedTrackId?: string;
}

export default function TransportBar({ selectedTrackId }: TransportBarProps) {
  const {
    isPlaying, isRecording, isMicRecording, metronomeEnabled, gridSnap, loopEnabled,
    setMetronomeEnabled, setGridSnap, setLoopEnabled,
    playheadPosition,
  } = useTransportStore();
  const { bpm, setBpm, tracks } = useCompositionStore();
  const hasTracks = tracks.length > 0;

  const formatPosition = (beats: number) => {
    const bar = Math.floor(beats / 4) + 1;
    const beat = Math.floor(beats % 4) + 1;
    return `${bar}:${beat}`;
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-2 py-1.5 sm:gap-2 sm:px-4 sm:py-2 dark:border-gray-800 dark:from-gray-900 dark:to-gray-900">
      {/* Transport Controls */}
      <div className="flex items-center rounded-lg bg-gray-100 p-0.5 dark:bg-gray-800">
        <TransportButton
          onClick={handleStop}
          disabled={!hasTracks}
          title="Stop"
          active={false}
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <rect x="5" y="5" width="10" height="10" rx="1" />
          </svg>
        </TransportButton>

        <TransportButton
          onClick={handlePlay}
          disabled={!hasTracks}
          title={isPlaying ? 'Pause' : 'Play'}
          active={isPlaying}
          activeColor="bg-indigo-500 text-white shadow-sm"
        >
          {isPlaying ? (
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5.5 4h3v12h-3zM11.5 4h3v12h-3z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.5 4l9 6-9 6z" />
            </svg>
          )}
        </TransportButton>

        <TransportButton
          onClick={handleRecord}
          disabled={!hasTracks}
          title="Record (Keyboard)"
          active={isRecording}
          activeColor="bg-red-500 text-white shadow-sm"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <circle cx="10" cy="10" r="5" />
          </svg>
        </TransportButton>

        <TransportButton
          onClick={() => handleMicRecord(selectedTrackId)}
          disabled={!hasTracks}
          title={isMicRecording ? 'Stop Mic Recording' : 'Record from Microphone'}
          active={isMicRecording}
          activeColor="animate-pulse bg-red-500 text-white shadow-sm"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a3 3 0 003-3V5a3 3 0 00-6 0v4a3 3 0 003 3z" />
            <path d="M5 9a1 1 0 00-2 0 7 7 0 0014 0 1 1 0 10-2 0 5 5 0 01-10 0z" />
            <path d="M9 15.93V18H7a1 1 0 100 2h6a1 1 0 100-2h-2v-2.07A7.001 7.001 0 0017 9a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 00-2 0 7.001 7.001 0 006 6.93z" />
          </svg>
        </TransportButton>
      </div>

      {/* Position Display */}
      <div className="flex items-center rounded-lg bg-gray-900 px-3 py-1.5 font-mono text-sm tabular-nums text-green-400 shadow-inner dark:bg-black">
        {formatPosition(playheadPosition)}
      </div>

      <Divider />

      {/* BPM */}
      <div className="flex items-center gap-1.5">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">BPM</label>
        <input
          type="number"
          min={30}
          max={300}
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="w-14 rounded-md border border-gray-200 bg-white px-1.5 py-1 text-center text-sm font-medium shadow-sm sm:w-16 dark:border-gray-700 dark:bg-gray-800"
        />
      </div>

      <Divider />

      {/* Toggles */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        <ToggleChip
          active={metronomeEnabled}
          onClick={() => setMetronomeEnabled(!metronomeEnabled)}
          icon={
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2L6 18h8L10 2zM9 10h2v5H9v-5z" />
            </svg>
          }
          label="Metro"
        />
        <ToggleChip
          active={gridSnap}
          onClick={() => setGridSnap(!gridSnap)}
          icon={
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4v12M10 4v12M16 4v12M4 10h12" />
            </svg>
          }
          label="Snap"
        />
        <ToggleChip
          active={loopEnabled}
          onClick={() => setLoopEnabled(!loopEnabled)}
          icon={
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h12l-3-3M16 12H4l3 3" />
            </svg>
          }
          label="Loop"
        />
      </div>
    </div>
  );
}

function Divider() {
  return <div className="mx-0.5 hidden h-6 w-px bg-gray-200 sm:mx-1 sm:block dark:bg-gray-700" />;
}

function TransportButton({
  onClick,
  disabled,
  title,
  active,
  activeColor,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  title: string;
  active: boolean;
  activeColor?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded-md p-2 transition-all sm:p-1.5 ${
        disabled
          ? 'cursor-not-allowed opacity-25'
          : active && activeColor
            ? activeColor
            : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

function ToggleChip({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all sm:gap-1.5 sm:px-3 ${
        active
          ? 'bg-indigo-100 text-indigo-700 shadow-sm ring-1 ring-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:ring-indigo-800'
          : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
