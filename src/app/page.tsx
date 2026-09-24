"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import LogForm from "@/components/LogForm";
import TriageCard from "@/components/TriageCard";
import GitHubModal from "@/components/GitHubModal";
import WebhookModal from "@/components/WebhookModal";
import SettingsModal from "@/components/SettingsModal";
import HistorySidebar from "@/components/HistorySidebar";
import { SAMPLE_PRESETS } from "@/components/SamplePresets";
import { TriageResult, AppSettings } from "@/types";
import {
  loadSettings,
  saveSettings,
  loadHistory,
  saveHistoryItem,
  deleteHistoryItem,
  clearHistory,
  DEFAULT_SETTINGS,
} from "@/lib/storage";
import { Sparkles, ShieldCheck, Activity } from "lucide-react";

export default function Home() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [history, setHistory] = useState<TriageResult[]>([]);
  const [currentResult, setCurrentResult] = useState<TriageResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals visibility state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isGitHubOpen, setIsGitHubOpen] = useState(false);
  const [isWebhookOpen, setIsWebhookOpen] = useState(false);

  useEffect(() => {
    // Load local settings & history on client side mount
    const loadedSets = loadSettings();
    const loadedHist = loadHistory();
    setSettings(loadedSets);
    setHistory(loadedHist);

    // If history exists, populate latest result; otherwise initialize with a sample
    if (loadedHist.length > 0) {
      setCurrentResult(loadedHist[0]);
    }
  }, []);

  const handleTriageSubmit = async (
    errorLog: string,
    language: string,
    environment: string,
  ) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          errorLog,
          language,
          environment,
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

      // Smooth scroll to result
      setTimeout(() => {
        const resultElement = document.getElementById("triage-result-view");
        if (resultElement) {
          resultElement.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } catch (err: any) {
      console.error("Triage error:", err);
      setErrorMessage(
        err.message || "An unexpected error occurred while analyzing the log.",
      );
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
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
    setCurrentResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col">
      {/* Top Bar Header */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
      />

      {/* Hero Banner / Sub-Header */}
      <div className="border-b border-slate-800/60 bg-linear-to-b from-slate-900/50 via-slate-950 to-slate-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className="w-3.5 h-3.5" /> Autonomous Maintenance
              Engineer Agent
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Software Crash Log Triage & Code Repair
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Ingest stack traces, analyze root causes using Gemini 2.5 Flash
              structured outputs, and trigger automated downstream resolution
              workflows across GitHub and Discord/Slack.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400 bg-slate-900/90 p-4 rounded-xl border border-slate-800 shrink-0">
            <div>
              <div className="text-slate-500 text-[10px] uppercase font-bold">
                Engine
              </div>
              <div className="text-slate-200 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />{" "}
                gemini-2.5-flash
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <div className="text-slate-500 text-[10px] uppercase font-bold">
                Outputs
              </div>
              <div className="text-slate-200 font-semibold">
                Structured JSON
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
          <LogForm onSubmit={handleTriageSubmit} isLoading={isLoading} />
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
          />

          <WebhookModal
            isOpen={isWebhookOpen}
            onClose={() => setIsWebhookOpen(false)}
            triageResult={currentResult}
            settings={settings}
            onUpdateSettings={handleSaveSettings}
          />
        </>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © 2026 AutoTriage AI • Intelligent Bug Triage & Maintenance Engineer
            Agent
          </p>
          <p className="font-mono text-[11px] text-slate-600">
            Powered by Google Gemini 2.5 Flash
          </p>
        </div>
      </footer>
    </div>
  );
}
