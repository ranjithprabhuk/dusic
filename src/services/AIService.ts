import type { AIConfig, AIGenerateParams } from '../types/ai';
import type { NoteEvent } from '../types/composition';

export interface AIGenerateResult {
  notes: NoteEvent[];
  durationBeats: number;
}

class AIService {
  async generate(config: AIConfig, params: AIGenerateParams): Promise<AIGenerateResult> {
    if (!config.apiKey) {
      throw new Error('API key is required. Configure it in Settings.');
    }

    const endpoint = this.getEndpoint(config);
    const payload = this.buildPayload(config, params);

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new Error('Network error. Check your connection and endpoint URL.');
    }

    if (response.status === 401) {
      throw new Error('Invalid API key. Check your settings.');
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait and try again.');
    }
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`API error (${response.status}): ${text || 'Unknown error'}`);
    }

    const data = await response.json();
    return this.parseResponse(data, params);
  }

  async testConnection(config: AIConfig): Promise<boolean> {
    if (!config.apiKey) return false;
    const endpoint = config.provider === 'openai'
      ? 'https://api.openai.com/v1/models'
      : `${config.endpoint ?? ''}/models`;

    try {
      const res = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${config.apiKey}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  private getEndpoint(config: AIConfig): string {
    if (config.provider === 'openai') {
      return 'https://api.openai.com/v1/chat/completions';
    }
    if (!config.endpoint) {
      throw new Error('Custom endpoint URL is required.');
    }
    return config.endpoint;
  }

  private buildPayload(config: AIConfig, params: AIGenerateParams): unknown {
    const prompt = this.buildPrompt(params);
    const model = config.model || (config.provider === 'openai' ? 'gpt-4o' : 'default');

    if (config.provider === 'openai') {
      return {
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a music composition assistant. Generate MIDI-like note data as JSON. Return a JSON object with "notes" array where each note has: pitch (MIDI number 36-96), startBeat (float), durationBeats (float), velocity (1-127). Also include "durationBeats" for total length.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
      };
    }

    // Custom endpoint — send a generic payload
    return { prompt, model, params };
  }

  private buildPrompt(params: AIGenerateParams): string {
    switch (params.method) {
      case 'text':
        return `Generate music notes for: ${params.textPrompt ?? 'a short melody'}`;
      case 'selectors':
        return `Generate a ${params.mood ?? 'happy'} ${params.genre ?? 'pop'} melody for ${params.instrument ?? 'piano'} at ${params.tempo ?? 120} BPM`;
      case 'trackSeed':
        return `Continue or create a variation of this track. Seed track ID: ${params.seedTrackId}, segment: ${params.seedSegmentId}`;
      case 'midiPattern':
        return `Create a melody based on this MIDI pitch pattern: ${JSON.stringify(params.midiPattern ?? [])}. Develop it into a full musical phrase.`;
      default:
        return 'Generate a short musical phrase';
    }
  }

  private parseResponse(data: unknown, _params: AIGenerateParams): AIGenerateResult {
    // Try to extract notes from OpenAI chat completion format
    const obj = data as Record<string, unknown>;

    let content: unknown = obj;
    if (obj.choices && Array.isArray(obj.choices) && obj.choices.length > 0) {
      const choice = obj.choices[0] as Record<string, unknown>;
      const message = choice.message as Record<string, unknown>;
      try {
        content = JSON.parse(message.content as string);
      } catch {
        content = obj;
      }
    }

    const parsed = content as Record<string, unknown>;
    if (Array.isArray(parsed.notes)) {
      return {
        notes: (parsed.notes as NoteEvent[]).map((n) => ({
          pitch: Math.max(36, Math.min(96, n.pitch ?? 60)),
          startBeat: n.startBeat ?? 0,
          durationBeats: n.durationBeats ?? 0.5,
          velocity: n.velocity ?? 100,
        })),
        durationBeats: (parsed.durationBeats as number) ?? 8,
      };
    }

    // Fallback: generate a simple pattern
    return this.generateFallback();
  }

  private generateFallback(): AIGenerateResult {
    const pitches = [60, 62, 64, 65, 67, 65, 64, 62];
    return {
      notes: pitches.map((pitch, i) => ({
        pitch,
        startBeat: i * 0.5,
        durationBeats: 0.5,
        velocity: 80 + Math.floor(Math.random() * 40),
      })),
      durationBeats: 4,
    };
  }
}

export const aiService = new AIService();
