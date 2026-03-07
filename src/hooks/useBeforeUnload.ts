import { useEffect } from 'react';
import { useCompositionStore } from '../store/useCompositionStore';

export function useBeforeUnload() {
  const isDirty = useCompositionStore((s) => s.isDirty);

  useEffect(() => {
    if (!isDirty) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);
}
