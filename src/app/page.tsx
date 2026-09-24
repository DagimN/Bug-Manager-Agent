'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import LogForm from '@/components/LogForm';
import TriageCard from '@/components/TriageCard';
import GitHubModal from '@/components/GitHubModal';
import WebhookModal from '@/components/WebhookModal';
import SettingsModal from '@/components/SettingsModal';
import HistorySidebar from '@/components/HistorySidebar';
import IntegrationModal from '@/components/IntegrationModal';
import ToastContainer from '@/components/Toast';
import { TriageResult, AppSettings, AVAILABLE_MODELS, ToastMessage, ToastType } from '@/types';
import {
  loadSettings,
  saveSettings,
  loadHistory,
  saveHistoryItem,
  deleteHistoryItem,
  clearHistory,
  DEFAULT_SETTINGS,
} from '@/lib/storage';
import { ShieldCheck, Activity, Cpu, Server } from 'lucide-react';

export default function Home() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [history, setHistory] = useState<TriageResult[]>([]);
  const [currentResult, setCurrentResult] = useState<TriageResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Toast stack state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals visibility state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isGitHubOpen, setIsGitHubOpen] = useState(false);
  const [isWebhookOpen, setIsWebhookOpen] = useState(false);
  const [isIntegrationOpen, setIsIntegrationOpen] = useState(false);

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Auto dismiss after 4.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    // Load local settings & history on client side mount
    const loadedSets = loadSettings();
    const loadedHist = loadHistory();
    setSettings(loadedSets);
    setHistory(loadedHist);

    // If history exists, populate latest result
    if (loadedHist.length > 0) {
      setCurrentResult(loadedHist[0]);
    }
  }, []);

  const handleSelectModel = (modelId: string) => {
    const newSettings = { ...settings, selectedModel: modelId };
    setSettings(newSettings);
    saveSettings(newSettings);
    const modelObj = AVAILABLE_MODELS.find((m) => m.id === modelId);
    showToast('info', 'AI Model Switched', `Active model set to ${modelObj?.name || modelId}`);
  };

  const handleTriageSubmit = async (
    errorLog: string,
    language: string,
    environment: string,
    model: string
  ) => {
    setIsLoading(true);
    setErrorMessage(null);

    const activeModelObj = AVAILABLE_MODELS.find((m) => m.id === model) || AVAILABLE_MODELS[0];

    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorLog,
          language,
          environment,
          model,
          customApiKey: settings.geminiApiKey || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Server returned HTTP ${res.status}`);
      }

      const resultData: TriageResult = await res.json();

      setCurrentResult(resultData);
      const updatedHist = saveHistoryItem(resultData);
      setHistory(updatedHist);

      showToast(
        'success',
        'Triage Analysis Complete!',
        `Root Cause Analysis generated using ${activeModelObj.name}`
      );

      // Smooth scroll to result
      setTimeout(() => {
        const resultElement = document.getElementById('triage-result-view');
        if (resultElement) {
          resultElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err: any) {
      console.error('Triage error:', err);
      const msg = err.message || 'An unexpected error occurred while analyzing the log.';
      setErrorMessage(msg);
      showToast('error', 'Triage Analysis Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleDeleteHistory = (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistory(updated);
    if (currentResult?.id === id) {
      setCurrentResult(updated.length > 0 ? updated[0] : null);
    }
    showToast('info', 'Triage Log Removed', 'Selected item removed from session history.');
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
    setCurrentResult(null);
    showToast('info', 'History Cleared', 'All stored triage logs have been removed.');
  };

  const currentModelObj = AVAILABLE_MODELS.find((m) => m.id === settings.selectedModel) || AVAILABLE_MODELS[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col">
      {/* Top Bar Header */}
      <Header
        selectedModel={settings.selectedModel}
        onSelectModel={handleSelectModel}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenIntegration={() => setIsIntegrationOpen(true)}
        historyCount={history.length}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Hero Banner / Sub-Header */}
      <div className="border-b border-slate-800/60 bg-gradient-to-b from-slate-900/50 via-slate-950 to-slate-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className="w-3.5 h-3.5" /> Autonomous Maintenance Engineer Agent
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Software Crash Log Triage & Repair
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Ingest stack traces, analyze root causes using Gemini AI structured outputs, and trigger automated downstream resolution workflows across GitHub and Discord/Slack with duplicate log deduplication.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsIntegrationOpen(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-emerald-300 transition-all shadow-md"
            >
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Backend API Ingestion</span>
            </button>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-400 bg-slate-900/90 p-4 rounded-xl border border-slate-800 shrink-0">
              <div>
                <div className="text-slate-500 text-[10px] uppercase font-bold">Engine</div>
                <div className="text-emerald-300 font-semibold flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" /> {currentModelObj.name}
                </div>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <div className="text-slate-500 text-[10px] uppercase font-bold">Outputs</div>
                <div className="text-slate-200 font-semibold">Structured JSON</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8">
        {/* Error Alert Message */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-sm flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-semibold hover:underline text-rose-300"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 1. Log Ingestion & Submission Form Section */}
        <section>
          <LogForm
            onSubmit={handleTriageSubmit}
            isLoading={isLoading}
            selectedModel={settings.selectedModel}
            onSelectModel={handleSelectModel}
          />
        </section>

        {/* 2. Triage Result Dashboard View Section */}
        {currentResult && (
          <section id="triage-result-view" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Triage Result Dashboard
              </h2>
              <span className="text-xs font-mono text-slate-500">
                ID: {currentResult.id}
              </span>
            </div>

            <TriageCard
              result={currentResult}
              onOpenGitHubModal={() => setIsGitHubOpen(true)}
              onOpenWebhookModal={() => setIsWebhookOpen(true)}
              onShowToast={showToast}
            />
          </section>
        )}
      </main>

      {/* Modals & Drawers */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
        onShowToast={showToast}
      />

      <IntegrationModal
        isOpen={isIntegrationOpen}
        onClose={() => setIsIntegrationOpen(false)}
        onShowToast={showToast}
      />

      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectResult={(item) => setCurrentResult(item)}
        onClearHistory={handleClearHistory}
        onDeleteHistoryItem={handleDeleteHistory}
      />

      {currentResult && (
        <>
          <GitHubModal
            isOpen={isGitHubOpen}
            onClose={() => setIsGitHubOpen(false)}
            triageResult={currentResult}
            settings={settings}
            onUpdateSettings={handleSaveSettings}
            onShowToast={showToast}
          />

          <WebhookModal
            isOpen={isWebhookOpen}
            onClose={() => setIsWebhookOpen(false)}
            triageResult={currentResult}
            settings={settings}
            onUpdateSettings={handleSaveSettings}
            onShowToast={showToast}
          />
        </>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 AutoTriage AI • Intelligent Bug Triage & Maintenance Engineer Agent</p>
          <p className="font-mono text-[11px] text-slate-600">Deduplication & Programmatic Ingestion API Active</p>
        </div>
      </footer>
    </div>
  );
}
