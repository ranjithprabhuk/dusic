import { useState, useCallback } from 'react';
import { useCompositionStore } from '../../store/useCompositionStore';
import { audioExportService } from '../../services/AudioExportService';
import { projectFileService } from '../../services/ProjectFileService';
import { renderOffline } from '../../engine/Renderer';

interface ExportDialogProps {
  onClose: () => void;
}

type ExportFormat = 'wav' | 'mp3' | 'project';

export default function ExportDialog({ onClose }: ExportDialogProps) {
  const { name, bpm, tracks } = useCompositionStore();
  const [format, setFormat] = useState<ExportFormat>('wav');
  const [filename, setFilename] = useState(name || 'composition');
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleExport = useCallback(async () => {
    setExporting(true);
    setError('');
    setProgress(0);
    try {
      if (format === 'project') {
        const json = projectFileService.exportProject({ name, bpm, tracks });
        projectFileService.downloadFile(json, `${filename}.dusic.json`);
      } else {
        const buffer = await renderOffline({
          tracks,
          bpm,
          onProgress: setProgress,
        });

        const blob = format === 'wav'
          ? audioExportService.exportWav(buffer)
          : audioExportService.exportMp3(buffer);

        audioExportService.downloadBlob(blob, `${filename}.${format}`);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed.');
    } finally {
      setExporting(false);
    }
  }, [format, filename, name, bpm, tracks, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose} role="dialog">
      <div className="w-full max-w-md rounded-t-lg bg-white p-4 shadow-xl sm:rounded-lg sm:p-6 dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold">Export</h3>
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Filename</label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Format</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {(['wav', 'mp3', 'project'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`rounded px-3 py-2 text-sm font-medium sm:py-1.5 ${
                    format === f
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
                >
                  {f === 'project' ? 'Project (.dusic.json)' : f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          {exporting && format !== 'project' && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Rendering...</span>
                <span>{Math.round(progress * 100)}%</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 sm:px-3 sm:py-1.5 dark:text-gray-400 dark:hover:bg-gray-800">
            Cancel
          </button>
          <button onClick={handleExport} disabled={exporting || !filename.trim()}
            className="rounded bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 sm:px-3 sm:py-1.5">
            {exporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
}
