import { useState } from 'react';
import { useCompositionStore } from '../../store/useCompositionStore';
import type { TrackEffects } from '../../types/composition';

interface EffectsPanelProps {
  trackId: string;
  effects: TrackEffects;
}

export default function EffectsPanel({ trackId, effects }: EffectsPanelProps) {
  const { updateTrack } = useCompositionStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  const update = (patch: Partial<TrackEffects>) => {
    updateTrack(trackId, { effects: { ...effects, ...patch } });
  };

  return (
    <div className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-2 dark:border-gray-800">
        <span className="text-sm font-medium">Effects</span>
      </div>

      <div className="grid grid-cols-2 gap-px bg-gray-200 sm:grid-cols-4 dark:bg-gray-800">
        {/* Reverb */}
        <EffectSection
          title="Reverb"
          enabled={effects.reverb.enabled}
          isExpanded={expanded === 'reverb'}
          onToggle={() => update({ reverb: { ...effects.reverb, enabled: !effects.reverb.enabled } })}
          onExpand={() => setExpanded(expanded === 'reverb' ? null : 'reverb')}
        >
          <Slider label="Decay" value={effects.reverb.decay} min={0.1} max={5} step={0.1}
            onChange={(v) => update({ reverb: { ...effects.reverb, decay: v } })} />
          <Slider label="Mix" value={effects.reverb.mix} min={0} max={1} step={0.01}
            onChange={(v) => update({ reverb: { ...effects.reverb, mix: v } })} />
        </EffectSection>

        {/* Delay */}
        <EffectSection
          title="Delay"
          enabled={effects.delay.enabled}
          isExpanded={expanded === 'delay'}
          onToggle={() => update({ delay: { ...effects.delay, enabled: !effects.delay.enabled } })}
          onExpand={() => setExpanded(expanded === 'delay' ? null : 'delay')}
        >
          <Slider label="Time" value={effects.delay.time} min={0.01} max={2} step={0.01}
            onChange={(v) => update({ delay: { ...effects.delay, time: v } })} />
          <Slider label="Feedback" value={effects.delay.feedback} min={0} max={0.9} step={0.01}
            onChange={(v) => update({ delay: { ...effects.delay, feedback: v } })} />
          <Slider label="Mix" value={effects.delay.mix} min={0} max={1} step={0.01}
            onChange={(v) => update({ delay: { ...effects.delay, mix: v } })} />
        </EffectSection>

        {/* EQ */}
        <EffectSection
          title="EQ"
          enabled={effects.eq.enabled}
          isExpanded={expanded === 'eq'}
          onToggle={() => update({ eq: { ...effects.eq, enabled: !effects.eq.enabled } })}
          onExpand={() => setExpanded(expanded === 'eq' ? null : 'eq')}
        >
          <Slider label="Low" value={effects.eq.low} min={-12} max={12} step={0.5}
            onChange={(v) => update({ eq: { ...effects.eq, low: v } })} />
          <Slider label="Mid" value={effects.eq.mid} min={-12} max={12} step={0.5}
            onChange={(v) => update({ eq: { ...effects.eq, mid: v } })} />
          <Slider label="High" value={effects.eq.high} min={-12} max={12} step={0.5}
            onChange={(v) => update({ eq: { ...effects.eq, high: v } })} />
        </EffectSection>

        {/* Envelope */}
        <EffectSection
          title="Envelope"
          enabled={effects.envelope.enabled}
          isExpanded={expanded === 'envelope'}
          onToggle={() => update({ envelope: { ...effects.envelope, enabled: !effects.envelope.enabled } })}
          onExpand={() => setExpanded(expanded === 'envelope' ? null : 'envelope')}
        >
          <Slider label="Attack" value={effects.envelope.attack} min={0} max={2} step={0.01}
            onChange={(v) => update({ envelope: { ...effects.envelope, attack: v } })} />
          <Slider label="Decay" value={effects.envelope.decay} min={0} max={2} step={0.01}
            onChange={(v) => update({ envelope: { ...effects.envelope, decay: v } })} />
          <Slider label="Sustain" value={effects.envelope.sustain} min={0} max={1} step={0.01}
            onChange={(v) => update({ envelope: { ...effects.envelope, sustain: v } })} />
          <Slider label="Release" value={effects.envelope.release} min={0} max={5} step={0.01}
            onChange={(v) => update({ envelope: { ...effects.envelope, release: v } })} />
        </EffectSection>
      </div>
    </div>
  );
}

function EffectSection({
  title,
  enabled,
  isExpanded,
  onToggle,
  onExpand,
  children,
}: {
  title: string;
  enabled: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onExpand: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-950">
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          onClick={onToggle}
          className={`h-3.5 w-3.5 rounded-sm border transition-colors ${
            enabled
              ? 'border-indigo-500 bg-indigo-500'
              : 'border-gray-400 dark:border-gray-600'
          }`}
          title={enabled ? 'Disable' : 'Enable'}
        >
          {enabled && (
            <svg className="h-full w-full text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 6l3 3 5-5" />
            </svg>
          )}
        </button>
        <button onClick={onExpand} className="flex flex-1 items-center justify-between">
          <span className={`text-xs font-medium ${enabled ? '' : 'text-gray-400 dark:text-gray-600'}`}>
            {title}
          </span>
          <svg
            className={`h-3.5 w-3.5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      {isExpanded && <div className="space-y-2 px-3 pb-3">{children}</div>}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 text-[10px] text-gray-500 dark:text-gray-400">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 flex-1 accent-indigo-600"
      />
      <span className="w-10 text-right text-[10px] tabular-nums text-gray-500 dark:text-gray-400">
        {value.toFixed(step < 1 ? 2 : 1)}
      </span>
    </div>
  );
}
