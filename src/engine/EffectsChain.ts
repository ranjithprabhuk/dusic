import { audioEngine } from './AudioEngine';
import type { TrackEffects } from '../types/composition';

export class EffectsChain {
  private input: GainNode;
  private output: GainNode;

  // Effect nodes
  private reverbConvolver: ConvolverNode | null = null;
  private reverbDry: GainNode;
  private reverbWet: GainNode;
  private reverbBypass: GainNode;

  private delayNode: DelayNode;
  private delayFeedback: GainNode;
  private delayDry: GainNode;
  private delayWet: GainNode;
  private delayBypass: GainNode;

  private eqLow: BiquadFilterNode;
  private eqMid: BiquadFilterNode;
  private eqHigh: BiquadFilterNode;
  private eqBypass: GainNode;

  private envelopeGain: GainNode;

  constructor() {
    const ctx = audioEngine.getContext();

    this.input = ctx.createGain();
    this.output = ctx.createGain();

    // Reverb chain
    this.reverbDry = ctx.createGain();
    this.reverbWet = ctx.createGain();
    this.reverbBypass = ctx.createGain();
    this.reverbWet.gain.value = 0;
    this.reverbBypass.gain.value = 1;
    this.createImpulseResponse();

    // Delay chain
    this.delayNode = ctx.createDelay(2.0);
    this.delayNode.delayTime.value = 0.3;
    this.delayFeedback = ctx.createGain();
    this.delayFeedback.gain.value = 0.4;
    this.delayDry = ctx.createGain();
    this.delayWet = ctx.createGain();
    this.delayWet.gain.value = 0;
    this.delayBypass = ctx.createGain();
    this.delayBypass.gain.value = 1;

    // Delay feedback loop
    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);

    // EQ chain
    this.eqLow = ctx.createBiquadFilter();
    this.eqLow.type = 'lowshelf';
    this.eqLow.frequency.value = 320;

    this.eqMid = ctx.createBiquadFilter();
    this.eqMid.type = 'peaking';
    this.eqMid.frequency.value = 1000;
    this.eqMid.Q.value = 0.5;

    this.eqHigh = ctx.createBiquadFilter();
    this.eqHigh.type = 'highshelf';
    this.eqHigh.frequency.value = 3200;

    this.eqBypass = ctx.createGain();
    this.eqBypass.gain.value = 1;

    // Envelope
    this.envelopeGain = ctx.createGain();

    this.connectChain();
  }

  private createImpulseResponse(): void {
    const ctx = audioEngine.getContext();
    const length = ctx.sampleRate * 2;
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.5));
      }
    }

    this.reverbConvolver = ctx.createConvolver();
    this.reverbConvolver.buffer = impulse;
  }

  private connectChain(): void {
    // Input → Reverb stage → Delay stage → EQ stage → Envelope → Output
    // Each stage has dry/wet/bypass routing

    // Reverb stage
    this.input.connect(this.reverbDry);
    if (this.reverbConvolver) {
      this.input.connect(this.reverbConvolver);
      this.reverbConvolver.connect(this.reverbWet);
    }
    this.input.connect(this.reverbBypass);

    const reverbMerge = audioEngine.getContext().createGain();
    this.reverbDry.connect(reverbMerge);
    this.reverbWet.connect(reverbMerge);
    this.reverbBypass.connect(reverbMerge);

    // Delay stage
    reverbMerge.connect(this.delayDry);
    reverbMerge.connect(this.delayNode);
    this.delayNode.connect(this.delayWet);
    reverbMerge.connect(this.delayBypass);

    const delayMerge = audioEngine.getContext().createGain();
    this.delayDry.connect(delayMerge);
    this.delayWet.connect(delayMerge);
    this.delayBypass.connect(delayMerge);

    // EQ stage
    delayMerge.connect(this.eqLow);
    this.eqLow.connect(this.eqMid);
    this.eqMid.connect(this.eqHigh);
    delayMerge.connect(this.eqBypass);

    const eqMerge = audioEngine.getContext().createGain();
    this.eqHigh.connect(eqMerge);
    this.eqBypass.connect(eqMerge);

    // Envelope → Output
    eqMerge.connect(this.envelopeGain);
    this.envelopeGain.connect(this.output);
  }

  getInput(): GainNode {
    return this.input;
  }

  getOutput(): GainNode {
    return this.output;
  }

  updateEffects(effects: TrackEffects): void {
    // Reverb
    if (effects.reverb.enabled) {
      this.reverbBypass.gain.value = 0;
      this.reverbDry.gain.value = 1 - effects.reverb.mix;
      this.reverbWet.gain.value = effects.reverb.mix;
    } else {
      this.reverbBypass.gain.value = 1;
      this.reverbDry.gain.value = 0;
      this.reverbWet.gain.value = 0;
    }

    // Delay
    if (effects.delay.enabled) {
      this.delayBypass.gain.value = 0;
      this.delayDry.gain.value = 1 - effects.delay.mix;
      this.delayWet.gain.value = effects.delay.mix;
      this.delayNode.delayTime.value = effects.delay.time;
      this.delayFeedback.gain.value = effects.delay.feedback;
    } else {
      this.delayBypass.gain.value = 1;
      this.delayDry.gain.value = 0;
      this.delayWet.gain.value = 0;
    }

    // EQ
    if (effects.eq.enabled) {
      this.eqBypass.gain.value = 0;
      this.eqLow.gain.value = effects.eq.low;
      this.eqMid.gain.value = effects.eq.mid;
      this.eqHigh.gain.value = effects.eq.high;
    } else {
      this.eqBypass.gain.value = 1;
      this.eqLow.gain.value = 0;
      this.eqMid.gain.value = 0;
      this.eqHigh.gain.value = 0;
    }
  }
}
