import { audioEngine } from './AudioEngine';
import { EffectsChain } from './EffectsChain';
import type { TrackEffects } from '../types/composition';

interface TrackChannel {
  inputGain: GainNode;
  effectsChain: EffectsChain;
  outputGain: GainNode;
}

class Mixer {
  private channels = new Map<string, TrackChannel>();
  private masterGain: GainNode | null = null;

  getMasterGain(): GainNode {
    if (!this.masterGain) {
      const ctx = audioEngine.getContext();
      this.masterGain = ctx.createGain();
      this.masterGain.connect(audioEngine.getMasterOutput());
    }
    return this.masterGain;
  }

  createChannel(trackId: string): TrackChannel {
    this.removeChannel(trackId);

    const ctx = audioEngine.getContext();

    const inputGain = ctx.createGain();
    const effectsChain = new EffectsChain();
    const outputGain = ctx.createGain();

    inputGain.connect(effectsChain.getInput());
    effectsChain.getOutput().connect(outputGain);
    outputGain.connect(this.getMasterGain());

    const channel: TrackChannel = { inputGain, effectsChain, outputGain };
    this.channels.set(trackId, channel);
    return channel;
  }

  getChannelInput(trackId: string): GainNode | null {
    return this.channels.get(trackId)?.inputGain ?? null;
  }

  removeChannel(trackId: string): void {
    const channel = this.channels.get(trackId);
    if (channel) {
      channel.inputGain.disconnect();
      channel.outputGain.disconnect();
      this.channels.delete(trackId);
    }
  }

  setVolume(trackId: string, volume: number): void {
    const channel = this.channels.get(trackId);
    if (channel) {
      channel.outputGain.gain.value = volume;
    }
  }

  setMute(trackId: string, muted: boolean): void {
    const channel = this.channels.get(trackId);
    if (channel) {
      channel.outputGain.gain.value = muted ? 0 : 1;
    }
  }

  applySolo(soloTrackIds: string[]): void {
    if (soloTrackIds.length === 0) {
      // No solo — unmute all (respecting individual mute state handled by caller)
      return;
    }
    for (const [trackId, channel] of this.channels) {
      channel.outputGain.gain.value = soloTrackIds.includes(trackId) ? 1 : 0;
    }
  }

  updateEffects(trackId: string, effects: TrackEffects): void {
    const channel = this.channels.get(trackId);
    if (channel) {
      channel.effectsChain.updateEffects(effects);
    }
  }

  setMasterVolume(volume: number): void {
    this.getMasterGain().gain.value = volume;
  }

  dispose(): void {
    for (const trackId of this.channels.keys()) {
      this.removeChannel(trackId);
    }
    if (this.masterGain) {
      this.masterGain.disconnect();
      this.masterGain = null;
    }
  }
}

export const mixer = new Mixer();
