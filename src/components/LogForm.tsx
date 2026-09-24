'use client';

import { useState } from 'react';
import { SAMPLE_PRESETS } from './SamplePresets';
import { SamplePreset } from '@/types';
import { Terminal, Play, Sparkles, RefreshCw, Zap, Code2, AlertTriangle, Layers } from 'lucide-react';

interface LogFormProps {
  onSubmit: (log: string, language: string, environment: string) => void;
  isLoading: boolean;
}

export default function LogForm({ onSubmit, isLoading }: LogFormProps) {
  const [logText, setLogText] = useState('');
  const [language, setLanguage] = useState('Auto-Detect');
  const [environment, setEnvironment] = useState('Production');
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const handleSelectPreset = (preset: SamplePreset) => {
    setLogText(preset.log);
    setLanguage(preset.language);
    setEnvironment(preset.environment);
    setActivePresetId(preset.id);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logText.trim() || isLoading) return;
    onSubmit(logText, language, environment);
  };

  const handleClear = () => {
    setLogText('');
    setActivePresetId(null);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            Ingest Application Crash Log & Stack Trace
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Paste raw runtime logs, trace errors, or select a sample preset below for instant AI triage.
          </p>
        </div>

        {/* Clear Button */}
        {logText && (
          <button
            type="button"
            onClick={handleClear}
            className="self-start sm:self-auto text-xs font-medium text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Clear Input
          </button>
        )}
      </div>

      {/* Sample Presets Buttons Section (Required by prompt spec) */}
      <div className="mb-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Sample Presets:</span>
          <span className="text-[10px] text-slate-500 font-normal">(Click to auto-populate)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/10'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* Textarea for raw log input */}
        <div className="relative">
          <textarea
            value={logText}
            onChange={(e) => {
              setLogText(e.target.value);
              setActivePresetId(null);
            }}
            placeholder="Paste your application crash log, runtime stack trace, or error payload here...
e.g. TypeError: Cannot read properties of undefined (reading 'map') at UserList.jsx:42..."
            rows={8}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all resize-y shadow-inner"
            required
          />
          <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-500 pointer-events-none">
            {logText.length} characters
          </div>
        </div>

        {/* Framework / Language & Environment Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Source Language / Framework
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="Auto-Detect">Auto-Detect Stack Trace</option>
              <option value="React / TypeScript">React / Next.js / TypeScript</option>
              <option value="Node.js / Express">Node.js / Express / JavaScript</option>
              <option value="Python / FastAPI">Python / FastAPI / Django</option>
              <option value="PostgreSQL / Knex">PostgreSQL / Prisma / Knex</option>
              <option value="Go / Gin">Go / Gin Framework</option>
              <option value="Java / Spring">Java / Spring Boot</option>
              <option value="Docker / Kubernetes">Docker / Infrastructure</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Target Environment
            </label>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="Production">Production (High Impact)</option>
              <option value="Staging">Staging / QA</option>
              <option value="Development">Local Development</option>
            </select>
          </div>
        </div>

        {/* Submit Triage Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!logText.trim() || isLoading}
            className={`w-full py-3.5 px-6 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 shadow-lg ${
              !logText.trim() || isLoading
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 shadow-emerald-500/25 active:scale-[0.99]'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                <span>Running Gemini 2.5 Flash Root Cause Analysis...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Analyze & Triage Error with Gemini AI</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
