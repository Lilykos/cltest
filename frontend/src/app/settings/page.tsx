'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import type { APIKey } from '@/types';

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [deepseekKey, setDeepseekKey] = useState('');
  const [tavilyKey, setTavilyKey] = useState('');

  useEffect(() => {
    checkAuth().then(() => {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        loadApiKeys();
      }
    });
  }, [isAuthenticated]);

  const loadApiKeys = async () => {
    try {
      const keys = await api.getAPIKeys();
      setApiKeys(keys);
    } catch (error) {
      console.error('Failed to load API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasKey = (provider: string) => {
    return apiKeys.some(k => k.provider === provider && k.is_active);
  };

  const handleSave = async (provider: string, key: string) => {
    if (!key.trim()) {
      setMessage('API key cannot be empty');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      await api.createAPIKey({ provider, api_key: key });
      await loadApiKeys();
      setMessage(`${provider.toUpperCase()} API key saved successfully!`);

      // Clear the input
      if (provider === 'openai') setOpenaiKey('');
      if (provider === 'anthropic') setAnthropicKey('');
      if (provider === 'deepseek') setDeepseekKey('');
      if (provider === 'tavily') setTavilyKey('');
    } catch (error: any) {
      setMessage(error.response?.data?.detail || 'Failed to save API key');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/dashboard" className="text-xl font-bold">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">API Key Settings</h1>

        {message && (
          <div className={`${message.includes('success') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'} border px-4 py-3 rounded mb-6`}>
            {message}
          </div>
        )}

        <div className="space-y-6">
          {/* OpenAI */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">OpenAI</h2>
              {hasKey('openai') && (
                <span className="text-sm text-green-600 font-medium">✓ Configured</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Required for natural language food logging. Get your key from{' '}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                platform.openai.com
              </a>
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={() => handleSave('openai', openaiKey)}
                disabled={saving}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>

          {/* Anthropic Claude */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Anthropic (Claude)</h2>
              {hasKey('anthropic') && (
                <span className="text-sm text-green-600 font-medium">✓ Configured</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Alternative to OpenAI. Get your key from{' '}
              <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                console.anthropic.com
              </a>
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                placeholder="sk-ant-..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={() => handleSave('anthropic', anthropicKey)}
                disabled={saving}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>

          {/* DeepSeek */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">DeepSeek</h2>
              {hasKey('deepseek') && (
                <span className="text-sm text-green-600 font-medium">✓ Configured</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Cost-effective LLM provider. Get your key from{' '}
              <a href="https://platform.deepseek.com/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                platform.deepseek.com
              </a>
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={deepseekKey}
                onChange={(e) => setDeepseekKey(e.target.value)}
                placeholder="sk-..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={() => handleSave('deepseek', deepseekKey)}
                disabled={saving}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>

          {/* Tavily */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Tavily Search</h2>
              {hasKey('tavily') && (
                <span className="text-sm text-green-600 font-medium">✓ Configured</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              <strong>Required</strong> for automatic nutritional data lookup. Get your key from{' '}
              <a href="https://tavily.com/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                tavily.com
              </a>
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={tavilyKey}
                onChange={(e) => setTavilyKey(e.target.value)}
                placeholder="tvly-..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={() => handleSave('tavily', tavilyKey)}
                disabled={saving}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Security Note</h3>
          <p className="text-sm text-blue-800">
            Your API keys are encrypted before being stored in the database and are never displayed after saving. You can update them at any time by entering a new key and clicking Save.
          </p>
        </div>
      </div>
    </div>
  );
}
