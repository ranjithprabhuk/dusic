import { useState } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { aiService } from '../../services/AIService';
import type { AIConfig } from '../../types/ai';

export default function AISettingsForm() {
  const { aiConfig, setAIConfig } = useSettingsStore();
  const [provider, setProvider] = useState<AIConfig['provider']>(aiConfig?.provider ?? 'openai');
  const [apiKey, setApiKey] = useState(aiConfig?.apiKey ?? '');
  const [endpoint, setEndpoint] = useState(aiConfig?.endpoint ?? '');
  const [model, setModel] = useState(aiConfig?.model ?? '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'fail' | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const config: AIConfig = {
      provider,
      apiKey,
      ...(provider === 'custom' && endpoint ? { endpoint } : {}),
      ...(model ? { model } : {}),
    };
    setAIConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const config: AIConfig = { provider, apiKey, endpoint, model };
    const ok = await aiService.testConnection(config);
    setTestResult(ok ? 'success' : 'fail');
    setTesting(false);
  };

  const handleClear = () => {
    setAIConfig(null);
    setProvider('openai');
    setApiKey('');
    setEndpoint('');
    setModel('');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Provider</label>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value as AIConfig['provider'])}
          className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <option value="openai">OpenAI</option>
          <option value="custom">Custom Endpoint</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
        />
      </div>

      {provider === 'custom' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Endpoint URL</label>
          <input
            type="url"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder="https://your-api.com/v1/chat/completions"
            className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Model (optional)</label>
        <input
          type="text"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder={provider === 'openai' ? 'gpt-4o' : 'model-name'}
          className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
        />
      </div>

      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={handleSave}
          disabled={!apiKey.trim()}
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {saved ? 'Saved!' : 'Save'}
        </button>
        <button
          onClick={handleTest}
          disabled={!apiKey.trim() || testing}
          className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
        >
          {testing ? 'Testing...' : 'Test Connection'}
        </button>
        {aiConfig && (
          <button
            onClick={handleClear}
            className="rounded px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            Clear
          </button>
        )}
      </div>

      {testResult === 'success' && (
        <p className="text-sm text-green-600 dark:text-green-400">Connection successful!</p>
      )}
      {testResult === 'fail' && (
        <p className="text-sm text-red-600 dark:text-red-400">Connection failed. Check your API key and endpoint.</p>
      )}
    </div>
  );
}
