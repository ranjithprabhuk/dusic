#!/usr/bin/env node
// Generates simple synthetic percussion WAV samples for Dholak and Tabla
import { writeFileSync, mkdirSync } from 'fs';

const SAMPLE_RATE = 44100;

function createWav(samples) {
  const numSamples = samples.length;
  const byteRate = SAMPLE_RATE * 2;
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const val = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(val * 32767), 44 + i * 2);
  }
  return buffer;
}

function generatePercussion(freq, decay, noiseAmount, duration = 0.3) {
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float64Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * decay);
    const tone = Math.sin(2 * Math.PI * freq * t * Math.exp(-t * 5));
    const noise = (Math.random() * 2 - 1) * noiseAmount;
    samples[i] = env * (tone * (1 - noiseAmount) + noise) * 0.8;
  }
  return samples;
}

const dholakSounds = [
  { name: 'dha', freq: 80, decay: 8, noise: 0.2 },
  { name: 'dhin', freq: 100, decay: 10, noise: 0.15 },
  { name: 'ta', freq: 200, decay: 15, noise: 0.3 },
  { name: 'tin', freq: 250, decay: 18, noise: 0.25 },
  { name: 'ge', freq: 60, decay: 6, noise: 0.3 },
  { name: 'ke', freq: 300, decay: 20, noise: 0.4 },
  { name: 'na', freq: 150, decay: 12, noise: 0.2 },
  { name: 'tun', freq: 120, decay: 7, noise: 0.1 },
  { name: 'kat', freq: 350, decay: 25, noise: 0.5 },
  { name: 'dhi', freq: 90, decay: 9, noise: 0.15 },
  { name: 'tit', freq: 280, decay: 22, noise: 0.35 },
  { name: 'ghe', freq: 70, decay: 5, noise: 0.25 },
];

const tablaSounds = [
  { name: 'na', freq: 250, decay: 15, noise: 0.2 },
  { name: 'tin', freq: 300, decay: 18, noise: 0.15 },
  { name: 'tu', freq: 180, decay: 10, noise: 0.1 },
  { name: 'ta', freq: 220, decay: 14, noise: 0.25 },
  { name: 'dha', freq: 100, decay: 6, noise: 0.2 },
  { name: 'dhin', freq: 120, decay: 8, noise: 0.15 },
  { name: 'ge', freq: 80, decay: 5, noise: 0.3 },
  { name: 'ke', freq: 350, decay: 22, noise: 0.4 },
  { name: 'tit', freq: 320, decay: 20, noise: 0.3 },
  { name: 'ri', freq: 400, decay: 25, noise: 0.2 },
  { name: 'te', freq: 270, decay: 16, noise: 0.25 },
  { name: 'kat', freq: 380, decay: 28, noise: 0.45 },
];

mkdirSync('public/samples/dholak', { recursive: true });
mkdirSync('public/samples/tabla', { recursive: true });

for (const s of dholakSounds) {
  const samples = generatePercussion(s.freq, s.decay, s.noise);
  writeFileSync(`public/samples/dholak/${s.name}.wav`, createWav(Array.from(samples)));
}

for (const s of tablaSounds) {
  const samples = generatePercussion(s.freq, s.decay, s.noise);
  writeFileSync(`public/samples/tabla/${s.name}.wav`, createWav(Array.from(samples)));
}

console.log(`Generated ${dholakSounds.length} dholak + ${tablaSounds.length} tabla samples`);
