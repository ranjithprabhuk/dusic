import { useCallback, useRef, useEffect } from 'react';
import { useCompositionStore } from '../../store/useCompositionStore';
import { useTransportStore } from '../../store/useTransportStore';
import type { Segment, NoteEvent } from '../../types/composition';

const PIXELS_PER_BEAT = 40;
const NOTE_HEIGHT = 12;
const MIN_PITCH = 36; // C2
const MAX_PITCH = 96; // C7
const TOTAL_NOTES = MAX_PITCH - MIN_PITCH;
const RESIZE_HANDLE_PX = 6;

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function pitchToName(pitch: number): string {
  const octave = Math.floor(pitch / 12) - 1;
  const note = NOTE_NAMES[pitch % 12];
  return `${note}${octave}`;
}

interface PianoRollProps {
  trackId: string;
  segment: Segment;
  onClose: () => void;
}

type DragMode = 'move' | 'resize';

export default function PianoRoll({ trackId, segment, onClose }: PianoRollProps) {
  const { updateSegment } = useCompositionStore();
  const { gridSnap } = useTransportStore();

  const totalWidth = segment.durationBeats * PIXELS_PER_BEAT;
  const totalHeight = TOTAL_NOTES * NOTE_HEIGHT;

  const dragRef = useRef<{
    mode: DragMode;
    noteIndex: number;
    startX: number;
    startY: number;
    originalNote: NoteEvent;
  } | null>(null);

  const snapBeat = useCallback(
    (beat: number) => {
      if (!gridSnap) return beat;
      return Math.round(beat * 4) / 4;
    },
    [gridSnap]
  );

  const handleGridClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Don't add note if we just finished dragging
      if (dragRef.current) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const beat = snapBeat(x / PIXELS_PER_BEAT);
      const pitch = MAX_PITCH - Math.floor(y / NOTE_HEIGHT);

      if (pitch < MIN_PITCH || pitch > MAX_PITCH) return;
      if (beat < 0 || beat >= segment.durationBeats) return;

      const newNote: NoteEvent = {
        pitch,
        startBeat: beat,
        durationBeats: 0.25,
        velocity: 100,
      };

      const notes = [...(segment.notes ?? []), newNote];
      updateSegment(trackId, segment.id, { notes });
    },
    [trackId, segment, updateSegment, snapBeat]
  );

  const handleDeleteNote = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.stopPropagation();
      const notes = (segment.notes ?? []).filter((_, i) => i !== index);
      updateSegment(trackId, segment.id, { notes });
    },
    [trackId, segment, updateSegment]
  );

  const handleNoteMouseDown = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.stopPropagation();
      if (e.button === 2) {
        // Right-click deletes
        handleDeleteNote(index, e);
        return;
      }
      if (e.button !== 0) return;

      const note = (segment.notes ?? [])[index];
      if (!note) return;

      // Detect if click is on the right edge (resize) or body (move)
      const noteEl = e.currentTarget as HTMLElement;
      const rect = noteEl.getBoundingClientRect();
      const xInNote = e.clientX - rect.left;
      const isResize = xInNote >= rect.width - RESIZE_HANDLE_PX;

      dragRef.current = {
        mode: isResize ? 'resize' : 'move',
        noteIndex: index,
        startX: e.clientX,
        startY: e.clientY,
        originalNote: { ...note },
      };
    },
    [segment.notes, handleDeleteNote]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const { mode, originalNote, startX, startY, noteIndex } = dragRef.current;
      const notes = [...(segment.notes ?? [])];
      const note = notes[noteIndex];
      if (!note) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (mode === 'move') {
        const deltaBeat = dx / PIXELS_PER_BEAT;
        const deltaPitch = -Math.round(dy / NOTE_HEIGHT);
        const newBeat = snapBeat(Math.max(0, originalNote.startBeat + deltaBeat));
        const newPitch = Math.min(MAX_PITCH, Math.max(MIN_PITCH, originalNote.pitch + deltaPitch));
        notes[noteIndex] = { ...note, startBeat: newBeat, pitch: newPitch };
      } else {
        // resize
        const deltaBeat = dx / PIXELS_PER_BEAT;
        const newDuration = snapBeat(Math.max(0.0625, originalNote.durationBeats + deltaBeat));
        notes[noteIndex] = { ...note, durationBeats: newDuration };
      }

      updateSegment(trackId, segment.id, { notes });
    };

    const handleMouseUp = () => {
      dragRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [trackId, segment, updateSegment, snapBeat]);

  return (
    <div className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 dark:border-gray-800">
        <span className="text-sm font-medium">Piano Roll</span>
        <button
          onClick={onClose}
          className="rounded px-2 py-0.5 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Close
        </button>
      </div>

      <div className="flex overflow-auto" style={{ maxHeight: 300 }}>
        {/* Pitch labels */}
        <div className="sticky left-0 z-10 w-12 shrink-0 bg-gray-50 dark:bg-gray-900">
          {Array.from({ length: TOTAL_NOTES }, (_, i) => {
            const pitch = MAX_PITCH - i;
            const isBlack = [1, 3, 6, 8, 10].includes(pitch % 12);
            return (
              <div
                key={pitch}
                className={`flex items-center justify-end pr-1 text-[9px] ${
                  isBlack ? 'bg-gray-200 dark:bg-gray-800' : ''
                }`}
                style={{ height: NOTE_HEIGHT }}
              >
                {pitch % 12 === 0 ? pitchToName(pitch) : ''}
              </div>
            );
          })}
        </div>

        {/* Grid */}
        <div
          className="relative cursor-crosshair"
          style={{ width: totalWidth, height: totalHeight }}
          onClick={handleGridClick}
        >
          {/* Grid lines */}
          {Array.from({ length: TOTAL_NOTES }, (_, i) => {
            const pitch = MAX_PITCH - i;
            const isBlack = [1, 3, 6, 8, 10].includes(pitch % 12);
            return (
              <div
                key={i}
                className={`absolute left-0 right-0 border-b ${
                  isBlack
                    ? 'border-gray-200 bg-gray-100/50 dark:border-gray-800 dark:bg-gray-800/30'
                    : 'border-gray-100 dark:border-gray-800/50'
                }`}
                style={{ top: i * NOTE_HEIGHT, height: NOTE_HEIGHT }}
              />
            );
          })}

          {/* Beat lines */}
          {Array.from({ length: Math.ceil(segment.durationBeats) }, (_, i) => (
            <div
              key={i}
              className={`absolute top-0 bottom-0 ${
                i % 4 === 0
                  ? 'border-l border-gray-300 dark:border-gray-700'
                  : 'border-l border-gray-200/50 dark:border-gray-800/50'
              }`}
              style={{ left: i * PIXELS_PER_BEAT }}
            />
          ))}

          {/* Notes */}
          {(segment.notes ?? []).map((note, idx) => {
            const noteWidth = Math.max(note.durationBeats * PIXELS_PER_BEAT, 4);
            return (
              <div
                key={idx}
                onMouseDown={(e) => handleNoteMouseDown(idx, e)}
                onContextMenu={(e) => e.preventDefault()}
                className="absolute cursor-grab rounded-sm bg-indigo-500 hover:bg-indigo-400 active:cursor-grabbing dark:bg-indigo-600 dark:hover:bg-indigo-500"
                style={{
                  left: note.startBeat * PIXELS_PER_BEAT,
                  top: (MAX_PITCH - note.pitch) * NOTE_HEIGHT,
                  width: noteWidth,
                  height: NOTE_HEIGHT - 1,
                  opacity: note.velocity / 127,
                }}
                title={`${pitchToName(note.pitch)} — drag to move, drag right edge to resize, right-click to delete`}
              >
                {/* Resize handle */}
                <div
                  className="absolute top-0 right-0 bottom-0 cursor-e-resize"
                  style={{ width: RESIZE_HANDLE_PX }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
