import AISettingsForm from '../components/ai/AISettingsForm';

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl px-3 py-4 sm:p-6">
      <h2 className="text-xl font-bold sm:text-2xl">Settings</h2>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Configure AI music generation and app preferences.
      </p>

      <div className="mt-8">
        <h3 className="mb-4 text-lg font-semibold">AI Configuration</h3>
        <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
          <AISettingsForm />
        </div>
      </div>
    </div>
  );
}
