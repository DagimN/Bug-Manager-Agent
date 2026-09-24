'use client';

import { useState } from 'react';
import { TriageResult, AppSettings } from '@/types';
import { Send, Check, RefreshCw, X, AlertCircle, MessageSquare } from 'lucide-react';

interface WebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  triageResult: TriageResult;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onShowToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
}

export default function WebhookModal({
  isOpen,
  onClose,
  triageResult,
  settings,
  onUpdateSettings,
  onShowToast,
}: WebhookModalProps) {
  const [platform, setPlatform] = useState<'discord' | 'slack'>(settings.defaultPlatform || 'discord');
  const [webhookUrl, setWebhookUrl] = useState(
    platform === 'discord' ? settings.discordWebhookUrl : settings.slackWebhookUrl
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    isMockPreview?: boolean;
    error?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handlePlatformChange = (newPlatform: 'discord' | 'slack') => {
    setPlatform(newPlatform);
    setWebhookUrl(newPlatform === 'discord' ? settings.discordWebhookUrl : settings.slackWebhookUrl);
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    // Save updated setting
    onUpdateSettings({
      ...settings,
      discordWebhookUrl: platform === 'discord' ? webhookUrl : settings.discordWebhookUrl,
      slackWebhookUrl: platform === 'slack' ? webhookUrl : settings.slackWebhookUrl,
      defaultPlatform: platform,
    });

    try {
      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          webhookUrl,
          triageResult,
        }),
      });

      const data = await res.json();
      setResult(data);

      if (data.success) {
        if (data.isMockPreview) {
          onShowToast('info', `${platform.toUpperCase()} Webhook Formatted`, data.message);
        } else {
          onShowToast('success', `${platform.toUpperCase()} Alert Dispatched!`, data.message);
        }
      } else {
        onShowToast('error', 'Webhook Delivery Failed', data.error || data.message);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to send webhook notification';
      setResult({
        success: false,
        message: 'Failed to dispatch webhook notification',
        error: errorMsg,
      });
      onShowToast('error', 'Webhook Notification Error', errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-800 text-cyan-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Instant Webhook Alert Dispatch</h3>
              <p className="text-xs text-slate-400">
                Notify your team real-time in Discord or Slack channels.
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

        {/* Modal Content */}
        <div className="py-4 space-y-4">
          {/* Platform Toggle */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => handlePlatformChange('discord')}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                platform === 'discord'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Discord Webhook
            </button>
            <button
              type="button"
              onClick={() => handlePlatformChange('slack')}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                platform === 'slack'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Slack Webhook
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex justify-between">
                <span>{platform === 'discord' ? 'Discord Webhook URL' : 'Slack Incoming Webhook URL'}</span>
                <span className="text-slate-500 text-[10px]">
                  (Optional - omit to perform test validation)
                </span>
              </label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder={
                  platform === 'discord'
                    ? 'https://discord.com/api/webhooks/...'
                    : 'https://hooks.slack.com/services/...'
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2.5 px-4 rounded-xl font-medium text-xs text-white transition-colors flex items-center justify-center gap-2 border border-slate-700 ${
                platform === 'discord' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Dispatching Webhook Alert...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-white" />
                  <span>Dispatch {platform.toUpperCase()} Alert</span>
                </>
              )}
            </button>
          </form>

          {/* Results feedback */}
          {result && (
            <div className="pt-2 border-t border-slate-800">
              {result.success ? (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{result.message}</span>
                  </div>
                  {result.isMockPreview && (
                    <p className="text-[11px] text-emerald-400/80">
                      Webhook formatting engine verified embeds for {platform.toUpperCase()}. Set a live webhook URL in settings for real-time channel delivery.
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold">{result.message}</h4>
                    <p className="text-xs text-rose-200 mt-0.5">{result.error}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
