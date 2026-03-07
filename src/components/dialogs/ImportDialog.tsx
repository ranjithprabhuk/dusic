import { useState, useRef } from 'react';
import { useCompositionStore } from '../../store/useCompositionStore';
import { audioImportService } from '../../services/AudioImportService';
import { projectFileService } from '../../services/ProjectFileService';

interface ImportDialogProps {
  onClose: () => void;
}

export default function ImportDialog({ onClose }: ImportDialogProps) {
  const { bpm, tracks, addTrack, addSegment, loadComposition } = useCompositionStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAudioFile = async (file: File) => {
    setLoading(true);
    setError('');
    try {
      const segment = await audioImportService.importFile(file, bpm);
      // Add to first track or create a new one
      let targetTrackId = tracks[0]?.id;
      if (!targetTrackId) {
        addTrack();
        targetTrackId = useCompositionStore.getState().tracks[0]?.id;
      }
      if (targetTrackId) {
        addSegment(targetTrackId, segment);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectFile = async (file: File) => {
    setLoading(true);
    setError('');
    try {
      const text = await projectFileService.readFile(file);
      const project = projectFileService.importProject(text);
      loadComposition(project.composition);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.dusic.json') || file.name.endsWith('.json')) {
      handleProjectFile(file);
    } else {
      handleAudioFile(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose} role="dialog">
      <div className="w-full max-w-md rounded-t-lg bg-white p-4 shadow-xl sm:rounded-lg sm:p-6 dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold">Import</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Import audio files (MP3, WAV, OGG, FLAC) or Dusic project files (.dusic.json).
        </p>
        <div className="mt-4">
          <input
            ref={fileRef}
            type="file"
            accept=".mp3,.wav,.ogg,.flac,.json"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={loading}
            className="w-full rounded border-2 border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-600 hover:border-indigo-400 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
          >
            {loading ? 'Importing...' : 'Click to select file'}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="rounded px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 sm:px-3 sm:py-1.5 dark:text-gray-400 dark:hover:bg-gray-800">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
