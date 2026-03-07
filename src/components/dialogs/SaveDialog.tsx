import { useState } from 'react';
import { useCompositionStore } from '../../store/useCompositionStore';
import { storageService } from '../../services/StorageService';

interface SaveDialogProps {
  onClose: () => void;
}

export default function SaveDialog({ onClose }: SaveDialogProps) {
  const { name, setName, bpm, tracks, setDirty } = useCompositionStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await storageService.save({ name, bpm, tracks });
      setDirty(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogOverlay onClose={onClose}>
      <h3 className="text-lg font-semibold">Save Composition</h3>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          autoFocus
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onClose} className="rounded px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 sm:px-3 sm:py-1.5 dark:text-gray-400 dark:hover:bg-gray-800">
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving || !name.trim()}
          className="rounded bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 sm:px-3 sm:py-1.5">
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </DialogOverlay>
  );
}

function DialogOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose} role="dialog">
      <div className="w-full max-w-md rounded-t-lg bg-white p-4 shadow-xl sm:rounded-lg sm:p-6 dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
