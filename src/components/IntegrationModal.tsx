'use client';

import { useState, useEffect } from 'react';
import { X, Copy, Check, Code2, ShieldAlert, Terminal, Zap, Layers, Server } from 'lucide-react';

interface IntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
}

export default function IntegrationModal({
  isOpen,
  onClose,
  onShowToast,
}: IntegrationModalProps) {
  const [activeTab, setActiveTab] = useState<'curl' | 'node' | 'python' | 'go'>('node');
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<{ totalLogsIngested: number; uniqueLogs: number; duplicatesSkipped: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/ingest')
        .then((res) => res.json())
        .then((data) => {
          if (data.dedupStats) setStats(data.dedupStats);
        })
        .catch((err) => console.error('Failed to fetch dedup stats:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getOrigin = () => {
    if (typeof window !== 'undefined') return window.location.origin;
    return 'http://localhost:3000';
  };

  const endpointUrl = `${getOrigin()}/api/ingest`;

  const codeSnippets = {
    curl: `curl -X POST "${endpointUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "errorLog": "TypeError: Cannot read properties of undefined (reading \\"map\\") at UserList.jsx:42",
    "language": "React / Node.js",
    "environment": "Production",
    "serviceName": "user-service",
    "autoCreateGitHubIssue": true,
    "autoNotifyWebhook": true,
    "platform": "discord"
  }'`,

    node: `// Ingest crash log into AutoTriage AI from Node.js / Express global error handler
app.use(async (err, req, res, next) => {
  console.error("Express Error Handler Captured:", err);

  try {
    await fetch("${endpointUrl}", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        errorLog: err.stack || err.message,
        language: "Node.js / Express",
        environment: process.env.NODE_ENV || "Production",
        serviceName: "payment-api",
        autoCreateGitHubIssue: true, // Automatically opens GitHub issue if not a duplicate
        autoNotifyWebhook: true,     // Automatically alerts Discord/Slack if not a duplicate
      }),
    });
  } catch (e) {
    console.error("Failed to stream log to AutoTriage AI:", e);
  }

  res.status(500).json({ error: "Internal Server Error" });
});`,

    python: `# Python / FastAPI global exception handler integration
from fastapi import FastAPI, Request
import requests

app = FastAPI()

@app.middleware("http")
async def autotriage_exception_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as exc:
        import traceback
        stack_trace = traceback.format_exc()
        
        # Stream crash log to AutoTriage AI (skips duplicates automatically)
        try:
            requests.post(
                "${endpointUrl}",
                json={
                    "errorLog": stack_trace,
                    "language": "Python / FastAPI",
                    "environment": "Production",
                    "serviceName": "fastapi-backend",
                    "autoCreateGitHubIssue": True,
                    "autoNotifyWebhook": True
                },
                timeout=3
            )
        except Exception as e:
            print("AutoTriage log streaming error:", e)
            
        raise exc`,

    go: `// Go / Gin Framework Panic Recovery Middleware Integration
package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"runtime/debug"
)

func AutoTriageMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				stack := string(debug.Stack())

				payload := map[string]interface{}{
					"errorLog":              stack,
					"language":              "Go / Gin",
					"environment":           "Production",
					"serviceName":           "auth-gateway",
					"autoCreateGitHubIssue": true,
					"autoNotifyWebhook":     true,
				}

				body, _ := json.Marshal(payload)
				http.Post("${endpointUrl}", "application/json", bytes.NewBuffer(body))
				
				c.AbortWithStatusJSON(500, gin.H{"error": "Internal Server Error"})
			}
		}()
		c.Next()
	}
}`
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopied(true);
    onShowToast('success', 'Code Snippet Copied!', `Copied ${activeTab.toUpperCase()} integration code.`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-800 text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">External Service Ingestion & Deduplication</h3>
              <p className="text-xs text-slate-400">
                Connect microservices to auto-triage crash logs, auto-create GitHub issues, and dispatch alerts while skipping duplicate errors.
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
        <div className="overflow-y-auto py-4 space-y-4 flex-1">
          {/* Deduplication Engine Banner */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" /> Duplicate Log Deduplication Protection
              </span>
              <span className="text-[10px] font-mono text-slate-500">SHA-256 Fingerprinting Active</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              When an external backend streams a crash log, AutoTriage AI computes a normalized fingerprint (stripping timestamps, memory addresses, and IPs). If an identical crash recurs within the TTL window, GitHub issue creation and Webhook alerts are automatically <strong>skipped to prevent notification spam</strong>.
            </p>

            {/* Deduplication Stats Counter */}
            {stats && (
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 font-mono text-xs">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-center">
                  <div className="text-slate-500 text-[10px]">Total Ingested</div>
                  <div className="text-white font-bold">{stats.totalLogsIngested}</div>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-center">
                  <div className="text-slate-500 text-[10px]">Unique Errors</div>
                  <div className="text-emerald-400 font-bold">{stats.uniqueLogs}</div>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-center">
                  <div className="text-slate-500 text-[10px]">Duplicates Skipped</div>
                  <div className="text-amber-400 font-bold">{stats.duplicatesSkipped}</div>
                </div>
              </div>
            )}
          </div>

          {/* Ingestion API Endpoint Bar */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">Ingestion Webhook Endpoint</span>
              <div className="text-xs font-mono text-emerald-300 font-semibold truncate">{endpointUrl}</div>
            </div>
            <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold shrink-0">
              POST Endpoint
            </span>
          </div>

          {/* Code Snippets Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Backend Service Code Snippets:</span>
              <button
                onClick={handleCopyCode}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied Code!' : `Copy ${activeTab.toUpperCase()} Snippet`}
              </button>
            </div>

            {/* Language Tabs */}
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('node')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  activeTab === 'node' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Node.js / Express
              </button>
              <button
                onClick={() => setActiveTab('python')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  activeTab === 'python' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Python / FastAPI
              </button>
              <button
                onClick={() => setActiveTab('go')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  activeTab === 'go' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Go / Gin
              </button>
              <button
                onClick={() => setActiveTab('curl')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  activeTab === 'curl' ? 'bg-slate-800 text-slate-200 shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                cURL
              </button>
            </div>

            {/* Code Block Container */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs overflow-x-auto max-h-64">
              <pre className="text-slate-300 leading-relaxed whitespace-pre">{codeSnippets[activeTab]}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
