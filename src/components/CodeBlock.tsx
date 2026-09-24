'use client';

import { useState } from 'react';
import { Check, Copy, Code, FileCode } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export default function CodeBlock({ code, language = 'diff', title = 'Suggested Patch' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Process code lines for basic diff highlighting (+ and -)
  const lines = code.split('\n');

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-200">{title}</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      <div className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed bg-slate-950">
        <pre className="text-slate-200">
          {lines.map((line, idx) => {
            let lineStyle = 'text-slate-300';
            let bgStyle = '';

            if (line.startsWith('+') && !line.startsWith('+++')) {
              lineStyle = 'text-emerald-400 font-medium';
              bgStyle = 'bg-emerald-950/40 -mx-4 px-4 py-0.5 block border-l-2 border-emerald-500';
            } else if (line.startsWith('-') && !line.startsWith('---')) {
              lineStyle = 'text-rose-400 line-through opacity-80';
              bgStyle = 'bg-rose-950/40 -mx-4 px-4 py-0.5 block border-l-2 border-rose-500';
            } else if (line.startsWith('@@') || line.startsWith('//')) {
              lineStyle = 'text-cyan-400 italic';
            } else if (line.startsWith('export') || line.startsWith('import') || line.startsWith('function') || line.startsWith('const')) {
              lineStyle = 'text-purple-300';
            }

            return (
              <span key={idx} className={`${bgStyle} flex items-start gap-4`}>
                <span className="text-slate-600 select-none w-6 text-right shrink-0 text-[11px] pt-0.5">
                  {idx + 1}
                </span>
                <span className={`${lineStyle} whitespace-pre`}>{line || ' '}</span>
              </span>
            );
          })}
        </pre>
      </div>
    </div>
  );
}
