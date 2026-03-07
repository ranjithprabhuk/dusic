import { useCallback } from 'react';
import { useCompositionStore } from '../../store/useCompositionStore';
import { useTransportStore } from '../../store/useTransportStore';
import { pushUndoSnapshot, undo, redo, canUndo, canRedo } from '../../hooks/useUndoRedo';
import type { Segment } from '../../types/composition';

// Module-level clipboard for copy/paste
let clipboard: { segment: Segment; trackId: string } | null = null;

interface ToolbarProps {
  selectedTrackId?: string;
  selectedSegmentId?: string;
}

export default function Toolbar({ selectedTrackId, selectedSegmentId }: ToolbarProps) {
  const { tracks, updateSegment, removeSegment, addSegment } = useCompositionStore();
  const { playheadPosition } = useTransportStore();

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId);
  const selectedSegment = selectedTrack?.segments.find((s) => s.id === selectedSegmentId);
  const hasSelection = !!selectedSegment && !!selectedTrackId;

  const handleTrim = useCallback(() => {
    if (!hasSelection || !selectedTrackId || !selectedSegment) return;
    pushUndoSnapshot();
    const newStart = Math.max(selectedSegment.startBeat, playheadPosition);
    const newEnd = selectedSegment.startBeat + selectedSegment.durationBeats;
    if (newStart >= newEnd) return;
    updateSegment(selectedTrackId, selectedSegment.id, {
      startBeat: newStart,
      durationBeats: newEnd - newStart,
    });
  }, [hasSelection, selectedTrackId, selectedSegment, playheadPosition, updateSegment]);

  const handleCut = useCallback(() => {
    if (!hasSelection || !selectedTrackId || !selectedSegment) return;
    pushUndoSnapshot();
    const cutPoint = playheadPosition;
    const segStart = selectedSegment.startBeat;
    const segEnd = segStart + selectedSegment.durationBeats;

    if (cutPoint <= segStart || cutPoint >= segEnd) return;

    // Shorten the original segment
    updateSegment(selectedTrackId, selectedSegment.id, {
      durationBeats: cutPoint - segStart,
      notes: selectedSegment.notes?.filter((n) => n.startBeat < cutPoint - segStart),
    });

    // Create second half
    const newSeg: Segment = {
      id: `seg-${Date.now()}`,
      type: selectedSegment.type,
      startBeat: cutPoint,
      durationBeats: segEnd - cutPoint,
      notes: selectedSegment.notes
        ?.filter((n) => n.startBeat >= cutPoint - segStart)
        .map((n) => ({ ...n, startBeat: n.startBeat - (cutPoint - segStart) })),
    };
    addSegment(selectedTrackId, newSeg);
  }, [hasSelection, selectedTrackId, selectedSegment, playheadPosition, updateSegment, addSegment]);

  const handleMerge = useCallback(() => {
    if (!selectedTrackId || !selectedTrack || !selectedSegment) return;
    pushUndoSnapshot();
    // Find the next adjacent segment
    const sorted = [...selectedTrack.segments].sort((a, b) => a.startBeat - b.startBeat);
    const idx = sorted.findIndex((s) => s.id === selectedSegment.id);
    if (idx < 0 || idx >= sorted.length - 1) return;

    const next = sorted[idx + 1];
    const mergedEnd = next.startBeat + next.durationBeats;

    updateSegment(selectedTrackId, selectedSegment.id, {
      durationBeats: mergedEnd - selectedSegment.startBeat,
      notes: [
        ...(selectedSegment.notes ?? []),
        ...(next.notes ?? []).map((n) => ({
          ...n,
          startBeat: n.startBeat + (next.startBeat - selectedSegment.startBeat),
        })),
      ],
    });
    removeSegment(selectedTrackId, next.id);
  }, [selectedTrackId, selectedTrack, selectedSegment, updateSegment, removeSegment]);

  const handleCopy = useCallback(() => {
    if (!hasSelection || !selectedTrackId || !selectedSegment) return;
    clipboard = { segment: { ...selectedSegment }, trackId: selectedTrackId };
  }, [hasSelection, selectedTrackId, selectedSegment]);

  const handlePaste = useCallback(() => {
    if (!clipboard) return;
    pushUndoSnapshot();
    const target = selectedTrackId ?? clipboard.trackId;
    const newSeg: Segment = {
      ...clipboard.segment,
      id: `seg-${Date.now()}`,
      startBeat: playheadPosition,
    };
    addSegment(target, newSeg);
  }, [selectedTrackId, playheadPosition, addSegment]);

  const handleDelete = useCallback(() => {
    if (!hasSelection || !selectedTrackId || !selectedSegment) return;
    pushUndoSnapshot();
    removeSegment(selectedTrackId, selectedSegment.id);
  }, [hasSelection, selectedTrackId, selectedSegment, removeSegment]);

  return (
    <div className="flex items-center gap-1 border-b border-gray-200 bg-gray-50 px-4 py-1.5 dark:border-gray-800 dark:bg-gray-900/50">
      <span className="mr-2 text-xs font-medium text-gray-500 dark:text-gray-400">Edit</span>
      <ToolButton label="Undo" disabled={!canUndo()} onClick={undo}
        title="Undo (Ctrl+Z)" />
      <ToolButton label="Redo" disabled={!canRedo()} onClick={redo}
        title="Redo (Ctrl+Shift+Z)" />
      <div className="mx-1 h-5 w-px bg-gray-200 dark:bg-gray-700" />
      <ToolButton label="Trim" disabled={!hasSelection} onClick={handleTrim}
        title="Trim segment start to playhead" />
      <ToolButton label="Cut" disabled={!hasSelection} onClick={handleCut}
        title="Split segment at playhead" />
      <ToolButton label="Merge" disabled={!hasSelection} onClick={handleMerge}
        title="Merge with next segment" />
      <div className="mx-1 h-5 w-px bg-gray-200 dark:bg-gray-700" />
      <ToolButton label="Copy" disabled={!hasSelection} onClick={handleCopy}
        title="Copy selected segment (Ctrl+C)" />
      <ToolButton label="Paste" disabled={!clipboard} onClick={handlePaste}
        title="Paste segment at playhead (Ctrl+V)" />
      <div className="mx-1 h-5 w-px bg-gray-200 dark:bg-gray-700" />
      <ToolButton label="Delete" disabled={!hasSelection} onClick={handleDelete}
        title="Delete selected segment" danger />
    </div>
  );
}

function ToolButton({
  label,
  disabled,
  onClick,
  title,
  danger,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
        disabled
          ? 'cursor-not-allowed text-gray-300 dark:text-gray-700'
          : danger
            ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
            : 'text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800'
      }`}
    >
      {label}
    </button>
  );
}
