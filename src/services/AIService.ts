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
        headers: this.getHeaders(config),
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

    let endpoint: string;
    let headers: Record<string, string>;

    switch (config.provider) {
      case 'openai':
        endpoint = 'https://api.openai.com/v1/models';
        headers = { 'Authorization': `Bearer ${config.apiKey}` };
        break;
      case 'claude':
        endpoint = 'https://api.anthropic.com/v1/messages';
        headers = {
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        };
        // Send a minimal request to verify the key
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              model: config.model || 'claude-sonnet-4-6',
              max_tokens: 1,
              messages: [{ role: 'user', content: 'hi' }],
            }),
          });
          return res.ok || res.status === 400; // 400 = valid key, bad request is fine
        } catch {
          return false;
        }
      case 'gemini': {
        const model = config.model || 'gemini-2.0-flash';
        endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}?key=${config.apiKey}`;
        try {
          const res = await fetch(endpoint);
          return res.ok;
        } catch {
          return false;
        }
      }
      default:
        endpoint = `${config.endpoint ?? ''}/models`;
        headers = { 'Authorization': `Bearer ${config.apiKey}` };
        break;
    }

    try {
      const res = await fetch(endpoint, { headers });
      return res.ok;
    } catch {
      return false;
    }
  }

  private getHeaders(config: AIConfig): Record<string, string> {
    switch (config.provider) {
      case 'claude':
        return {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
        };
      case 'gemini':
        return { 'Content-Type': 'application/json' };
      default:
        return {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        };
    }
  }

  private getEndpoint(config: AIConfig): string {
    switch (config.provider) {
      case 'openai':
        return 'https://api.openai.com/v1/chat/completions';
      case 'claude':
        return 'https://api.anthropic.com/v1/messages';
      case 'gemini': {
        const model = config.model || 'gemini-2.0-flash';
        return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`;
      }
      default:
        if (!config.endpoint) {
          throw new Error('Custom endpoint URL is required.');
        }
        return config.endpoint;
    }
  }

  private buildPayload(config: AIConfig, params: AIGenerateParams): unknown {
    const prompt = this.buildPrompt(params);
    const systemPrompt = 'You are a music composition assistant. Generate MIDI-like note data as JSON. Return a JSON object with "notes" array where each note has: pitch (MIDI number 36-96), startBeat (float), durationBeats (float), velocity (1-127). Also include "durationBeats" for total length.';

    switch (config.provider) {
      case 'openai':
        return {
          model: config.model || 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.8,
        };
      case 'claude':
        return {
          model: config.model || 'claude-sonnet-4-6',
          max_tokens: 4096,
          system: systemPrompt,
          messages: [{ role: 'user', content: prompt }],
        };
      case 'gemini':
        return {
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            responseMimeType: 'application/json',
          },
        };
      default:
        return { prompt, model: config.model || 'default', params };
    }
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
    const obj = data as Record<string, unknown>;
    let content: unknown = obj;

    // OpenAI: choices[0].message.content
    if (obj.choices && Array.isArray(obj.choices) && obj.choices.length > 0) {
      const choice = obj.choices[0] as Record<string, unknown>;
      const message = choice.message as Record<string, unknown>;
      try {
        content = JSON.parse(message.content as string);
      } catch {
        content = obj;
      }
    }
    // Claude: content[0].text
    else if (obj.content && Array.isArray(obj.content) && obj.content.length > 0) {
      const block = obj.content[0] as Record<string, unknown>;
      if (block.type === 'text' && typeof block.text === 'string') {
        try {
          content = JSON.parse(block.text);
        } catch {
          content = obj;
        }
      }
    }
    // Gemini: candidates[0].content.parts[0].text
    else if (obj.candidates && Array.isArray(obj.candidates) && obj.candidates.length > 0) {
      const candidate = obj.candidates[0] as Record<string, unknown>;
      const candidateContent = candidate.content as Record<string, unknown>;
      if (candidateContent?.parts && Array.isArray(candidateContent.parts)) {
        const part = candidateContent.parts[0] as Record<string, unknown>;
        if (typeof part.text === 'string') {
          try {
            content = JSON.parse(part.text);
          } catch {
            content = obj;
          }
        }
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
