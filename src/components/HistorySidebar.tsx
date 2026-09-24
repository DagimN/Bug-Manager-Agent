'use client';

import { useState } from 'react';
import { TriageResult } from '@/types';
import { History, X, Search, Trash2, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: TriageResult[];
  onSelectResult: (result: TriageResult) => void;
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
}

export default function HistorySidebar({
  isOpen,
  onClose,
  history,
  onSelectResult,
  onClearHistory,
  onDeleteHistoryItem,
}: HistorySidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = filterSeverity === 'ALL' || item.severity === filterSeverity;

    return matchesSearch && matchesSeverity;
  });

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case 'P0-Critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'P1-High':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'P2-Medium':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'P3-Low':
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-semibold text-white">Triage History Logs</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300">
              {history.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-950/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search past bugs, tags, category..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
            {['ALL', 'P0-Critical', 'P1-High', 'P2-Medium', 'P3-Low'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded-md font-medium shrink-0 transition-colors ${
                  filterSeverity === sev
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs">No matching triage logs found in history.</p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 hover:border-emerald-500/50 transition-all cursor-pointer shadow-sm"
                onClick={() => {
                  onSelectResult(item);
                  onClose();
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadgeClass(
                      item.severity
                    )}`}
                  >
                    {item.severity}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors line-clamp-2">
                  {item.title}
                </h4>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    {item.category}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteHistoryItem(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-all"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
            <span className="text-xs text-slate-500">Stored in local session</span>
            <button
              onClick={onClearHistory}
              className="text-xs text-rose-400 hover:underline flex items-center gap-1 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All History
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
