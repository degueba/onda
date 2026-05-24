#!/usr/bin/env node
// Generate a small synthetic WAV file for AudioVisualizer / AudioClip
// previews. We synthesize rather than download because:
//   - No external dependency or third-party CDN to keep alive.
//   - No licensing complication — we generated it; it's whatever we say.
//   - Deterministic across runs; the same script always produces the same
//     bytes, so the committed file is reproducible.
//   - Avoids the CORS pain of remote URLs (the file is served same-origin
//     from /sample-audio.wav).
//
// The output is a 2-second 44.1kHz 16-bit mono WAV (~176KB) of a soft
// C-major triad (C4 / E4 / G4) with an exponential decay envelope — gives
// the visualizer real frequency content to chew on without sounding
// jarring in a silent-by-default landing-page preview.
//
// Run via `pnpm sample-audio` (or `node scripts/generate-sample-audio.mjs`).

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const OUT_PATH = resolve(__dirname, '..', 'www', 'public', 'sample-audio.wav');

const SAMPLE_RATE = 44100;
const DURATION_SEC = 2;
const NUM_SAMPLES = SAMPLE_RATE * DURATION_SEC;
const BITS_PER_SAMPLE = 16;
const NUM_CHANNELS = 1;

// C-major triad: C4, E4, G4. Pleasant, recognizable, gives the FFT bars
// real spread across the low / mid frequencies.
const NOTES_HZ = [261.63, 329.63, 392.0];

// Slight per-note amplitude shaping so the root is loudest — feels like a
// real chord rather than three sine waves at equal volume.
const NOTE_GAINS = [0.7, 0.5, 0.4];

// Exponential decay envelope — the chord "dings" and fades. Tau in seconds
// controls how fast it dies. ~0.6s tau over 2s gives a nice tail without
// silence dominating the back half.
const DECAY_TAU = 0.6;

// Synthesize the float samples.
const floatSamples = new Float32Array(NUM_SAMPLES);
for (let i = 0; i < NUM_SAMPLES; i++) {
  const t = i / SAMPLE_RATE;
  const envelope = Math.exp(-t / DECAY_TAU);
  let s = 0;
  for (let n = 0; n < NOTES_HZ.length; n++) {
    s += NOTE_GAINS[n] * Math.sin(2 * Math.PI * NOTES_HZ[n] * t);
  }
  // Soft master gain so the summed triad doesn't clip.
  floatSamples[i] = 0.35 * envelope * s;
}

// Convert float (-1..1) to 16-bit PCM little-endian.
const pcm = Buffer.alloc(NUM_SAMPLES * 2);
for (let i = 0; i < NUM_SAMPLES; i++) {
  const clamped = Math.max(-1, Math.min(1, floatSamples[i]));
  const intSample = Math.round(clamped * 32767);
  pcm.writeInt16LE(intSample, i * 2);
}

// Standard 44-byte WAV header (RIFF / fmt / data) — see the canonical WAV
// spec. We only emit PCM mono 16-bit which is the simplest valid form.
const dataLength = pcm.length;
const fileSize = 36 + dataLength;
const byteRate = (SAMPLE_RATE * NUM_CHANNELS * BITS_PER_SAMPLE) / 8;
const blockAlign = (NUM_CHANNELS * BITS_PER_SAMPLE) / 8;

const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(fileSize, 4);
header.write('WAVE', 8);
header.write('fmt ', 12);
header.writeUInt32LE(16, 16); // fmt chunk length
header.writeUInt16LE(1, 20); // PCM
header.writeUInt16LE(NUM_CHANNELS, 22);
header.writeUInt32LE(SAMPLE_RATE, 24);
header.writeUInt32LE(byteRate, 28);
header.writeUInt16LE(blockAlign, 32);
header.writeUInt16LE(BITS_PER_SAMPLE, 34);
header.write('data', 36);
header.writeUInt32LE(dataLength, 40);

const wav = Buffer.concat([header, pcm]);
writeFileSync(OUT_PATH, wav);

const sizeKb = (wav.length / 1024).toFixed(1);
console.log(`wrote ${OUT_PATH} (${sizeKb}KB, ${DURATION_SEC}s, ${SAMPLE_RATE}Hz mono 16-bit)`);
