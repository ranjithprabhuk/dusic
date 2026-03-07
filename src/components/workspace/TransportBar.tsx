import { useTransportStore } from '../../store/useTransportStore';
import { useCompositionStore } from '../../store/useCompositionStore';
import { audioEngine } from '../../engine/AudioEngine';
import { playbackEngine } from '../../engine/PlaybackEngine';
import { instrumentEngine } from '../../engine/InstrumentEngine';
import { metronome } from '../../engine/Metronome';

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
  transport.stop();
  playbackEngine.stop();
  metronome.stop();
  audioEngine.stopPlayheadUpdate();
}

export default function TransportBar() {
  const {
    isPlaying, isRecording, metronomeEnabled, gridSnap, loopEnabled,
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
    <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-white px-2 py-1.5 sm:gap-3 sm:px-4 sm:py-2 dark:border-gray-800 dark:bg-gray-900">
      {/* Transport Controls */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        <button
          onClick={handleStop}
          disabled={!hasTracks}
          className={`rounded p-2 sm:p-1.5 ${hasTracks ? 'hover:bg-gray-100 dark:hover:bg-gray-800' : 'cursor-not-allowed opacity-30'}`}
          title="Stop"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <rect x="4" y="4" width="12" height="12" rx="1" />
          </svg>
        </button>

        <button
          onClick={handlePlay}
          disabled={!hasTracks}
          className={`rounded p-2 sm:p-1.5 ${hasTracks ? 'hover:bg-gray-100 dark:hover:bg-gray-800' : 'cursor-not-allowed opacity-30'}`}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 4h3v12H5zM12 4h3v12h-3z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6 4l10 6-10 6z" />
            </svg>
          )}
        </button>

        <button
          onClick={handleRecord}
          disabled={!hasTracks}
          className={`rounded p-2 sm:p-1.5 ${!hasTracks ? 'cursor-not-allowed opacity-30' : isRecording ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          title="Record"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <circle cx="10" cy="10" r="6" />
          </svg>
        </button>
      </div>

      {/* Position Display */}
      <div className="rounded bg-gray-100 px-2 py-1 font-mono text-sm sm:px-3 dark:bg-gray-800">
        {formatPosition(playheadPosition)}
      </div>

      <div className="mx-1 hidden h-6 w-px bg-gray-200 sm:mx-2 sm:block dark:bg-gray-700" />

      {/* BPM */}
      <div className="flex items-center gap-1.5">
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">BPM</label>
        <input
          type="number"
          min={30}
          max={300}
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="w-14 rounded border border-gray-300 bg-white px-1.5 py-1 text-center text-sm sm:w-16 sm:px-2 dark:border-gray-700 dark:bg-gray-800"
        />
      </div>

      <div className="mx-1 hidden h-6 w-px bg-gray-200 sm:mx-2 sm:block dark:bg-gray-700" />

      {/* Toggles */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        <ToggleButton active={metronomeEnabled} onClick={() => setMetronomeEnabled(!metronomeEnabled)} label="Metro" />
        <ToggleButton active={gridSnap} onClick={() => setGridSnap(!gridSnap)} label="Snap" />
        <ToggleButton active={loopEnabled} onClick={() => setLoopEnabled(!loopEnabled)} label="Loop" />
      </div>
    </div>
  );
}

function ToggleButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded px-2.5 py-1.5 text-xs font-medium transition-colors sm:py-1 ${
        active
          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
          : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
      }`}
    >
      {label}
    </button>
  );
}
