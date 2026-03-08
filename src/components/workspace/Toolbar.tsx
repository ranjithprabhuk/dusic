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
    <>
      {/* History group */}
      <div className="flex items-center gap-0.5 rounded-md bg-gray-100 p-0.5 dark:bg-gray-800">
        <ToolButton icon={<UndoIcon />} label="Undo" disabled={!canUndo()} onClick={undo} title="Undo (Ctrl+Z)" />
        <ToolButton icon={<RedoIcon />} label="Redo" disabled={!canRedo()} onClick={redo} title="Redo (Ctrl+Shift+Z)" />
      </div>

      {/* Edit group */}
      <div className="flex items-center gap-0.5 rounded-md bg-gray-100 p-0.5 dark:bg-gray-800">
        <ToolButton icon={<TrimIcon />} label="Trim" disabled={!hasSelection} onClick={handleTrim} title="Trim segment start to playhead" />
        <ToolButton icon={<ScissorsIcon />} label="Split" disabled={!hasSelection} onClick={handleCut} title="Split segment at playhead" />
        <ToolButton icon={<MergeIcon />} label="Merge" disabled={!hasSelection} onClick={handleMerge} title="Merge with next segment" />
      </div>

      {/* Clipboard group */}
      <div className="flex items-center gap-0.5 rounded-md bg-gray-100 p-0.5 dark:bg-gray-800">
        <ToolButton icon={<CopyIcon />} label="Copy" disabled={!hasSelection} onClick={handleCopy} title="Copy selected segment (Ctrl+C)" />
        <ToolButton icon={<PasteIcon />} label="Paste" disabled={!clipboard} onClick={handlePaste} title="Paste segment at playhead (Ctrl+V)" />
      </div>

      {/* Delete */}
      <ToolButton icon={<TrashIcon />} label="Delete" disabled={!hasSelection} onClick={handleDelete} title="Delete selected segment" danger />
    </>
  );
}

function ToolButton({
  icon,
  label,
  disabled,
  onClick,
  title,
  danger,
}: {
  icon: React.ReactNode;
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
      className={`flex items-center gap-1 rounded px-2 py-1.5 text-xs font-medium transition-colors sm:py-1 ${
        disabled
          ? 'cursor-not-allowed text-gray-300 dark:text-gray-700'
          : danger
            ? 'text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900/20'
            : 'text-gray-600 hover:bg-white hover:text-gray-800 hover:shadow-sm dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
      }`}
    >
      {icon}
      <span className="hidden lg:inline">{label}</span>
    </button>
  );
}

// --- Inline SVG icons (14x14) ---

function UndoIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h10a4 4 0 110 8H9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3L3 7l4 4" />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 7H7a4 4 0 100 8h4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 3l4 4-4 4" />
    </svg>
  );
}

function TrimIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" d="M4 4v12M8 6h9v8H8z" />
    </svg>
  );
}

function ScissorsIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="6" cy="14" r="2.5" />
      <path strokeLinecap="round" d="M8.2 7.5L16 16M8.2 12.5L16 4" />
    </svg>
  );
}

function MergeIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4l4 4-4 4M14 4l-4 4 4 4" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <path d="M13 7V4.5A1.5 1.5 0 0011.5 3h-8A1.5 1.5 0 002 4.5v8A1.5 1.5 0 003.5 14H7" />
    </svg>
  );
}

function PasteIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="5" width="12" height="12" rx="1.5" />
      <path d="M7 5V4a1 1 0 011-1h4a1 1 0 011 1v1" />
      <path strokeLinecap="round" d="M8 10h4M8 13h4" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" d="M4 6h12M8 6V4h4v2M6 6v10a1 1 0 001 1h6a1 1 0 001-1V6" />
      <path strokeLinecap="round" d="M9 9v5M11 9v5" />
    </svg>
  );
}
