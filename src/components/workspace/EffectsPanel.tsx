import { useState } from 'react';
import { useCompositionStore } from '../../store/useCompositionStore';
import type { TrackEffects } from '../../types/composition';

interface EffectsPanelProps {
  trackId: string;
  effects: TrackEffects;
}

const effectMeta: Record<string, { icon: React.ReactNode; color: string; activeColor: string }> = {
  reverb: {
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" d="M3 10c2-3 3 3 5 0s3 3 5 0s3 3 4 0" />
        <path strokeLinecap="round" d="M3 10c2-3 3 3 5 0s3 3 5 0s3 3 4 0" opacity="0.3" transform="translate(0,3)" />
      </svg>
    ),
    color: 'text-blue-500',
    activeColor: 'bg-blue-50 ring-blue-200 dark:bg-blue-950/40 dark:ring-blue-800',
  },
  delay: {
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="7" cy="10" r="3" />
        <circle cx="13" cy="10" r="3" opacity="0.4" />
      </svg>
    ),
    color: 'text-violet-500',
    activeColor: 'bg-violet-50 ring-violet-200 dark:bg-violet-950/40 dark:ring-violet-800',
  },
  eq: {
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" d="M4 14V6M8 16V4M12 13V7M16 15V5" />
      </svg>
    ),
    color: 'text-emerald-500',
    activeColor: 'bg-emerald-50 ring-emerald-200 dark:bg-emerald-950/40 dark:ring-emerald-800',
  },
  envelope: {
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 16L6 4l4 8 4 -4 4 12" />
      </svg>
    ),
    color: 'text-amber-500',
    activeColor: 'bg-amber-50 ring-amber-200 dark:bg-amber-950/40 dark:ring-amber-800',
  },
};

export default function EffectsPanel({ trackId, effects }: EffectsPanelProps) {
  const { updateTrack } = useCompositionStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  const update = (patch: Partial<TrackEffects>) => {
    updateTrack(trackId, { effects: { ...effects, ...patch } });
  };

  return (
    <div className="border-t border-gray-200 bg-gradient-to-b from-white to-gray-50 dark:border-gray-800 dark:from-gray-950 dark:to-gray-900">
      <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-2 dark:border-gray-800">
        <svg className="h-4 w-4 text-indigo-500" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" d="M3 10c2-4 4 4 7 0s5 4 7 0" />
        </svg>
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Effects</span>
        <span className="text-[10px] text-gray-400 dark:text-gray-500">Track FX chain</span>
      </div>

      <div className="grid grid-cols-2 gap-px bg-gray-100 sm:grid-cols-4 dark:bg-gray-800">
        {/* Reverb */}
        <EffectSection
          title="Reverb"
          effectKey="reverb"
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
          effectKey="delay"
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
          effectKey="eq"
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
          effectKey="envelope"
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
  effectKey,
  enabled,
  isExpanded,
  onToggle,
  onExpand,
  children,
}: {
  title: string;
  effectKey: string;
  enabled: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onExpand: () => void;
  children: React.ReactNode;
}) {
  const meta = effectMeta[effectKey];

  return (
    <div className={`bg-white transition-all dark:bg-gray-950 ${
      enabled && isExpanded ? `ring-1 ${meta?.activeColor ?? ''}` : ''
    }`}>
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          onClick={onToggle}
          className={`flex h-4 w-4 items-center justify-center rounded transition-colors ${
            enabled
              ? 'bg-indigo-500 text-white shadow-sm'
              : 'border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800'
          }`}
          title={enabled ? 'Disable' : 'Enable'}
        >
          {enabled && (
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 6l3 3 5-5" />
            </svg>
          )}
        </button>
        <button onClick={onExpand} className="flex flex-1 items-center gap-1.5">
          {meta?.icon && <span className={enabled ? meta.color : 'text-gray-400 dark:text-gray-600'}>{meta.icon}</span>}
          <span className={`text-xs font-semibold ${enabled ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-600'}`}>
            {title}
          </span>
          <svg
            className={`ml-auto h-3.5 w-3.5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      {isExpanded && <div className="space-y-1.5 px-3 pb-3">{children}</div>}
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
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex items-center gap-2">
      <span className="w-14 text-[10px] font-medium text-gray-500 dark:text-gray-400">{label}</span>
      <div className="relative flex-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-indigo-500 dark:bg-gray-700"
        />
        <div
          className="pointer-events-none absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full bg-indigo-400/30"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 text-right text-[10px] tabular-nums font-medium text-gray-500 dark:text-gray-400">
        {value.toFixed(step < 1 ? 2 : 1)}
      </span>
    </div>
  );
}
