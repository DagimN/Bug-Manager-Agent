'use client';

import { AVAILABLE_MODELS } from '@/types';
import { Sparkles, Settings, History, Bot, Cpu, Server } from 'lucide-react';

interface HeaderProps {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenIntegration: () => void;
  historyCount: number;
}

export default function Header({
  selectedModel,
  onSelectModel,
  onOpenSettings,
  onOpenHistory,
  onOpenIntegration,
  historyCount,
}: HeaderProps) {
  const currentModelObj = AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0];

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 shadow-lg shadow-emerald-500/20 text-white font-bold shrink-0">
            <Bot className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                AutoTriage <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">AI</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Software Bug Triage & Maintenance Engineer Agent
            </p>
          </div>
        </div>

        {/* Model Switcher & Navigation Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dynamic Model Switcher Dropdown */}
          <div className="relative flex items-center">
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => onSelectModel(e.target.value)}
                className="appearance-none rounded-xl border border-emerald-500/30 bg-emerald-950/30 hover:bg-emerald-950/50 text-emerald-300 pl-8 pr-7 py-1.5 text-xs font-semibold font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer shadow-sm"
                title="Switch Gemini AI Model (Select alternate model during traffic spikes)"
              >
                {AVAILABLE_MODELS.map((model) => (
                  <option key={model.id} value={model.id} className="bg-slate-900 text-slate-200 py-1 font-mono text-xs">
                    {model.name} {model.badge ? `(${model.badge})` : ''}
                  </option>
                ))}
              </select>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 absolute left-2.5 top-2.5 pointer-events-none" />
              <Cpu className="w-3 h-3 text-emerald-400 absolute right-2.5 top-3 pointer-events-none opacity-80" />
            </div>
          </div>

          {/* External Backend Ingestion Modal Trigger */}
          <button
            onClick={onOpenIntegration}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-900/40 text-emerald-300 text-xs font-medium transition-all"
            title="External Service Ingestion & Deduplication API"
          >
            <Server className="w-4 h-4 text-emerald-400" />
            <span className="hidden lg:inline">API Ingest</span>
          </button>

          {/* History Drawer Trigger */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-all"
            title="View Triage History"
          >
            <History className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">History</span>
            {historyCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                {historyCount}
              </span>
            )}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-all"
            title="Configure API Keys, Webhooks & Environment"
          >
            <Settings className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline">Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
}
