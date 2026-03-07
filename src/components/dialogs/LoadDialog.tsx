import { useState, useEffect } from 'react';
import { useCompositionStore } from '../../store/useCompositionStore';
import { storageService } from '../../services/StorageService';
import type { Track } from '../../types/composition';

interface SavedItem {
  id: string;
  name: string;
  bpm: number;
  tracks: Track[];
  savedAt: string;
}

interface LoadDialogProps {
  onClose: () => void;
}

export default function LoadDialog({ onClose }: LoadDialogProps) {
  const { loadComposition } = useCompositionStore();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storageService.listAll().then((all) => {
      setItems(all as SavedItem[]);
      setLoading(false);
    });
  }, []);

  const handleLoad = (item: SavedItem) => {
    loadComposition({ name: item.name, bpm: item.bpm, tracks: item.tracks });
    onClose();
  };

  const handleDelete = async (id: string) => {
    await storageService.delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose} role="dialog">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold">Load Composition</h3>
        <div className="mt-4 max-h-80 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-gray-500">No saved compositions.</p>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded border border-gray-200 p-3 dark:border-gray-700">
                  <div>
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500">
                      {item.bpm} BPM &middot; {item.tracks.length} tracks &middot;{' '}
                      {new Date(item.savedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleLoad(item)}
                      className="rounded bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-500">
                      Load
                    </button>
                    <button onClick={() => handleDelete(item.id)}
                      className="rounded px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
