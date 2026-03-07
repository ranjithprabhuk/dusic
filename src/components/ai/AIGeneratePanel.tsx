import { useState } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useCompositionStore } from '../../store/useCompositionStore';
import { aiService } from '../../services/AIService';
import type { AIInputMethod, AIGenerateParams } from '../../types/ai';

const GENRES = ['Pop', 'Rock', 'Jazz', 'Classical', 'Electronic', 'Ambient', 'Hip-Hop', 'Folk'];
const MOODS = ['Happy', 'Sad', 'Energetic', 'Calm', 'Dark', 'Uplifting', 'Mysterious'];

interface AIGeneratePanelProps {
  onClose: () => void;
}

export default function AIGeneratePanel({ onClose }: AIGeneratePanelProps) {
  const { aiConfig } = useSettingsStore();
  const { tracks, bpm, addTrack, addSegment } = useCompositionStore();

  const [method, setMethod] = useState<AIInputMethod>('text');
  const [textPrompt, setTextPrompt] = useState('');
  const [genre, setGenre] = useState('Pop');
  const [mood, setMood] = useState('Happy');
  const [instrument, setInstrument] = useState('piano');
  const [midiInput, setMidiInput] = useState('60,62,64,65,67');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!aiConfig) {
    return (
      <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">AI Music Generation</span>
          <button onClick={onClose} className="rounded px-2 py-0.5 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">Close</button>
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          AI is not configured. <a href="#/settings" className="text-indigo-600 underline dark:text-indigo-400">Go to Settings</a> to set up your API key.
        </p>
      </div>
    );
  }

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const params: AIGenerateParams = { method };
      if (method === 'text') params.textPrompt = textPrompt;
      if (method === 'selectors') {
        params.genre = genre;
        params.mood = mood;
        params.instrument = instrument;
        params.tempo = bpm;
      }
      if (method === 'midiPattern') {
        params.midiPattern = midiInput.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
      }

      const result = await aiService.generate(aiConfig, params);

      // Add to first track or create new
      let targetTrackId = tracks[0]?.id;
      if (!targetTrackId) {
        addTrack();
        targetTrackId = useCompositionStore.getState().tracks[0]?.id;
      }
      if (targetTrackId) {
        addSegment(targetTrackId, {
          id: `seg-ai-${Date.now()}`,
          type: 'notes',
          startBeat: 0,
          durationBeats: result.durationBeats,
          notes: result.notes,
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 dark:border-gray-800">
        <span className="text-sm font-medium">AI Music Generation</span>
        <button onClick={onClose} className="rounded px-2 py-0.5 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">Close</button>
      </div>

      <div className="p-4">
        {/* Method tabs */}
        <div className="mb-4 flex gap-1">
          {([['text', 'Text Prompt'], ['selectors', 'Selectors'], ['trackSeed', 'Track Seed'], ['midiPattern', 'MIDI Pattern']] as const).map(([m, label]) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`rounded px-2.5 py-1 text-xs font-medium ${
                method === m
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                  : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Method-specific inputs */}
        {method === 'text' && (
          <textarea
            value={textPrompt}
            onChange={(e) => setTextPrompt(e.target.value)}
            placeholder="Describe the music you want to generate..."
            rows={3}
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          />
        )}

        {method === 'selectors' && (
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Genre" value={genre} options={GENRES} onChange={setGenre} />
            <SelectField label="Mood" value={mood} options={MOODS} onChange={setMood} />
            <SelectField label="Instrument" value={instrument}
              options={['Piano', 'Guitar', 'Synthesizer', 'Dholak', 'Tabla']}
              onChange={(v) => setInstrument(v.toLowerCase())} />
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Tempo</label>
              <input type="number" value={bpm} readOnly
                className="mt-1 w-full rounded border border-gray-300 bg-gray-50 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800" />
            </div>
          </div>
        )}

        {method === 'trackSeed' && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Uses the first track's data as a seed for AI generation. Add tracks to the timeline first.
          </p>
        )}

        {method === 'midiPattern' && (
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">MIDI Pitches (comma-separated)</label>
            <input
              type="text"
              value={midiInput}
              onChange={(e) => setMidiInput(e.target.value)}
              placeholder="60,62,64,65,67"
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
        )}

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="mt-4 rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </div>
    </div>
  );
}

function SelectField({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
