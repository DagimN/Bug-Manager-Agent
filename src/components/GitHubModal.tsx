'use client';

import { useState } from 'react';
import { TriageResult, AppSettings } from '@/types';
import { Github, Check, Copy, ExternalLink, RefreshCw, X, AlertCircle } from 'lucide-react';

interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  triageResult: TriageResult;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export default function GitHubModal({
  isOpen,
  onClose,
  triageResult,
  settings,
  onUpdateSettings,
}: GitHubModalProps) {
  const [token, setToken] = useState(settings.githubToken);
  const [owner, setOwner] = useState(settings.githubOwner || 'acme-corp');
  const [repo, setRepo] = useState(settings.githubRepo || 'main-app');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    issueUrl?: string;
    issueNumber?: number;
    previewBody?: string;
    isMockPreview?: boolean;
    error?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    // Save settings for future use
    onUpdateSettings({
      ...settings,
      githubToken: token,
      githubOwner: owner,
      githubRepo: repo,
    });

    try {
      const res = await fetch('/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: triageResult.title,
          severity: triageResult.severity,
          category: triageResult.category,
          rootCause: triageResult.rootCause,
          suggestedFix: triageResult.suggestedFix,
          tags: triageResult.tags,
          repoOwner: owner,
          repoName: repo,
          githubToken: token,
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({ success: false, error: err.message || 'Failed to trigger GitHub API' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyBody = (body: string) => {
    navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-800 text-white">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Automated GitHub Issue Dispatch</h3>
              <p className="text-xs text-slate-400">
                Post formatted RCA & suggested patch directly to target repository.
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
        <div className="overflow-y-auto py-4 space-y-4 flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Repository Owner / Org
                </label>
                <input
                  type="text"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="e.g. acme-corp"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Repository Name
                </label>
                <input
                  type="text"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  placeholder="e.g. main-backend"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex justify-between">
                <span>GitHub Personal Access Token (PAT)</span>
                <span className="text-slate-500 text-[10px]">
                  (Optional - omit to preview formatted payload)
                </span>
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 border border-slate-700"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-300" />
                  <span>Connecting to GitHub REST API...</span>
                </>
              ) : (
                <>
                  <Github className="w-4 h-4 text-emerald-400" />
                  <span>Create GitHub Issue</span>
                </>
              )}
            </button>
          </form>

          {/* Results section */}
          {result && (
            <div className="pt-2 border-t border-slate-800 space-y-3">
              {result.success ? (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" />
                      {result.isMockPreview
                        ? 'Issue Payload Prepared (Mock Mode)'
                        : `GitHub Issue #${result.issueNumber} Created Successfully!`}
                    </span>
                    {result.issueUrl && (
                      <a
                        href={result.issueUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors"
                      >
                        Open Issue <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {result.previewBody && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-mono text-slate-400">
                          Formatted Issue Markdown Body:
                        </span>
                        <button
                          onClick={() => handleCopyBody(result.previewBody!)}
                          className="text-[11px] font-medium text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied ? 'Copied!' : 'Copy Body'}
                        </button>
                      </div>
                      <textarea
                        readOnly
                        value={result.previewBody}
                        rows={6}
                        className="w-full rounded-lg bg-slate-950 p-3 font-mono text-[11px] text-slate-300 border border-slate-800 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold">Failed to Create GitHub Issue</h4>
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
