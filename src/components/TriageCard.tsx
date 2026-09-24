'use client';

import { useState } from 'react';
import { TriageResult, AVAILABLE_MODELS } from '@/types';
import CodeBlock from './CodeBlock';
import {
  ShieldAlert,
  Tag,
  Github,
  Send,
  Copy,
  Check,
  Download,
  Terminal,
  FileCode2,
  Cpu,
} from 'lucide-react';

interface TriageCardProps {
  result: TriageResult;
  onOpenGitHubModal: () => void;
  onOpenWebhookModal: () => void;
  onShowToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
}

export default function TriageCard({
  result,
  onOpenGitHubModal,
  onOpenWebhookModal,
  onShowToast,
}: TriageCardProps) {
  const [copiedReport, setCopiedReport] = useState(false);

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case 'P0-Critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/20';
      case 'P1-High':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40 shadow-sm shadow-orange-500/20';
      case 'P2-Medium':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'P3-Low':
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  const modelInfo = AVAILABLE_MODELS.find((m) => m.id === result.modelUsed) || {
    name: result.modelUsed || 'Gemini AI Engine',
  };

  const handleCopyMarkdown = () => {
    const reportMarkdown = `# 🚨 AutoTriage AI Report: ${result.title}

- **Severity**: ${result.severity}
- **Category**: ${result.category}
- **Model Engine**: ${modelInfo.name}
- **Language**: ${result.language || 'Auto-Detect'}
- **Environment**: ${result.environment || 'Production'}
- **Tags**: ${result.tags.join(', ')}

## 🔍 Root Cause Analysis (RCA)
${result.rootCause}

## 🛠️ Suggested Patch
\`\`\`diff
${result.suggestedFix}
\`\`\`
`;
    navigator.clipboard.writeText(reportMarkdown);
    setCopiedReport(true);
    onShowToast('success', 'Report Copied', 'Full Markdown triage report copied to clipboard.');
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handleExportJSON = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `autotriage-${result.id}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      onShowToast('success', 'JSON Exported', `Downloaded autotriage-${result.id}.json`);
    } catch (err: any) {
      onShowToast('error', 'Export Failed', 'Could not export JSON report file.');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl p-6 space-y-6">
      {/* Top Bar / Severity & Title Header */}
      <div className="space-y-3 pb-5 border-b border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border flex items-center gap-1.5 ${getSeverityBadgeClass(
                result.severity
              )}`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              {result.severity}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              {result.category}
            </span>
            {result.modelUsed && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-emerald-400" />
                {modelInfo.name}
              </span>
            )}
            {result.environment && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono text-slate-400 bg-slate-950 border border-slate-800">
                Env: {result.environment}
              </span>
            )}
          </div>

          <div className="text-xs font-mono text-slate-500">
            Triaged at {new Date(result.timestamp).toLocaleTimeString()}
          </div>
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
          {result.title}
        </h2>
      </div>

      {/* Root Cause Analysis (RCA) Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          Root Cause Analysis (RCA)
        </h3>
        <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/80 text-sm text-slate-200 leading-relaxed font-sans">
          <p className="whitespace-pre-line">{result.rootCause}</p>
        </div>
      </div>

      {/* Suggested Patch / Fix Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-cyan-400" />
            Suggested Code Fix / Refactoring Patch
          </h3>
        </div>
        <CodeBlock code={result.suggestedFix} language="diff" title="Recommended Patch Code" />
      </div>

      {/* Recommended Tags Section */}
      <div className="space-y-2 pt-1">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-amber-400" />
          Recommended Issue Labels / Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {result.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700/80 hover:border-slate-600 transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Proactive Downstream Action Bar */}
      <div className="pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Create GitHub Issue Button */}
          <button
            onClick={onOpenGitHubModal}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all flex items-center gap-2 border border-slate-700 shadow-md active:scale-95"
          >
            <Github className="w-4 h-4 text-emerald-400" />
            <span>Create GitHub Issue</span>
          </button>

          {/* Webhook Alert Button */}
          <button
            onClick={onOpenWebhookModal}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all flex items-center gap-2 border border-slate-700 shadow-md active:scale-95"
          >
            <Send className="w-4 h-4 text-cyan-400" />
            <span>Dispatch Webhook Alert</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Copy Markdown Report */}
          <button
            onClick={handleCopyMarkdown}
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors border border-slate-800 flex items-center gap-1.5"
            title="Copy formatted Markdown report to clipboard"
          >
            {copiedReport ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied Report</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Markdown</span>
              </>
            )}
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors border border-slate-800 flex items-center gap-1.5"
            title="Download full JSON response payload"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
}
