'use client';

import { useState, useEffect } from 'react';
import { AppSettings, AVAILABLE_MODELS, EnvSettingsResponse } from '@/types';
import { Settings, Key, Github, MessageSquare, Save, X, Sparkles, Check, Cpu, FileText, Lock } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
  onShowToast?: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
  onShowToast,
}: SettingsModalProps) {
  const [geminiApiKey, setGeminiApiKey] = useState(settings.geminiApiKey);
  const [selectedModel, setSelectedModel] = useState(settings.selectedModel);
  const [githubToken, setGithubToken] = useState(settings.githubToken);
  const [githubOwner, setGithubOwner] = useState(settings.githubOwner);
  const [githubRepo, setGithubRepo] = useState(settings.githubRepo);
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState(settings.discordWebhookUrl);
  const [slackWebhookUrl, setSlackWebhookUrl] = useState(settings.slackWebhookUrl);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Environment variables state from server (.env, .env.local, .env.prod, etc.)
  const [envData, setEnvData] = useState<EnvSettingsResponse | null>(null);
  const [loadingEnv, setLoadingEnv] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGeminiApiKey(settings.geminiApiKey);
      setSelectedModel(settings.selectedModel);
      setGithubToken(settings.githubToken);
      setGithubOwner(settings.githubOwner);
      setGithubRepo(settings.githubRepo);
      setDiscordWebhookUrl(settings.discordWebhookUrl);
      setSlackWebhookUrl(settings.slackWebhookUrl);

      // Fetch server env variables
      setLoadingEnv(true);
      fetch('/api/settings/env')
        .then((res) => res.json())
        .then((data: EnvSettingsResponse) => {
          setEnvData(data);
          // Pre-fill fields with env values if user localStorage value is empty
          if (!settings.githubOwner && data.githubOwner) setGithubOwner(data.githubOwner);
          if (!settings.githubRepo && data.githubRepo) setGithubRepo(data.githubRepo);
          if (!settings.discordWebhookUrl && data.discordWebhookUrl) setDiscordWebhookUrl(data.discordWebhookUrl);
          if (!settings.slackWebhookUrl && data.slackWebhookUrl) setSlackWebhookUrl(data.slackWebhookUrl);
        })
        .catch((err) => console.error('Failed to load env settings:', err))
        .finally(() => setLoadingEnv(false));
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...settings,
      geminiApiKey,
      selectedModel,
      githubToken,
      githubOwner,
      githubRepo,
      discordWebhookUrl,
      slackWebhookUrl,
    });
    setSavedSuccess(true);
    if (onShowToast) {
      onShowToast('success', 'Settings Saved', 'Your API keys, model, and environment preferences have been updated.');
    }
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-800 text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Agent Settings & Environment Variables</h3>
              <p className="text-xs text-slate-400">
                Configure AI models, API keys, GitHub tokens, and environment overrides.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto py-4 space-y-4 flex-1">
          {/* Active Env File Badge Notification (Requirement 4) */}
          {envData?.hasEnvFile && (
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Environment variables detected from server environment (<code className="font-mono text-emerald-200">.env / .env.local</code>). Variables below marked with badges reflect your loaded environment file.
              </span>
            </div>
          )}

          {/* Model Selection & Gemini API Section (Requirement 1 & 2) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <span>Gemini AI Engine & Model Selection</span>
              </div>
              {envData?.geminiApiKey && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  GEMINI_API_KEY loaded from .env
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                Active Model (Switch during traffic spikes / model downtimes)
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-mono font-medium text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                {AVAILABLE_MODELS.map((model) => (
                  <option key={model.id} value={model.id} className="bg-slate-900 text-slate-200 py-1 font-mono text-xs">
                    {model.name} — {model.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Custom Gemini API Key Override
              </label>
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder={envData?.geminiApiKey ? '•••••••••••••••• (Set in .env)' : 'AIzaSy...'}
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-mono text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                {envData?.geminiApiKey
                  ? 'Loaded from .env environment variable. Enter a custom key here if you wish to override it.'
                  : 'If omitted, local smart fallback heuristics or server process environment keys will be utilized automatically.'}
              </p>
            </div>
          </div>

          {/* GitHub Config Section */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
                <Github className="w-4 h-4" />
                <span>GitHub Integration & Repository Settings</span>
              </div>
              {(envData?.githubToken || envData?.githubOwner) && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                  Configured in .env
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                  <span>Default Repository Owner</span>
                  {envData?.githubOwner && (
                    <span className="text-[10px] text-cyan-400 font-mono">.env: {envData.githubOwner}</span>
                  )}
                </label>
                <input
                  type="text"
                  value={githubOwner}
                  onChange={(e) => setGithubOwner(e.target.value)}
                  placeholder={envData?.githubOwner || 'acme-corp'}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                  <span>Default Repository Name</span>
                  {envData?.githubRepo && (
                    <span className="text-[10px] text-cyan-400 font-mono">.env: {envData.githubRepo}</span>
                  )}
                </label>
                <input
                  type="text"
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  placeholder={envData?.githubRepo || 'main-backend'}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                <span>GitHub PAT Token</span>
                {envData?.githubToken && (
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <Lock className="w-3 h-3" /> GITHUB_TOKEN set in .env
                  </span>
                )}
              </label>
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder={envData?.githubToken ? '•••••••••••••••• (Set in .env)' : 'ghp_...'}
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Webhooks Section */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <MessageSquare className="w-4 h-4" />
                <span>Real-Time Webhook Alert Channels</span>
              </div>
              {(envData?.discordWebhookUrl || envData?.slackWebhookUrl) && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  Webhooks set in .env
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                <span>Discord Webhook URL</span>
                {envData?.discordWebhookUrl && (
                  <span className="text-[10px] text-amber-400 font-mono">Set in .env</span>
                )}
              </label>
              <input
                type="text"
                value={discordWebhookUrl}
                onChange={(e) => setDiscordWebhookUrl(e.target.value)}
                placeholder={envData?.discordWebhookUrl || 'https://discord.com/api/webhooks/...'}
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-mono text-slate-200 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                <span>Slack Webhook URL</span>
                {envData?.slackWebhookUrl && (
                  <span className="text-[10px] text-amber-400 font-mono">Set in .env</span>
                )}
              </label>
              <input
                type="text"
                value={slackWebhookUrl}
                onChange={(e) => setSlackWebhookUrl(e.target.value)}
                placeholder={envData?.slackWebhookUrl || 'https://hooks.slack.com/services/...'}
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-mono text-slate-200 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Save */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>Settings & Model Preferences Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-emerald-200" />
                  <span>Save Configurations</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
