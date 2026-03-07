import { useEffect, useRef } from 'react';
import { useInstrumentStore } from '../store/useInstrumentStore';
import { useTransportStore } from '../store/useTransportStore';
import { useCompositionStore } from '../store/useCompositionStore';
import { instrumentEngine } from '../engine/InstrumentEngine';
import { audioEngine } from '../engine/AudioEngine';
import type { NoteEvent } from '../types/composition';

const FOCUS_IGNORE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

function shouldIgnoreFocus(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  if (FOCUS_IGNORE_TAGS.has(el.tagName)) return true;
  if (el.getAttribute('contenteditable') === 'true') return true;
  if (el.closest('[role="dialog"]')) return true;
  return false;
}

export function useKeyboardMapping() {
  const heldKeys = useRef(new Set<string>());
  const noteStartBeats = useRef(new Map<string, number>());

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (shouldIgnoreFocus()) return;

      const key = e.key.toLowerCase();

      // Prevent duplicate triggers on key hold
      if (heldKeys.current.has(key)) return;

      const { selectedInstrumentId, addPressedKey } = useInstrumentStore.getState();
      const mapping = instrumentEngine.getMapping(selectedInstrumentId, key);
      if (!mapping) return;

      // Resume audio context and preload samples on first interaction
      await audioEngine.ensureResumed();
      await instrumentEngine.init();

      heldKeys.current.add(key);
      addPressedKey(key);
      instrumentEngine.playNote(selectedInstrumentId, key);

      // Recording: track note start
      const transport = useTransportStore.getState();
      if (transport.isRecording) {
        noteStartBeats.current.set(key, transport.playheadPosition);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (!heldKeys.current.has(key)) return;

      heldKeys.current.delete(key);

      const { selectedInstrumentId, removePressedKey } = useInstrumentStore.getState();
      removePressedKey(key);
      instrumentEngine.stopNote(selectedInstrumentId, key);

      // Recording: capture the note event
      const transport = useTransportStore.getState();
      if (transport.isRecording && noteStartBeats.current.has(key)) {
        const startBeat = noteStartBeats.current.get(key)!;
        noteStartBeats.current.delete(key);

        const mapping = instrumentEngine.getMapping(selectedInstrumentId, key);
        if (!mapping) return;

        const durationBeats = Math.max(0.25, transport.playheadPosition - startBeat);
        const gridSnap = transport.gridSnap;
        const snappedStart = gridSnap ? Math.round(startBeat * 4) / 4 : startBeat;
        const snappedDuration = gridSnap ? Math.round(durationBeats * 4) / 4 : durationBeats;

        const noteEvent: NoteEvent = {
          pitch: mapping.pitch ?? 60,
          startBeat: snappedStart,
          durationBeats: Math.max(0.25, snappedDuration),
          velocity: 100,
        };

        // Add to the active track's first segment (or create one)
        const composition = useCompositionStore.getState();
        const activeTrack = composition.tracks[0]; // default to first track
        if (activeTrack) {
          const seg = activeTrack.segments[activeTrack.segments.length - 1];
          if (seg && seg.type === 'notes') {
            composition.updateSegment(activeTrack.id, seg.id, {
              notes: [...(seg.notes ?? []), noteEvent],
              durationBeats: Math.max(seg.durationBeats, noteEvent.startBeat + noteEvent.durationBeats),
            });
          } else {
            composition.addSegment(activeTrack.id, {
              id: `seg-${Date.now()}`,
              type: 'notes',
              startBeat: 0,
              durationBeats: noteEvent.startBeat + noteEvent.durationBeats,
              notes: [noteEvent],
            });
          }
        }
      }
    };

    const handleBlur = () => {
      // Clean up when window loses focus
      const { selectedInstrumentId, clearPressedKeys } = useInstrumentStore.getState();
      for (const key of heldKeys.current) {
        instrumentEngine.stopNote(selectedInstrumentId, key);
      }
      heldKeys.current.clear();
      noteStartBeats.current.clear();
      clearPressedKeys();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      handleBlur();
    };
  }, []);
}
